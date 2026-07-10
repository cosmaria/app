import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Pool } from 'pg';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import { criarPgPool } from '@cosmaria/core-infrastructure';
import { AppModule } from '../../apps/api/src/app/app.module';
import { DomainExceptionFilter } from '../../apps/api/src/app/auth/domain-exception.filter';
import { aplicarMigrations, iniciarPostgres, iniciarRedis } from './support/containers';

/**
 * Integração do núcleo do Grow (doc 02) contra PostgreSQL real.
 *
 * Prova o que só o banco real prova: o schema `grow` existe separado do `core` (schema
 * por módulo, doc 04 §16), nenhuma FK atravessa schemas (doc 08 §11), o histórico de
 * transições persiste como JSONB, e os CHECKs de fase/tipo defendem os catálogos.
 */
describe('Grow contra Postgres real (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let usuarioId: string;
  let token = '';

  beforeAll(async () => {
    pg = await iniciarPostgres();
    redis = await iniciarRedis();
    await aplicarMigrations(pg.getConnectionUri());

    process.env.AUTH_REPO = 'postgres';
    process.env.DATABASE_URL = pg.getConnectionUri();
    process.env.REDIS_URL = redis.getConnectionUrl();
    process.env.ACCESS_TOKEN_SECRET = 'test-access';
    process.env.REFRESH_TOKEN_SECRET = 'test-refresh';

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ rawBody: true });
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    pool = criarPgPool(pg.getConnectionUri());

    const cred = { email: 'grow@cosmaria.app', senha: 'senhaSegura123' };
    const reg = await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    usuarioId = reg.body.usuarioId;
    const login = await request(app.getHttpServer()).post('/v1/auth/login').send(cred);
    token = login.body.accessToken;
  }, 180_000);

  afterAll(async () => {
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });
  const server = () => app.getHttpServer();

  let geneticaId = '';
  let ambienteId = '';
  let cicloId = '';

  it('o schema grow existe, separado do core (schema por módulo)', async () => {
    const { rows } = await pool.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'grow' ORDER BY table_name`,
    );
    expect(rows.map((r) => r.table_name)).toEqual([
      'ambiente',
      'ciclo_cultivo',
      'genetica',
      'planta',
    ]);
  });

  it('nenhuma FK do schema grow aponta para o schema core (doc 08 §11)', async () => {
    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total
         FROM information_schema.table_constraints tc
         JOIN information_schema.constraint_column_usage ccu
           ON tc.constraint_name = ccu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
          AND tc.table_schema = 'grow'
          AND ccu.table_schema <> 'grow'`,
    );
    expect(rows[0].total).toBe('0');
  });

  it('a genética persiste no schema grow, referenciando a Conta só por id', async () => {
    const resposta = await request(server())
      .post('/v1/geneticas')
      .set(auth())
      .send({ nome: 'OG Kush', tipo: 'FOTOPERIODICA', linhagem: 'Chemdawg x Hindu Kush' })
      .expect(201);
    geneticaId = resposta.body.geneticaId;

    const { rows } = await pool.query<{ usuario_id: string; tipo: string }>(
      `SELECT usuario_id, tipo FROM grow.genetica WHERE id = $1`,
      [geneticaId],
    );
    expect(rows[0]).toEqual({ usuario_id: usuarioId, tipo: 'FOTOPERIODICA' });
  });

  it('o banco recusa tipo de genética fora do catálogo (defesa em profundidade)', async () => {
    await expect(
      pool.query(`UPDATE grow.genetica SET tipo = 'HIBRIDA_MAGICA' WHERE id = $1`, [geneticaId]),
    ).rejects.toThrow(/ck_genetica_tipo/);
  });

  it('o ambiente persiste e alimenta a contagem do gate de limite', async () => {
    const resposta = await request(server())
      .post('/v1/ambientes')
      .set(auth())
      .send({ nome: 'Estufa 1', tipo: 'INDOOR', larguraCm: 100 })
      .expect(201);
    ambienteId = resposta.body.ambienteId;

    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM grow.ambiente WHERE usuario_id = $1`,
      [usuarioId],
    );
    expect(rows[0].total).toBe('1');
  });

  it('o gate de Premium barra o terceiro ambiente, com o limite vindo da migration', async () => {
    await request(server())
      .post('/v1/ambientes')
      .set(auth())
      .send({ nome: 'Estufa 2', tipo: 'ESTUFA' })
      .expect(201);

    await request(server())
      .post('/v1/ambientes')
      .set(auth())
      .send({ nome: 'Estufa 3', tipo: 'ESTUFA' })
      .expect(402)
      .expect((r) => expect(r.body.code).toBe('LIMITE_DE_PLANO_ATINGIDO'));
  });

  it('o histórico de transições do ciclo persiste como JSONB', async () => {
    const resposta = await request(server())
      .post('/v1/ciclos')
      .set(auth())
      .send({ ambienteId, nome: 'Ciclo 1' })
      .expect(201);
    cicloId = resposta.body.cicloId;

    await request(server())
      .post(`/v1/ciclos/${cicloId}/fase`)
      .set(auth())
      .send({ fase: 'VEGETATIVO' })
      .expect(201);

    const { rows } = await pool.query<{
      fase_atual: string;
      transicoes: { fase: string; ocorridaEm: string }[];
    }>(`SELECT fase_atual, transicoes FROM grow.ciclo_cultivo WHERE id = $1`, [cicloId]);

    expect(rows[0].fase_atual).toBe('VEGETATIVO');
    expect(rows[0].transicoes.map((t) => t.fase)).toEqual(['GERMINACAO', 'VEGETATIVO']);
    // A data volta como texto ISO e é reidratada pelo repositório.
    expect(Date.parse(rows[0].transicoes[1].ocorridaEm)).not.toBeNaN();
  });

  it('a planta referencia ciclo e genética por FK dentro do próprio schema', async () => {
    const resposta = await request(server())
      .post('/v1/plantas')
      .set(auth())
      .send({ cicloId, geneticaId, nome: 'Planta 1', origem: 'SEMENTE' })
      .expect(201);

    const { rows } = await pool.query<{
      ciclo_id: string;
      genetica_id: string;
      fase_atual: string;
    }>(`SELECT ciclo_id, genetica_id, fase_atual FROM grow.planta WHERE id = $1`, [
      resposta.body.plantaId,
    ]);
    expect(rows[0]).toEqual({
      ciclo_id: cicloId,
      genetica_id: geneticaId,
      fase_atual: 'GERMINACAO',
    });
  });

  it('o banco recusa fase fora do catálogo', async () => {
    await expect(
      pool.query(`UPDATE grow.planta SET fase_atual = 'COLHIDA' WHERE ciclo_id = $1`, [cicloId]),
    ).rejects.toThrow(/ck_planta_fase/);
  });

  it('a FK impede excluir genética em uso, mesmo por SQL direto', async () => {
    await expect(
      pool.query(`DELETE FROM grow.genetica WHERE id = $1`, [geneticaId]),
    ).rejects.toThrow(/planta_genetica_id_fkey/);
  });

  it('excluir o ciclo leva as plantas junto (CASCADE dentro do schema)', async () => {
    await pool.query(`DELETE FROM grow.ciclo_cultivo WHERE id = $1`, [cicloId]);
    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM grow.planta WHERE ciclo_id = $1`,
      [cicloId],
    );
    expect(rows[0].total).toBe('0');
  });

  it('excluir a Conta NÃO apaga o Grow por CASCADE — o expurgo é por evento (doc 08 §11)', async () => {
    await pool.query(`DELETE FROM core.usuario WHERE id = $1`, [usuarioId]);

    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM grow.ambiente WHERE usuario_id = $1`,
      [usuarioId],
    );
    // Sem FK entre schemas, o dado sobrevive à exclusão da Conta: quem o remove é o
    // consumidor de `ContaExclusaoSolicitada`, em sprint futura de LGPD por módulo.
    expect(Number(rows[0].total)).toBeGreaterThan(0);
  });
});
