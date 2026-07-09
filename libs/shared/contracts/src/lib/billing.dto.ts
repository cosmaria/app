/**
 * Contratos HTTP de Billing/Premium (doc 09 — /v1/assinatura/*, /v1/conta/limites).
 * Tipos puros, compartilhados entre backend (apps/api) e mobile (apps/mobile).
 */

export interface AssinaturaResponse {
  plano: string;
  status: string;
  /** O que vale hoje. Pode ser `true` com status CANCELADA (período pago restante). */
  premiumAtivo: boolean;
  moeda: string | null;
  cicloDeCobranca: string | null;
  vigenteAte: string | null;
}

/** Corpo de `POST /v1/assinatura/upgrade`. */
export interface IniciarUpgradeRequest {
  ciclo: 'MENSAL' | 'ANUAL';
  /** ISO-3166-1 alfa-2. Define moeda e preço regional (doc 07 §9.1). */
  pais: string;
  cupomCodigo?: string | null;
}

export interface UpgradeResponse {
  assinatura: AssinaturaResponse;
  /** `null` quando o upgrade virou trial: não há o que cobrar. */
  checkout: { urlCheckout: string; referenciaExterna: string } | null;
}

/** Corpo de `POST /v1/assinatura/cupom`. */
export interface AplicarCupomRequest {
  codigo: string;
}

/** Resposta de `GET /v1/conta/limites`. Limite `null` = ilimitado. */
export interface LimitesResponse {
  plano: string;
  limites: { chave: string; limite: number | null }[];
}
