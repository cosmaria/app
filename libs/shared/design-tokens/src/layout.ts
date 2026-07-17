// Grid e breakpoints (doc 11 §5.8, ui-kit §10).
//
// Mobile-first: breakpoints reorganizam densidade, nunca removem funcionalidade
// (doc 11 §11). Alvo de toque mínimo e piso de acessibilidade também vivem aqui
// por serem constantes transversais de layout/acessibilidade (doc 11 §9).

/** Limiares de breakpoint em px (doc 11 §5.8): mobile <600, tablet 600–1024, desktop >1024. */
export const breakpoint = {
  mobile: 0,
  tablet: 600,
  desktop: 1024,
} as const;

/** Colunas de grid por faixa (doc 11 §5.8 / ui-kit §10.1–§10.3). Gutter = space.4 (16px). */
export const gridColumns = {
  mobile: 4,
  tablet: 8,
  desktop: 12,
} as const;

/** Gutter de grid constante por breakpoint (ui-kit §10.5) — corresponde a spacing['4']. */
export const gridGutter = 16;

/** Alvo de toque mínimo em px (doc 11 §9 / ui-kit §18.15 / WCAG). */
export const minTouchTarget = 44;

/** Piso de contraste WCAG 2.1 AA (doc 11 §9). */
export const contrastMinimum = {
  normalText: 4.5,
  largeText: 3,
  focusRing: 3,
} as const;

export type Breakpoint = keyof typeof breakpoint;
