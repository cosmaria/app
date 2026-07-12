import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import { criarPgPool } from '@cosmaria/core-infrastructure';
import { TRANSACTION_RUNNER, type TransactionRunner } from '@cosmaria/core-application';
import { AppModule } from '../../apps/api/src/app/app.module';
import { DomainExceptionFilter } from '../../apps/api/src/app/auth/domain-exception.filter';
import { PG_POOL } from '../../apps/api/src/app/infra/infra.tokens';
import { aplicarMigrations, iniciarPostgres, iniciarRedis } from './support/containers';

/**
 * Fase B — outbox transacional. Prova, contra Postgres real, que o write de negócio e o
 * `enfileirar` no outbox rodam na MESMA transação (unit-of-work): ou se comprometem juntos
 * (COMMIT) ou são desfeitos juntos (ROLLBACK). Fecha a janela de perda write↔outbox da Fase A.
 *
 * Usa `core.trilha_de_auditoria` (tabela de negócio sem FK) + `core.outbox`, escrevendo ambos
 * pelo `PG_POOL` transaction-aware dentro de `TransactionRunner.transaction(...)`. As
 * verificações fora de banda usam uma conexão INDEPENDENTE, provando o isolamento real.
 */
describe('Outbox transacional — atomicidade write↔outbox (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let poolExterno: Pool; // conexão independente, para verificação fora de banda
  let runner: TransactionRunner;
  let poolApp: Pool; // o PG_POOL transaction-aware da app

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

    runner = app.get<TransactionRunner>(TRANSACTION_RUNNER);
    poolApp = app.get<Pool>(PG_POOL);
    poolExterno = criarPgPool(pg.getConnectionUri());
  }, 180_000);

  afterAll(async () => {
    await poolExterno?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  // Escreve uma linha de negócio (trilha) + uma linha de outbox pelo pool transaction-aware.
  const escreverNegocioEOutbox = async (trilhaId: string, outboxId: string): Promise<void> => {
    await poolApp.query(
      `INSERT INTO core.trilha_de_auditoria (id, entidade_afetada, acao)
       VALUES ($1, 'TesteTransacional', 'ESCRITO')`,
      [trilhaId],
    );
    await poolApp.query(
      `INSERT INTO core.outbox (id, nome, payload, ocorrido_em, pendentes, status, tentativas, proxima_em)
       VALUES ($1, 'TesteTransacional', '{}'::jsonb, now(), '[]'::jsonb, 'PENDENTE', 0,
               now() + interval '1 hour')`, // futuro: o dispatcher nunca toca nesta linha
      [outboxId],
    );
  };

  const existe = async (tabela: string, id: string): Promise<boolean> => {
    const { rowCount } = await poolExterno.query(`SELECT 1 FROM ${tabela} WHERE id = $1`, [id]);
    return (rowCount ?? 0) > 0;
  };

  it('COMMIT: write de negócio e linha de outbox persistem juntos', async () => {
    const trilhaId = randomUUID();
    const outboxId = randomUUID();

    await runner.transaction(() => escreverNegocioEOutbox(trilhaId, outboxId));

    expect(await existe('core.trilha_de_auditoria', trilhaId)).toBe(true);
    expect(await existe('core.outbox', outboxId)).toBe(true);
  });

  it('ROLLBACK: erro após publicar desfaz o write E a linha de outbox (nenhum resíduo)', async () => {
    const trilhaId = randomUUID();
    const outboxId = randomUUID();

    await expect(
      runner.transaction(async () => {
        await escreverNegocioEOutbox(trilhaId, outboxId);
        throw new Error('falha depois de escrever e publicar');
      }),
    ).rejects.toThrow('falha depois de escrever e publicar');

    expect(await existe('core.trilha_de_auditoria', trilhaId)).toBe(false);
    expect(await existe('core.outbox', outboxId)).toBe(false);
  });

  it('ISOLAMENTO: a linha só fica visível a outra conexão após o COMMIT', async () => {
    const outboxId = randomUUID();

    await runner.transaction(async () => {
      await poolApp.query(
        `INSERT INTO core.outbox (id, nome, payload, ocorrido_em, pendentes, status, tentativas, proxima_em)
         VALUES ($1, 'TesteTransacional', '{}'::jsonb, now(), '[]'::jsonb, 'PENDENTE', 0,
                 now() + interval '1 hour')`,
        [outboxId],
      );
      // Ainda dentro da transação: uma conexão independente NÃO enxerga a linha não-commitada.
      expect(await existe('core.outbox', outboxId)).toBe(false);
    });

    // Após o COMMIT, a linha aparece.
    expect(await existe('core.outbox', outboxId)).toBe(true);
  });
});
