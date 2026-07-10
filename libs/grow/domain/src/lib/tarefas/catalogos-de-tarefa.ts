/**
 * Catálogos de Tarefa (doc 02 §5.10, doc 08 §Tarefa — Arquétipo A, doc 08 §8).
 * Códigos estáveis, nunca texto em português — o rótulo exibido vem de tradução.
 */

/** Natureza da tarefa planejada (doc 02 §5.10). */
export enum TipoDeTarefa {
  REGA = 'REGA',
  FERTILIZACAO = 'FERTILIZACAO',
  PODA = 'PODA',
  TRANSPLANTE = 'TRANSPLANTE',
  INSPECAO = 'INSPECAO',
  OUTRO = 'OUTRO',
}

export function ehTipoDeTarefaValido(valor: string): valor is TipoDeTarefa {
  return (Object.values(TipoDeTarefa) as string[]).includes(valor);
}

/** Estado da tarefa. O doc 08 define apenas pendente/concluída. */
export enum StatusDaTarefa {
  PENDENTE = 'PENDENTE',
  CONCLUIDA = 'CONCLUIDA',
}

export function ehStatusDaTarefaValido(valor: string): valor is StatusDaTarefa {
  return (Object.values(StatusDaTarefa) as string[]).includes(valor);
}

/**
 * Origem da tarefa (doc 08 §Tarefa). `IA` fica **modelada** desde já para que o dado nasça
 * pronto, mas a criação a partir de um `AlertaGerado` (doc 05) só existe quando a IA existir
 * — mesmo diferimento do gancho Lote↔Med.
 */
export enum OrigemDaTarefa {
  MANUAL = 'MANUAL',
  IA = 'IA',
}

export function ehOrigemDaTarefaValida(valor: string): valor is OrigemDaTarefa {
  return (Object.values(OrigemDaTarefa) as string[]).includes(valor);
}
