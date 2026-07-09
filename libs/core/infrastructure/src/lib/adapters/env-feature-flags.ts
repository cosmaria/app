import type { FeatureFlags } from '@cosmaria/core-application';

/**
 * Adaptador de feature flags lido do ambiente (Provider Agnostic, doc 13 §16.1):
 * trocar por um serviço remoto de flags implementa a mesma porta, sem tocar nos casos
 * de uso. Lê o env a cada chamada, e não no construtor, para que ligar/desligar uma
 * flag não exija rebuild da instância.
 *
 * `FEATURE_VINCULO_DE_PERFIS` nasce **desligada**: vínculo entre perfis é Versão 2
 * (doc 06, decisão consolidada #1) — o modelo de dados existe desde o MVP, a
 * funcionalidade não.
 */
export class EnvFeatureFlags implements FeatureFlags {
  vinculoDePerfisHabilitado(): boolean {
    return process.env.FEATURE_VINCULO_DE_PERFIS === 'true';
  }
}
