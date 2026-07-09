import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Pool } from 'pg';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import { criarPgPool, JwtTokenService } from '@cosmaria/core-infrastructure';
import { Papel } from '@cosmaria/core-domain';
import { AppModule } from '../../apps/api/src/app/app.module';
import { DomainExceptionFilter } from '../../apps/api/src/app/auth/domain-exception.filter';
import { aplicarMigrations, iniciarPostgres, iniciarRedis } from './support/containers';

/**
 * Integração de Consentimento/LGPD/Auditoria contra PostgreSQL real. Prova a
 * persistência e o caminho do EDA (evento → assinante de auditoria → tabela real),
 * além da exclusão de conta persistida.
 */
describe('LGPD & Auditoria contra Postgres real (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  const cred = { email: 'lgpd-int@cosmaria.app', senha: 'senhaSegura123' };
  let token = '';

  const tokenAdmin = (): string =>
    new JwtTokenService({
      accessSecret: 'test-access',
      refreshSecret: 'test-refresh',
      accessTtlSegundos: 900,
      refreshTtlSegundos: 3600,
    }).gerarAccessToken({ usuarioId: 'admin', email: 'a@a.com', papeis: [Papel.ADMIN] }).token;

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
    await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    token = (await request(app.getHttpServer()).post('/v1/auth/login').send(cred)).body.accessToken;
  }, 180_000);

  afterAll(async () => {
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  const server = () => app.getHttpServer();

  it('consentimento persiste e gera entrada de auditoria (EDA → tabela real)', async () => {
    await request(server())
      .post('/v1/consentimento')
      .set('Authorization', `Bearer ${token}`)
      .send({ tipo: 'INSIGHTS_AGREGADOS', versaoTexto: 'v2' })
      .expect(201);

    const consentimentos = await pool.query(
      `SELECT tipo, revogado_em FROM core.consentimento_registro WHERE tipo = 'INSIGHTS_AGREGADOS'`,
    );
    expect(consentimentos.rowCount).toBe(1);
    expect(consentimentos.rows[0].revogado_em).toBeNull();

    const auditoria = await pool.query(
      `SELECT acao FROM core.trilha_de_auditoria WHERE entidade_afetada = 'ConsentimentoRegistro'`,
    );
    expect(auditoria.rowCount ?? 0).toBeGreaterThanOrEqual(1);
    expect(auditoria.rows[0].acao).toBe('CONCEDIDO');
  });

  it('admin lê a trilha de auditoria (RBAC real)', async () => {
    const res = await request(server())
      .get('/v1/admin/trilha-auditoria')
      .set('Authorization', `Bearer ${tokenAdmin()}`);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('exclusão de conta persiste status EM_EXCLUSAO e bloqueia novo login', async () => {
    await request(server())
      .post('/v1/conta/excluir')
      .set('Authorization', `Bearer ${token}`)
      .expect(202);

    const { rows } = await pool.query(`SELECT status FROM core.usuario WHERE email = $1`, [
      cred.email,
    ]);
    expect(rows[0].status).toBe('EM_EXCLUSAO');

    const login = await request(server()).post('/v1/auth/login').send(cred);
    expect(login.status).toBe(403);
  });
});
