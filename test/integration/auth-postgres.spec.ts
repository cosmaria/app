import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import { AppModule } from '../../apps/api/src/app/app.module';
import { DomainExceptionFilter } from '../../apps/api/src/app/auth/domain-exception.filter';
import { aplicarMigrations, iniciarPostgres, iniciarRedis } from './support/containers';

/**
 * A validação de ponta a ponta da Sprint: sobe o Modular Monolith INTEIRO contra
 * PostgreSQL + Redis REAIS (Testcontainers), com as migrations aplicadas, e exercita
 * o health readiness real + o fluxo de auth persistido no banco. É a prova de que a
 * fundação técnica funciona em ambiente real, não só in-memory.
 */
describe('Auth + Health contra Postgres/Redis reais (integração ponta a ponta)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;

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
    app.enableShutdownHooks();
    await app.init();
  }, 180_000);

  afterAll(async () => {
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  const server = () => app.getHttpServer();
  const cred = { email: 'pg-e2e@cosmaria.app', senha: 'senhaSegura123' };

  it('GET /v1/health/ready = 200 consultando Postgres e Redis reais', async () => {
    const res = await request(server()).get('/v1/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.info.postgres.status).toBe('up');
    expect(res.body.info.redis.status).toBe('up');
  });

  it('fluxo register → login → refresh (rotação) persistido no Postgres real', async () => {
    const reg = await request(server()).post('/v1/auth/register').send(cred);
    expect(reg.status).toBe(201);
    expect(reg.body.usuarioId).toBeTruthy();

    const login = await request(server()).post('/v1/auth/login').send(cred);
    expect(login.status).toBe(200);
    const refreshToken: string = login.body.refreshToken;
    expect(refreshToken).toBeTruthy();

    const refreshed = await request(server()).post('/v1/auth/refresh').send({ refreshToken });
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.refreshToken).not.toBe(refreshToken);

    // Reuso do refresh antigo é rejeitado — a rotação foi persistida no banco real.
    const reuse = await request(server()).post('/v1/auth/refresh').send({ refreshToken });
    expect(reuse.status).toBe(401);
    expect(reuse.body.code).toBe('SESSAO_INVALIDA');
  });

  it('o usuário registrado existe de fato na tabela core.usuario', async () => {
    const login = await request(server()).post('/v1/auth/login').send(cred);
    expect(login.status).toBe(200); // só passa se o SELECT real encontrou o usuário
  });
});
