/**
 * Catálogos da IA (doc 05, doc 08 §8 — internacionalização de dados: códigos estáveis).
 */

/** Domínio de origem de um ponto de série (doc 05 §6 — Grow e Med são só fontes de série). */
export enum DominioDeDado {
  GROW = 'GROW',
  MED = 'MED',
}

export function ehDominioDeDadoValido(valor: string): valor is DominioDeDado {
  return (Object.values(DominioDeDado) as string[]).includes(valor);
}

/**
 * Fatores conhecidos que a IA correlaciona. Código estável, cruzando domínios — para o
 * Motor de Correlação, VPD e DOR são só duas séries temporais numéricas (doc 05 §5.2).
 * Novos fatores (de wearables, exames — doc 05 §16) entram aqui sem tocar no motor.
 */
export const Fator = {
  // Grow (derivados já calculados, chegam prontos no evento — doc 02 §12)
  VPD: 'VPD',
  DLI: 'DLI',
  // Med — linha de base diária (doc 03 §5.3)
  HUMOR: 'HUMOR',
  ANSIEDADE: 'ANSIEDADE',
  DOR: 'DOR',
  SONO: 'SONO',
  APETITE: 'APETITE',
  // Med — uso e efeito (doc 03 §5.2/§5.4/§5.5)
  DOSE: 'DOSE',
  SESSAO_VARIACAO: 'SESSAO_VARIACAO',
  EFEITO_INTENSIDADE: 'EFEITO_INTENSIDADE',
} as const;

export type Fator = (typeof Fator)[keyof typeof Fator];

/** Direção da correlação (doc 05 §6.1). */
export enum DirecaoDaCorrelacao {
  POSITIVA = 'POSITIVA',
  NEGATIVA = 'NEGATIVA',
  NEUTRA = 'NEUTRA',
}

/**
 * Nível de confiança (doc 05 §7). Nunca certeza absoluta (princípio permanente §4.6) —
 * o valor mais alto ainda é "ALTA", jamais "certo".
 */
export enum NivelDeConfianca {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
}
