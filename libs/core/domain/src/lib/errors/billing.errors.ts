import { DomainError } from './auth.errors';

/** Tentativa de fazer upgrade de uma assinatura que já dá acesso Premium. */
export class AssinaturaJaAtivaError extends DomainError {
  readonly code = 'ASSINATURA_JA_ATIVA';
  constructor() {
    super('Sua assinatura Premium já está ativa.');
  }
}

/** Cancelar/aplicar cupom numa assinatura que não é Premium. */
export class AssinaturaNaoPremiumError extends DomainError {
  readonly code = 'ASSINATURA_NAO_PREMIUM';
  constructor() {
    super('Não há assinatura Premium para esta operação.');
  }
}

/** Cupom inexistente, expirado, esgotado ou inativo — nunca dizemos qual dos quatro. */
export class CupomInvalidoError extends DomainError {
  readonly code = 'CUPOM_INVALIDO';
  constructor() {
    super('Cupom inválido ou expirado.');
  }
}

/**
 * Não há `PrecoRegional` configurado para (país, plano, ciclo).
 * É falha de configuração, não do usuário: preferimos recusar o upgrade a cobrar um
 * valor arbitrado em código (doc 07 §9.1 — preço nunca é constante de código).
 */
export class PrecoNaoConfiguradoError extends DomainError {
  readonly code = 'PRECO_NAO_CONFIGURADO';
  constructor(pais: string) {
    super(`Ainda não há preço disponível para a sua região (${pais}).`);
  }
}

/** Payload de webhook cuja assinatura HMAC não confere (doc 09 §7, arquétipo API-7). */
export class AssinaturaDePayloadInvalidaError extends DomainError {
  readonly code = 'ASSINATURA_PAYLOAD_INVALIDA';
  constructor() {
    super('Assinatura do payload inválida.');
  }
}

/**
 * Limite do plano gratuito atingido (doc 07 §9).
 * NUNCA é lançado por leitura de histórico — só por criação de nova capacidade
 * simultânea. Capar o passado do usuário é proibido por princípio (doc 07 §4/§9).
 */
export class LimiteDePlanoAtingidoError extends DomainError {
  readonly code = 'LIMITE_DE_PLANO_ATINGIDO';
  constructor(
    readonly chave: string,
    readonly limite: number,
  ) {
    super(`Você atingiu o limite do plano gratuito para "${chave}" (${limite}).`);
  }
}
