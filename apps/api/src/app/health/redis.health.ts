import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicatorService, type HealthIndicatorResult } from '@nestjs/terminus';
import { CACHE_PORT, type CachePort } from '@cosmaria/core-application';

/**
 * Indicador de saúde do Redis (readiness). Usa a porta CachePort (não o SDK
 * diretamente) — Provider Agnostic (doc 13 §16.1). Em modo in-memory, o adaptador
 * responde 'up' (verificarConexao() = true), então readiness reflete o modo real.
 */
@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly health: HealthIndicatorService,
    @Inject(CACHE_PORT) private readonly cache: CachePort,
  ) {}

  async verificar(chave = 'redis'): Promise<HealthIndicatorResult> {
    const sessao = this.health.check(chave);
    const conectado = await this.cache.verificarConexao();
    return conectado ? sessao.up() : sessao.down({ erro: 'sem conexão com o cache' });
  }
}
