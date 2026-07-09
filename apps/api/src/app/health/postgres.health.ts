import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorService, type HealthIndicatorResult } from '@nestjs/terminus';
import type { Pool } from 'pg';
import { PG_POOL } from '../infra/infra.tokens';

/**
 * Indicador de saúde do PostgreSQL (readiness). Executa `SELECT 1` no MESMO pool
 * usado pelos repositórios — prova que o banco real está acessível (doc 00 §16, 6e).
 * Se a app subiu em modo in-memory (sem Postgres), reporta 'up' com modo explícito.
 */
@Injectable()
export class PostgresHealthIndicator {
  constructor(
    private readonly health: HealthIndicatorService,
    @Inject(PG_POOL) private readonly pool: Pool | null,
  ) {}

  async verificar(chave = 'postgres'): Promise<HealthIndicatorResult> {
    const sessao = this.health.check(chave);
    if (!this.pool) {
      return sessao.up({ modo: 'in-memory' });
    }
    try {
      await this.pool.query('SELECT 1');
      return sessao.up();
    } catch (erro) {
      return sessao.down({ erro: erro instanceof Error ? erro.message : String(erro) });
    }
  }
}
