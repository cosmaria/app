import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Pool } from 'pg';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import { assinarPayloadWebhook, criarPgPool } from '@cosmaria/core-infrastructure';
import { AppModule } from '../../apps/api/src/app/app.module';
import { DomainExceptionFilter } from '../../apps/api/src/app/auth/domain-exception.filter';
import { aplicarMigrations, iniciarPostgres, iniciarRedis } from './support/containers';

const SEGREDO = 'segredo-de-teste';

/**
 * Integração de Modelos de Ciclo (doc 02 §7) contra PostgreSQL real.
 *
 * Prova: persistência do template; o CHECK de fase; e a referência FRACA — excluir a
 * genética padrão zera `genetica_id` do modelo (ON DELETE SET NULL), sem apagar o modelo.
 */
describe('Modelos de Ciclo contra Postgres real (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let token = '';
  let usuarioId = '';
  let geneticaId = '';

  beforeAll(async () => {
    pg = await iniciarPostgres();
    redis = await iniciarRedis();
    await aplicarMigrations(pg.getConnectionUri());

    process.env.AUTH_REPO = 'postgres';
    process.env.DATABASE_URL = pg.getConnectionUri();
    process.env.REDIS_URL = redis.getConnectionUrl();
    process.env.ACCESS_TOKEN_SECRET = 'test-access';
    process.env.REFRESH_TOKEN_SECRET = 'test-refresh';
    process.env.PAGAMENTO_WEBHOOK_SECRET = SEGREDO;

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ rawBody: true });
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    pool = criarPgPool(pg.getConnectionUri());

    const cred = { email: 'modelos@cosmaria.app', senha: 'senhaSegura123' };
    const reg = await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    usuarioId = reg.body.usuarioId;
    token = (await request(app.getHttpServer()).post('/v1/auth/login').send(cred)).body.accessToken;

    // Concede Premium via webhook assinado.
    const payload = {
      id: 'evt-1',
      tipo: 'PAGAMENTO_RECEBIDO',
      usuarioId,
      vigenteAte: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    };
    const corpo = JSON.stringify(payload);
    await request(app.getHttpServer())
      .post('/v1/webhooks/pagamento')
      .set('Content-Type', 'application/json')
      .set('x-cosmaria-assinatura', assinarPayloadWebhook(Buffer.from(corpo), SEGREDO))
      .send(corpo)
      .expect(200);

    geneticaId = (
      await request(app.getHttpServer())
        .post('/v1/geneticas')
        .set({ Authorization: `Bearer ${token}` })
        .send({ nome: 'OG', tipo: 'FOTOPERIODICA' })
    ).body.geneticaId;
  }, 180_000);

  afterAll(async () => {
    delete process.env.PAGAMENTO_WEBHOOK_SECRET;
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });
  const server = () => app.getHttpServer();

  let modeloId = '';

  it('persiste o modelo com a genética padrão', async () => {
    const r = await request(server())
      .post('/v1/ciclos/modelos')
      .set(auth())
      .send({ nome: 'Template OG', geneticaId, faseInicial: 'GERMINACAO' })
      .expect(201);
    modeloId = r.body.modeloId;

    const { rows } = await pool.query<{ genetica_id: string | null; nome: string }>(
      `SELECT genetica_id, nome FROM grow.modelo_de_ciclo WHERE id = $1`,
      [modeloId],
    );
    expect(rows[0].nome).toBe('Template OG');
    expect(rows[0].genetica_id).toBe(geneticaId);
  });

  it('o banco recusa fase inválida', async () => {
    await expect(
      pool.query(
        `INSERT INTO grow.modelo_de_ciclo (id, usuario_id, nome, fase_inicial)
         VALUES (gen_random_uuid(), gen_random_uuid(), 'x', 'FASE_FALSA')`,
      ),
    ).rejects.toThrow(/ck_modelo_fase/);
  });

  it('excluir a genética zera o padrão do modelo, sem apagá-lo (SET NULL)', async () => {
    // A genética não tem plantas, então pode ser excluída pelo endpoint.
    await request(server()).delete(`/v1/geneticas/${geneticaId}`).set(auth()).expect(204);

    const { rows } = await pool.query<{ genetica_id: string | null }>(
      `SELECT genetica_id FROM grow.modelo_de_ciclo WHERE id = $1`,
      [modeloId],
    );
    expect(rows).toHaveLength(1); // o modelo continua existindo
    expect(rows[0].genetica_id).toBeNull(); // mas o padrão foi zerado
  });
});
