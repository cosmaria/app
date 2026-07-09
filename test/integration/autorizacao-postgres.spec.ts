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
 * Integração de Autorização (RBAC, doc 04 §11) contra PostgreSQL real.
 * Prova o ciclo: papéis PERSISTIDOS na coluna core.usuario.papeis → login coloca
 * no token → PoliticaDeAutorizacao decide. Inclui a elevação a ADMIN (que uma
 * épica administrativa futura fará por API) refletindo no próximo login.
 */
describe('Autorização contra Postgres real (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;

  const cred = { email: 'rbac@cosmaria.app', senha: 'senhaSegura123' };

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
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    pool = criarPgPool(pg.getConnectionUri());
  }, 180_000);

  afterAll(async () => {
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  const server = () => app.getHttpServer();
  const login = async () =>
    (await request(server()).post('/v1/auth/login').send(cred)).body.accessToken as string;

  it('conta nova nasce com papel USUARIO persistido no banco', async () => {
    const reg = await request(server()).post('/v1/auth/register').send(cred);
    expect(reg.status).toBe(201);

    const { rows } = await pool.query<{ papeis: string[] }>(
      `SELECT papeis FROM core.usuario WHERE email = $1`,
      [cred.email],
    );
    expect(rows[0].papeis).toEqual(['USUARIO']);
  });

  it('USUARIO comum não tem GERIR_PLATAFORMA', async () => {
    const token = await login();
    const res = await request(server())
      .get('/v1/autorizacao/verificar?permissao=GERIR_PLATAFORMA')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.permitido).toBe(false);
  });

  it('elevar a ADMIN no banco reflete no token do próximo login', async () => {
    await pool.query(`UPDATE core.usuario SET papeis = ARRAY['USUARIO','ADMIN'] WHERE email = $1`, [
      cred.email,
    ]);

    const token = await login();

    const eu = await request(server())
      .get('/v1/autorizacao/eu')
      .set('Authorization', `Bearer ${token}`);
    expect(eu.status).toBe(200);
    expect(eu.body.papeis).toEqual(expect.arrayContaining(['ADMIN']));

    const verif = await request(server())
      .get('/v1/autorizacao/verificar?permissao=GERIR_PLATAFORMA')
      .set('Authorization', `Bearer ${token}`);
    expect(verif.body.permitido).toBe(true);
  });
});
