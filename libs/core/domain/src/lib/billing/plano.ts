/**
 * Planos da plataforma (doc 07 §6 — Estratégia 1, camada única).
 *
 * A assinatura pertence à **Conta**, não aos apps: assinar desbloqueia Grow, Med e
 * futuros apps de uma vez (doc 07 §5). Por isso não existe `PLANO_GROW`/`PLANO_MED`.
 *
 * O plano `PLUS` (Estratégia 3) e o add-on de IA (Estratégia 2) são Versão 2/3 —
 * entram como novos valores aqui, sem migração destrutiva (doc 07 §7).
 */
export enum Plano {
  GRATUITO = 'GRATUITO',
  PREMIUM = 'PREMIUM',
}

export function ehPlanoValido(valor: string): valor is Plano {
  return (Object.values(Plano) as string[]).includes(valor);
}

/** Ciclo de cobrança — o desconto do ciclo anual é decisão comercial (doc 07 §9.1). */
export enum CicloDeCobranca {
  MENSAL = 'MENSAL',
  ANUAL = 'ANUAL',
}

export function ehCicloDeCobrancaValido(valor: string): valor is CicloDeCobranca {
  return (Object.values(CicloDeCobranca) as string[]).includes(valor);
}
