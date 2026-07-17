// Tokens de tipografia (doc 11 §5.2, design-system/02-ui-kit §8).
//
// Família CANDIDATA: Inter (mesmo status de candidata dos demais valores,
// doc 11 §4). O nome/licenciamento final ficam para o doc 13, que ainda não
// escolheu fonte — aqui fixamos apenas papel e escala, que são estáveis.

/** Família tipográfica candidata; fallback sans-serif de sistema (doc 11 §5.2). */
export const fontFamily = {
  candidate: 'Inter',
  /** Fallback de métricas próximas — não altera hierarquia se a família trocar. */
  fallback: 'System',
} as const;

/**
 * Escala tipográfica oficial (doc 11 §5.2). Valores fora da escala exigem
 * alteração sistêmica. Chaves espelham os nomes de token do doc 11.
 */
export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 38,
  '4xl': 48,
} as const;

/** Pesos (doc 11 §5.2 / ui-kit §8.5): Regular leitura, Medium labels, Semibold títulos/ações, Bold raro. */
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

/**
 * Altura de linha (doc 11 §5.2 / ui-kit §8.6): títulos compactos; corpo 1,4–1,6;
 * metadados no mínimo 1,3.
 */
export const lineHeight = {
  /** Títulos / display. */
  tight: 1.2,
  /** Metadados (mínimo permitido). */
  snug: 1.3,
  /** Corpo padrão. */
  normal: 1.5,
  /** Leitura longa. */
  relaxed: 1.6,
} as const;

export type FontSizeToken = keyof typeof fontSize;
export type FontWeightToken = keyof typeof fontWeight;
export type LineHeightToken = keyof typeof lineHeight;
