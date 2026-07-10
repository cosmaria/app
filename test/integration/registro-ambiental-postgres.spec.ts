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
 * Integração do Registro Ambiental (doc 02 §5.6) contra PostgreSQL real.
 *
 * Prova o que só o banco real prova: `NUMERIC` volta como string do driver `pg` e é
 * convertido na fronteira; os CHECKs físicos rejeitam ruído de sensor; e o histórico
 * some junto com o ciclo (CASCADE dentro do mesmo schema).
 */
describe('Registro Ambiental contra Postgres real (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let token = '';
  let cicloId = '';
  let plantaId = '';

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

    const cred = { email: 'checkin@cosmaria.app', senha: 'senhaSegura123' };
    await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    const login = await request(app.getHttpServer()).post('/v1/auth/login').send(cred);
    token = login.body.accessToken;

    const auth = { Authorization: `Bearer ${token}` };
    const genetica = await request(app.getHttpServer())
      .post('/v1/geneticas')
      .set(auth)
      .send({ nome: 'OG Kush', tipo: 'FOTOPERIODICA' });
    const ambiente = await request(app.getHttpServer())
      .post('/v1/ambientes')
      .set(auth)
      .send({ nome: 'Estufa 1', tipo: 'INDOOR' });
    const ciclo = await request(app.getHttpServer())
      .post('/v1/ciclos')
      .set(auth)
      .send({ ambienteId: ambiente.body.ambienteId, nome: 'Ciclo 1' });
    cicloId = ciclo.body.cicloId;
    const planta = await request(app.getHttpServer()).post('/v1/plantas').set(auth).send({
      cicloId,
      geneticaId: genetica.body.geneticaId,
      nome: 'Planta 1',
      origem: 'SEMENTE',
    });
    plantaId = planta.body.plantaId;
  }, 180_000);

  afterAll(async () => {
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });
  const server = () => app.getHttpServer();

  it('persiste os brutos e os derivados no schema grow', async () => {
    const resposta = await request(server())
      .post('/v1/registros-ambientais')
      .set(auth())
      .send({ cicloId, temperaturaC: 25, umidadeRelativa: 60, ppfd: 600, horasDeLuz: 18 })
      .expect(201);

    const { rows } = await pool.query<{
      temperatura_c: string;
      vpd_kpa: string;
      dli: string;
      origem: string;
    }>(`SELECT temperatura_c, vpd_kpa, dli, origem FROM grow.registro_ambiental WHERE id = $1`, [
      resposta.body.registroId,
    ]);

    // NUMERIC volta como string do driver pg — é por isso que a conversão existe.
    expect(typeof rows[0].vpd_kpa).toBe('string');
    expect(Number(rows[0].vpd_kpa)).toBeCloseTo(1.267, 2);
    expect(Number(rows[0].dli)).toBeCloseTo(38.88, 2);
    expect(rows[0].origem).toBe('MANUAL');
  });

  it('a releitura devolve NÚMEROS, não strings — a conversão acontece na fronteira', async () => {
    const serie = await request(server())
      .get(`/v1/ciclos/${cicloId}/registros-ambientais`)
      .set(auth())
      .expect(200);

    const item = serie.body.itens[0];
    expect(typeof item.temperaturaC).toBe('number');
    expect(typeof item.vpdKpa).toBe('number');
    expect(item.vpdKpa).toBeCloseTo(1.267, 2);
  });

  it('aceita medição específica de uma planta', async () => {
    await request(server())
      .post('/v1/registros-ambientais')
      .set(auth())
      .send({ cicloId, plantaId, ph: 6.2, ec: 1.8 })
      .expect(201);

    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM grow.registro_ambiental WHERE planta_id = $1`,
      [plantaId],
    );
    expect(rows[0].total).toBe('1');
  });

  it('o banco recusa umidade impossível (defesa em profundidade)', async () => {
    await expect(
      pool.query(
        `INSERT INTO grow.registro_ambiental (id, usuario_id, ciclo_id, umidade_relativa)
         VALUES (gen_random_uuid(), gen_random_uuid(), $1, 150)`,
        [cicloId],
      ),
    ).rejects.toThrow(/ck_registro_umidade/);
  });

  it('o banco recusa um registro sem nenhuma medição', async () => {
    await expect(
      pool.query(
        `INSERT INTO grow.registro_ambiental (id, usuario_id, ciclo_id, observacoes)
         VALUES (gen_random_uuid(), gen_random_uuid(), $1, 'vazio')`,
        [cicloId],
      ),
    ).rejects.toThrow(/ck_registro_alguma_medicao/);
  });

  it('o banco recusa origem fora do catálogo', async () => {
    await expect(
      pool.query(`UPDATE grow.registro_ambiental SET origem = 'ADIVINHADO' WHERE ciclo_id = $1`, [
        cicloId,
      ]),
    ).rejects.toThrow(/ck_registro_origem/);
  });

  it('a série é append-only: dois check-ins do mesmo instante coexistem', async () => {
    const instante = new Date('2026-07-01T12:00:00.000Z').toISOString();
    await request(server())
      .post('/v1/registros-ambientais')
      .set(auth())
      .send({ cicloId, registradoEm: instante, temperaturaC: 21, umidadeRelativa: 55 })
      .expect(201);
    await request(server())
      .post('/v1/registros-ambientais')
      .set(auth())
      .send({ cicloId, registradoEm: instante, temperaturaC: 22, umidadeRelativa: 56 })
      .expect(201);

    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM grow.registro_ambiental
        WHERE ciclo_id = $1 AND registrado_em = $2`,
      [cicloId, instante],
    );
    // Corrigir uma medição é registrar outra — nunca sobrescrever a anterior.
    expect(rows[0].total).toBe('2');
  });

  it('o histórico some junto com o ciclo (CASCADE dentro do schema grow)', async () => {
    await pool.query(`DELETE FROM grow.ciclo_cultivo WHERE id = $1`, [cicloId]);
    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM grow.registro_ambiental WHERE ciclo_id = $1`,
      [cicloId],
    );
    expect(rows[0].total).toBe('0');
  });
});
