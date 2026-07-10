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
 * Integração de Manejo e Sanidade (doc 02 §5.7/§5.8) contra PostgreSQL real.
 *
 * Prova: os CHECKs de catálogo e da resolução no banco; que a resolução é a única
 * mutação da sanidade; e que os eventos somem junto com o ciclo (CASCADE no schema grow).
 */
describe('Manejo e Sanidade contra Postgres real (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let token = '';
  let cicloId = '';

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

    const cred = { email: 'eventos@cosmaria.app', senha: 'senhaSegura123' };
    await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    token = (await request(app.getHttpServer()).post('/v1/auth/login').send(cred)).body.accessToken;
    const auth = { Authorization: `Bearer ${token}` };

    const g = await request(app.getHttpServer())
      .post('/v1/geneticas')
      .set(auth)
      .send({ nome: 'OG', tipo: 'FOTOPERIODICA' });
    const a = await request(app.getHttpServer())
      .post('/v1/ambientes')
      .set(auth)
      .send({ nome: 'E1', tipo: 'INDOOR' });
    const c = await request(app.getHttpServer())
      .post('/v1/ciclos')
      .set(auth)
      .send({ ambienteId: a.body.ambienteId, nome: 'Ciclo 1' });
    cicloId = c.body.cicloId;
    await request(app.getHttpServer())
      .post('/v1/plantas')
      .set(auth)
      .send({ cicloId, geneticaId: g.body.geneticaId, nome: 'P1', origem: 'SEMENTE' });
  }, 180_000);

  afterAll(async () => {
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });
  const server = () => app.getHttpServer();

  it('o manejo persiste no schema grow', async () => {
    const r = await request(server())
      .post('/v1/eventos-manejo')
      .set(auth())
      .send({ cicloId, tipo: 'TOPPING' })
      .expect(201);

    const { rows } = await pool.query<{ tipo: string }>(
      `SELECT tipo FROM grow.evento_manejo WHERE id = $1`,
      [r.body.eventoId],
    );
    expect(rows[0].tipo).toBe('TOPPING');
  });

  it('o banco recusa tipo de manejo fora do catálogo', async () => {
    await expect(
      pool.query(
        `INSERT INTO grow.evento_manejo (id, usuario_id, ciclo_id, tipo)
         VALUES (gen_random_uuid(), gen_random_uuid(), $1, 'MAGIA')`,
        [cicloId],
      ),
    ).rejects.toThrow(/ck_manejo_tipo/);
  });

  let sanidadeId = '';

  it('a sanidade nasce em aberto e a resolução é a única mutação', async () => {
    const r = await request(server())
      .post('/v1/eventos-sanidade')
      .set(auth())
      .send({ cicloId, tipo: 'PRAGA', severidade: 'MEDIA', descricao: 'ácaros' })
      .expect(201);
    sanidadeId = r.body.eventoId;

    let db = await pool.query<{ resolvido_em: Date | null; severidade: string }>(
      `SELECT resolvido_em, severidade FROM grow.evento_sanidade WHERE id = $1`,
      [sanidadeId],
    );
    expect(db.rows[0].resolvido_em).toBeNull();

    await request(server())
      .post(`/v1/eventos-sanidade/${sanidadeId}/resolver`)
      .set(auth())
      .send({ tratamentoAplicado: 'óleo de neem' })
      .expect(201);

    db = await pool.query(
      `SELECT resolvido_em, severidade FROM grow.evento_sanidade WHERE id = $1`,
      [sanidadeId],
    );
    // A severidade observada não mudou — só a resolução foi gravada.
    expect(db.rows[0].resolvido_em).not.toBeNull();
    expect(db.rows[0].severidade).toBe('MEDIA');
  });

  it('o banco recusa resolução anterior à ocorrência', async () => {
    await expect(
      pool.query(
        `UPDATE grow.evento_sanidade SET resolvido_em = ocorrido_em - interval '1 day' WHERE id = $1`,
        [sanidadeId],
      ),
    ).rejects.toThrow(/ck_sanidade_resolucao/);
  });

  it('o banco recusa severidade fora do catálogo', async () => {
    await expect(
      pool.query(`UPDATE grow.evento_sanidade SET severidade = 'CATASTROFICA' WHERE id = $1`, [
        sanidadeId,
      ]),
    ).rejects.toThrow(/ck_sanidade_severidade/);
  });

  it('o índice parcial de abertos reflete a resolução', async () => {
    await request(server())
      .post('/v1/eventos-sanidade')
      .set(auth())
      .send({ cicloId, tipo: 'DOENCA', severidade: 'ALTA' })
      .expect(201);

    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM grow.evento_sanidade
        WHERE ciclo_id = $1 AND resolvido_em IS NULL`,
      [cicloId],
    );
    expect(rows[0].total).toBe('1');
  });

  it('manejo e sanidade somem junto com o ciclo (CASCADE no schema grow)', async () => {
    await pool.query(`DELETE FROM grow.ciclo_cultivo WHERE id = $1`, [cicloId]);
    const manejo = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM grow.evento_manejo WHERE ciclo_id = $1`,
      [cicloId],
    );
    const sanidade = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM grow.evento_sanidade WHERE ciclo_id = $1`,
      [cicloId],
    );
    expect(manejo.rows[0].total).toBe('0');
    expect(sanidade.rows[0].total).toBe('0');
  });
});
