import type { ResultadoDeLimite } from '@cosmaria/core-application';

/**
 * Interface pública de Billing/Premium (doc 07 / doc 14 §10).
 *
 * É o ÚNICO ponto pelo qual Grow, Med e Comunidade perguntam ao Core se algo é
 * permitido. Nenhum módulo implementa lógica de cobrança nem lê `LimiteDePlano`
 * diretamente (doc 07, Dependências com Outros Módulos).
 *
 * Deliberadamente estreita (ISP, doc 04 §4): não expõe status de assinatura, moeda nem
 * cupom — quem consome só precisa saber "é Premium?" e "cabe mais um?".
 */
export interface PremiumPublicApi {
  /** O usuário tem acesso Premium neste instante (inclui trial e período pago restante). */
  ehPremium(usuarioId: string): Promise<boolean>;

  /**
   * "Cabe mais um?" para uma chave de capacidade simultânea (ex.: ambientes do Grow).
   * Publica `LimitePremiumAtingido` quando barra — o consumidor só precisa reagir ao
   * `permitido: false`, nunca disparar o evento por conta própria.
   *
   * Nunca use para leitura de histórico: limite de plano rege capacidade futura, e
   * histórico já registrado jamais é limitado (doc 07 §9).
   */
  verificarLimite(usuarioId: string, chave: string, usoAtual: number): Promise<ResultadoDeLimite>;
}

/** Token de injeção da interface pública de Premium. */
export const PREMIUM_PUBLIC_API = Symbol('PremiumPublicApi');
