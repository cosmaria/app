/**
 * Porta de geração de identificadores. Implementada na infraestrutura
 * (crypto.randomUUID) — mantém o domínio/aplicação puros (doc 14 §6).
 */
export interface IdGenerator {
  gerar(): string;
}

export const ID_GENERATOR = Symbol('IdGenerator');
