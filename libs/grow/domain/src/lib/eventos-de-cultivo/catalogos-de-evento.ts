/**
 * Catálogos de manejo e sanidade (doc 02 §5.7/§5.8, doc 08 §8).
 * Códigos estáveis, nunca texto em português — o rótulo exibido vem de tradução.
 */

/** Intervenções do cultivador sobre a planta (doc 02 §5.7). */
export enum TipoDeManejo {
  PODA = 'PODA',
  TOPPING = 'TOPPING',
  LST = 'LST',
  SCROG = 'SCROG',
  DEFOLIACAO = 'DEFOLIACAO',
  TRANSPLANTE = 'TRANSPLANTE',
  REGA = 'REGA',
  FERTILIZACAO = 'FERTILIZACAO',
  FLUSH = 'FLUSH',
}

export function ehTipoDeManejoValido(valor: string): valor is TipoDeManejo {
  return (Object.values(TipoDeManejo) as string[]).includes(valor);
}

/** Natureza do problema sanitário observado (doc 02 §5.8). */
export enum TipoDeSanidade {
  PRAGA = 'PRAGA',
  DOENCA = 'DOENCA',
  DEFICIENCIA = 'DEFICIENCIA',
  ESTRESSE = 'ESTRESSE',
}

export function ehTipoDeSanidadeValido(valor: string): valor is TipoDeSanidade {
  return (Object.values(TipoDeSanidade) as string[]).includes(valor);
}

/**
 * Severidade observada pelo cultivador. É uma escala **subjetiva e declarada**, não uma
 * medição: serve para o usuário comparar a própria evolução ao longo do ciclo, e para a
 * IA correlacionar. Nunca é usada para diagnosticar por conta própria.
 */
export enum Severidade {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
}

export function ehSeveridadeValida(valor: string): valor is Severidade {
  return (Object.values(Severidade) as string[]).includes(valor);
}
