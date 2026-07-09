/**
 * Porta de feature flags (Provider Agnostic, doc 13 §16.1). Hoje a implementação lê do
 * ambiente; trocar por um serviço remoto de flags não toca em nenhum caso de uso.
 *
 * Primeiro uso: `RegistroDeVinculoDePerfis` é Versão 2 (doc 06, decisão consolidada #1)
 * — o modelo de dados nasce pronto no MVP, a funcionalidade fica desligada por flag.
 */
export interface FeatureFlags {
  vinculoDePerfisHabilitado(): boolean;
}

export const FEATURE_FLAGS = Symbol('FeatureFlags');
