import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PostgresHealthIndicator } from './postgres.health';
import { RedisHealthIndicator } from './redis.health';

/**
 * Módulo de health check (Sprint de Infraestrutura, 2026-07-09).
 * Depende do PersistenceModule (global) para o PG_POOL e o CACHE_PORT reais.
 */
@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [PostgresHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}
