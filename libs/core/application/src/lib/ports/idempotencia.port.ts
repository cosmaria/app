/**
 * `RegistroDeIdempotencia` (doc 08 — Arquétipo B com expiração; doc 09 §9).
 *
 * Guarda chaves já processadas por uma janela curta, para que reenvio (retry do cliente,
 * reentrega do gateway) não duplique o efeito. Vida curta por natureza — o adaptador
 * usa o TTL do cache, não uma tabela que cresce para sempre.
 *
 * A operação é **atômica por contrato**: `registrarSeNova` decide e grava num único
 * passo. Um `consultar` seguido de `gravar` seria uma corrida — exatamente o cenário que
 * webhooks reentregues produzem.
 */
export interface RegistroDeIdempotenciaRepository {
  /**
   * `true` se a chave é nova (siga com o efeito colateral);
   * `false` se ela já foi processada dentro da janela (não repita o efeito).
   */
  registrarSeNova(chave: string, ttlSegundos: number): Promise<boolean>;
}

export const REGISTRO_DE_IDEMPOTENCIA_REPOSITORY = Symbol('RegistroDeIdempotenciaRepository');

/** Janela padrão de retry (24h) — cobre com folga o retry de qualquer gateway. */
export const TTL_IDEMPOTENCIA_SEGUNDOS = 86_400;
