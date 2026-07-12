import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import { criarPgPool } from '@cosmaria/core-infrastructure';
import { AppModule } from '../../apps/api/src/app/app.module';
import { DomainExceptionFilter } from '../../apps/api/src/app/auth/domain-exception.filter';
import {
  aguardarAte,
  aplicarMigrations,
  iniciarPostgres,
  iniciarRedis,
} from './support/containers';

/**
 * Transporte durável do barramento (doc 04 §9) contra Postgres real. Prova, no nível do banco,
 * que um evento no `core.outbox` é entregue de forma assíncrona ao consumidor (IA), que a linha
 * transiciona para ENTREGUE, e que uma REENTREGA do mesmo evento (at-least-once) não duplica o
 * efeito — a ingestão da IA é idempotente pela chave `evento.id` (doc 04 §659).
 */
describe('Outbox — entrega assíncrona e idempotente (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let usuarioId = '';

  beforeAll(async () => {
    pg = await iniciarPostgres();
    redis = await iniciarRedis();
    await aplicarMigrations(pg.getConnectionUri());

    process.env.AUTH_REPO = 'postgres';
    process.env.DATABASE_URL = pg.getConnectionUri();
    process.env.REDIS_URL = redis.getConnectionUrl();
    process.env.ACCESS_TOKEN_SECRET = 'test-access';
    process.env.REFRESH_TOKEN_SECRET = 'test-refresh';
    process.env.OUTBOX_POLL_MS = '50';

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ rawBody: true });
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    pool = criarPgPool(pg.getConnectionUri());

    const cred = { email: 'outbox@cosmaria.app', senha: 'senhaSegura123' };
    const reg = await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    usuarioId = reg.body.usuarioId;
  }, 180_000);

  afterAll(async () => {
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  const contarDoses = async (): Promise<number> => {
    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM ia.ponto_serie WHERE usuario_id = $1 AND fator = 'DOSE'`,
      [usuarioId],
    );
    return Number(rows[0].total);
  };

  const statusDe = async (id: string): Promise<string> => {
    const { rows } = await pool.query<{ status: string }>(
      `SELECT status FROM core.outbox WHERE id = $1`,
      [id],
    );
    return rows[0]?.status;
  };

  const eventoId = randomUUID();

  it('entrega o evento do outbox de forma assíncrona: gera ponto e marca ENTREGUE', async () => {
    await pool.query(
      `INSERT INTO core.outbox (id, nome, payload, ocorrido_em, pendentes, status, tentativas, proxima_em)
       VALUES ($1, 'DoseRegistrada', $2::jsonb, now(), $3::jsonb, 'PENDENTE', 0, now())`,
      [
        eventoId,
        JSON.stringify({
          usuarioId,
          registroDeUsoId: randomUUID(),
          usadoEm: '2026-06-01T09:00:00.000Z',
          quantidade: 5,
        }),
        JSON.stringify(['ia.ingestao']),
      ],
    );

    await aguardarAte(async () => (await statusDe(eventoId)) === 'ENTREGUE');
    expect(await contarDoses()).toBe(1);
  });

  it('reentrega do mesmo evento (at-least-once) não duplica o ponto (idempotência)', async () => {
    // Simula uma reentrega: a mesma linha volta a PENDENTE (ex.: crash antes de marcarEntregue).
    await pool.query(
      `UPDATE core.outbox
          SET status = 'PENDENTE', pendentes = $2::jsonb, proxima_em = now(), entregue_em = NULL
        WHERE id = $1`,
      [eventoId, JSON.stringify(['ia.ingestao'])],
    );

    await aguardarAte(async () => (await statusDe(eventoId)) === 'ENTREGUE');
    // A ingestão dedup por `ia:ingestao:<eventoId>` — segue exatamente 1 ponto.
    expect(await contarDoses()).toBe(1);
  });
});
