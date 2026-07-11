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
 * Integração do Módulo Outdoor (doc 02 §6) contra PostgreSQL real.
 *
 * Prova: persistência e upsert por ambiente (UNIQUE = 0—1); os CHECKs de fonte e de faixa
 * de coordenadas; e o CASCADE junto do ambiente.
 */
describe('Módulo Outdoor contra Postgres real (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let token = '';
  let ambienteId = '';

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

    const cred = { email: 'outdoor@cosmaria.app', senha: 'senhaSegura123' };
    await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    token = (await request(app.getHttpServer()).post('/v1/auth/login').send(cred)).body.accessToken;
    ambienteId = (
      await request(app.getHttpServer())
        .post('/v1/ambientes')
        .set({ Authorization: `Bearer ${token}` })
        .send({ nome: 'Quintal', tipo: 'OUTDOOR' })
    ).body.ambienteId;
  }, 180_000);

  afterAll(async () => {
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });
  const server = () => app.getHttpServer();

  it('persiste e faz upsert por ambiente (0—1)', async () => {
    await request(server())
      .put(`/v1/ambientes/${ambienteId}/clima`)
      .set(auth())
      .send({ localizacaoAproximada: 'Curitiba, PR', latitudeAproximada: -25.42 })
      .expect(200);
    await request(server())
      .put(`/v1/ambientes/${ambienteId}/clima`)
      .set(auth())
      .send({ localizacaoAproximada: 'São Paulo, SP' })
      .expect(200);

    const { rows } = await pool.query<{ total: string; loc: string }>(
      `SELECT count(*) AS total, max(localizacao_aproximada) AS loc
         FROM grow.dados_climaticos WHERE ambiente_id = $1`,
      [ambienteId],
    );
    expect(rows[0].total).toBe('1'); // upsert, não duplicou
    expect(rows[0].loc).toBe('São Paulo, SP');
  });

  it('o banco recusa fonte fora do catálogo', async () => {
    await expect(
      pool.query(
        `INSERT INTO grow.dados_climaticos (id, usuario_id, ambiente_id, fonte)
         VALUES (gen_random_uuid(), gen_random_uuid(), gen_random_uuid(), 'INVENTADA')`,
      ),
    ).rejects.toThrow(/ck_clima_fonte/);
  });

  it('o banco recusa latitude fora da faixa física', async () => {
    await expect(
      pool.query(
        `UPDATE grow.dados_climaticos SET latitude_aproximada = 200 WHERE ambiente_id = $1`,
        [ambienteId],
      ),
    ).rejects.toThrow(/ck_clima_latitude/);
  });

  it('os dados climáticos somem junto com o ambiente (CASCADE)', async () => {
    await pool.query(`DELETE FROM grow.ambiente WHERE id = $1`, [ambienteId]);
    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM grow.dados_climaticos WHERE ambiente_id = $1`,
      [ambienteId],
    );
    expect(rows[0].total).toBe('0');
  });
});
