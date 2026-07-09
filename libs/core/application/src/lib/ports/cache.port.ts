/**
 * Porta de cache (doc 04 §4, doc 13 §16.1 — Provider Agnostic).
 * A camada de Aplicação depende SÓ deste contrato; a implementação concreta
 * (Redis via ioredis, ou em memória para testes) vive na Infraestrutura.
 * Trocar Redis por outro provedor não toca em nenhum caso de uso.
 */
export interface CachePort {
  /** Retorna o valor associado à chave, ou null se ausente/expirado. */
  get(chave: string): Promise<string | null>;

  /** Grava o valor; se `ttlSegundos` for informado, expira após esse tempo. */
  set(chave: string, valor: string, ttlSegundos?: number): Promise<void>;

  /**
   * Grava SOMENTE se a chave ainda não existir, atomicamente, e diz se gravou.
   * É a primitiva de exclusão mútua (Redis `SET NX`) sobre a qual a idempotência do
   * webhook é construída: um `get` seguido de `set` seria uma corrida entre duas
   * entregas simultâneas do mesmo evento — cenário comum em gateway de pagamento.
   */
  setSeAusente(chave: string, valor: string, ttlSegundos: number): Promise<boolean>;

  /** Remove a chave (no-op se não existir). */
  del(chave: string): Promise<void>;

  /**
   * Liveness do cache — usado pelo health check de readiness (doc 00 §16, 6e).
   * Retorna true se o backend está acessível e respondendo.
   */
  verificarConexao(): Promise<boolean>;
}

/** Token de injeção da porta de cache. */
export const CACHE_PORT = Symbol('CachePort');
