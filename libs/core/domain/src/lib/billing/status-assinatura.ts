/**
 * Estados da `AssinaturaPremium` (doc 08 §12.6).
 *
 * `PENDENTE_PAGAMENTO` não constava da lista do doc 08 (trial/ativa/inadimplente/
 * cancelada) e foi descoberto na implementação: sem ele, iniciar um upgrade só teria
 * duas saídas — conceder Premium **antes** da confirmação do gateway (bug financeiro)
 * ou descartar a intenção de upgrade. O estado registra "quis assinar, aguardando o
 * pagamento confirmar", e nunca concede Premium.
 */
export enum StatusAssinatura {
  /** Conta sem assinatura paga. É o estado de toda conta nova (doc 07 §4). */
  ATIVA = 'ATIVA',
  /** Upgrade iniciado; Premium ainda NÃO liberado (aguarda `PagamentoRecebido`). */
  PENDENTE_PAGAMENTO = 'PENDENTE_PAGAMENTO',
  /** Período gratuito vigente — Premium liberado, sem cobrança ainda. */
  TRIAL = 'TRIAL',
  /** Cobrança falhou. Premium suspenso (período de tolerância é Versão 2). */
  INADIMPLENTE = 'INADIMPLENTE',
  /** Cancelada pelo usuário — Premium segue válido até o fim do período já pago. */
  CANCELADA = 'CANCELADA',
}

export function ehStatusAssinaturaValido(valor: string): valor is StatusAssinatura {
  return (Object.values(StatusAssinatura) as string[]).includes(valor);
}
