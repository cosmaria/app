// Motion (doc 11 §5.7, ui-kit §16).
//
// Regra obrigatória (doc 11 §5.7): respeitar `prefers-reduced-motion` — toda
// animação tem uma versão instantânea equivalente. Essa checagem é
// responsabilidade da camada de componente/runtime; aqui só definimos os tokens.
// As curvas (cubic-bezier) são CANDIDATAS (doc 11 §4) — o doc nomeia os papéis,
// não fixa os coeficientes.

/** Durações em milissegundos (ui-kit §16.1). */
export const duration = {
  instant: 100, // pressed, feedback imediato
  fast: 150, // hover, pequenos estados
  base: 200, // transições padrão
  slow: 300, // overlays, reorganização
  deliberate: 500, // onboarding / transição de contexto (raro)
} as const;

/** Curvas de movimento (ui-kit §16.2) — coeficientes candidatos. */
export const easing = {
  /** Mudanças simétricas (entra/sai). */
  standard: [0.2, 0, 0, 1] as const,
  /** Elementos entrando (desacelera ao chegar). */
  decelerate: [0, 0, 0, 1] as const,
  /** Elementos saindo (acelera ao sair). */
  accelerate: [0.3, 0, 1, 1] as const,
} as const;

export type DurationToken = keyof typeof duration;
export type EasingToken = keyof typeof easing;
