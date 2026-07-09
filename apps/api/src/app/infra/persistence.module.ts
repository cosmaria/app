import {
  Global,
  Inject,
  Logger,
  Module,
  type OnApplicationShutdown,
  type Provider,
} from '@nestjs/common';
import type { Pool } from 'pg';
import { CACHE_PORT, type CachePort } from '@cosmaria/core-application';
import {
  criarPgPool,
  InMemoryCacheAdapter,
  RedisCacheAdapter,
} from '@cosmaria/core-infrastructure';
import { PG_POOL } from './infra.tokens';
import { databaseUrl, redisUrl, usarPostgres, usarRedis } from './infra.config';

/**
 * Módulo global de conexões de infraestrutura (Sprint de Infraestrutura, 2026-07-09).
 * Cria e é dono do ciclo de vida do pool Postgres e do cache Redis — uma ÚNICA
 * instância de cada, compartilhada por Auth (repos) e Health (readiness). Fecha
 * ambos no shutdown (doc 09, stateless: instância sobe/desce limpa no Cloud Run).
 *
 * O toggle usarPostgres()/usarRedis() permite subir a app sem serviços externos
 * (repos e cache em memória) — usado por testes e dev local sem docker.
 */
const pgProvider: Provider = {
  provide: PG_POOL,
  useFactory: (): Pool | null => (usarPostgres() ? criarPgPool(databaseUrl()) : null),
};

const cacheProvider: Provider = {
  provide: CACHE_PORT,
  useFactory: (): CachePort =>
    usarRedis() ? new RedisCacheAdapter(redisUrl()) : new InMemoryCacheAdapter(),
};

@Global()
@Module({
  providers: [pgProvider, cacheProvider],
  exports: [PG_POOL, CACHE_PORT],
})
export class PersistenceModule implements OnApplicationShutdown {
  private readonly logger = new Logger('PersistenceModule');

  constructor(
    @Inject(PG_POOL) private readonly pool: Pool | null,
    @Inject(CACHE_PORT) private readonly cache: CachePort,
  ) {}

  async onApplicationShutdown(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
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
