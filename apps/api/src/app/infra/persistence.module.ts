import {
  Global,
  Inject,
  Logger,
  Module,
  type OnApplicationShutdown,
  type Provider,
} from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import type { Pool } from 'pg';
import {
  CACHE_PORT,
  ImmediateTransactionRunner,
  TRANSACTION_RUNNER,
  type CachePort,
  type TransactionRunner,
} from '@cosmaria/core-application';
import {
  criarPgPool,
  InMemoryCacheAdapter,
  PgUnitOfWork,
  RedisCacheAdapter,
} from '@cosmaria/core-infrastructure';
import { PG_POOL } from './infra.tokens';
import { databaseUrl, redisUrl, usarPostgres, usarRedis } from './infra.config';
import { TransactionInterceptor } from './transaction.interceptor';

/**
 * Módulo global de conexões de infraestrutura (Sprint de Infraestrutura, 2026-07-09).
 * Cria e é dono do ciclo de vida do pool Postgres (via unit-of-work) e do cache Redis —
 * uma ÚNICA instância de cada, compartilhada por toda a app. Fecha ambos no shutdown.
 *
 * O `PgUnitOfWork` é dono do pool e o torna transaction-aware (doc 04 §9): `PG_POOL` passa a
 * expor esse pool "patchado", e `TRANSACTION_RUNNER` permite envolver mutações numa transação
 * — é o que dá atomicidade write↔outbox (Fase B). O toggle usarPostgres() permite subir a app
 * em memória (repos e cache em memória, runner pass-through) — usado por testes e dev local.
 */
const UNIT_OF_WORK = Symbol('UnitOfWork');

const uowProvider: Provider = {
  provide: UNIT_OF_WORK,
  useFactory: (): PgUnitOfWork | null =>
    usarPostgres() ? new PgUnitOfWork(criarPgPool(databaseUrl())) : null,
};

const pgProvider: Provider = {
  provide: PG_POOL,
  useFactory: (uow: PgUnitOfWork | null): Pool | null => uow?.pool ?? null,
  inject: [UNIT_OF_WORK],
};

const transactionRunnerProvider: Provider = {
  provide: TRANSACTION_RUNNER,
  useFactory: (uow: PgUnitOfWork | null): TransactionRunner =>
    uow ?? new ImmediateTransactionRunner(),
  inject: [UNIT_OF_WORK],
};

const cacheProvider: Provider = {
  provide: CACHE_PORT,
  useFactory: (): CachePort =>
    usarRedis() ? new RedisCacheAdapter(redisUrl()) : new InMemoryCacheAdapter(),
};

@Global()
@Module({
  providers: [
    uowProvider,
    pgProvider,
    transactionRunnerProvider,
    cacheProvider,
    { provide: APP_INTERCEPTOR, useClass: TransactionInterceptor },
  ],
  exports: [PG_POOL, CACHE_PORT, TRANSACTION_RUNNER],
})
export class PersistenceModule implements OnApplicationShutdown {
  private readonly logger = new Logger('PersistenceModule');

  constructor(
    @Inject(UNIT_OF_WORK) private readonly uow: PgUnitOfWork | null,
    @Inject(CACHE_PORT) private readonly cache: CachePort,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    if (this.uow) {
      await this.uow.end();
      this.logger.log('Pool Postgres encerrado.');
    }
    // fechar() é lifecycle de infra — não polui a porta CachePort; checamos em runtime.
    const fechavel = this.cache as { fechar?: () => Promise<void> };
    if (typeof fechavel.fechar === 'function') {
      await fechavel.fechar();
      this.logger.log('Cache encerrado.');
    }
  }
}
