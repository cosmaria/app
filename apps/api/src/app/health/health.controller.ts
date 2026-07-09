import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, type HealthCheckResult } from '@nestjs/terminus';
import { PostgresHealthIndicator } from './postgres.health';
import { RedisHealthIndicator } from './redis.health';

interface LivenessResponse {
  status: 'ok';
  service: 'cosmaria-api';
  timestamp: string;
}

/**
 * Health check do Modular Monolith. Separa dois níveis (padrão Cloud Run / K8s):
 *  - GET /v1/health        → LIVENESS: a app está de pé e respondendo? (barato,
 *                            não toca serviços externos)
 *  - GET /v1/health/ready  → READINESS: dá para receber tráfego? Consulta o
 *                            PostgreSQL (SELECT 1) e o Redis (PING) REAIS.
 * Prefixo global 'v1' aplicado em main.ts.
 */
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly postgres: PostgresHealthIndicator,
    private readonly redis: RedisHealthIndicator,
  ) {}

  @Get()
  check(): LivenessResponse {
    return {
      status: 'ok',
      service: 'cosmaria-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @HealthCheck()
  ready(): Promise<HealthCheckResult> {
    return this.health.check([() => this.postgres.verificar(), () => this.redis.verificar()]);
  }
}
