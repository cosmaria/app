// Raio e geometria (doc 11 §5.4, ui-kit §11.2).

export const radius = {
  sm: 4, // inputs, badges, elementos compactos
  md: 8, // cards e controles padrão
  lg: 16, // modais, sheets, superfícies principais
  pill: 999, // chips e tags — NUNCA em cards (ui-kit §11.2)
} as const;

/** Espessura de borda de referência (doc 11 §5.4 / ui-kit §12). */
export const borderWidth = {
  hairline: 1, // 1px visual — separação de superfícies e campos
  focus: 2, // anel de foco (ui-kit §11 / §28: focus ring 2px)
} as const;

export type RadiusToken = keyof typeof radius;
export type BorderWidthToken = keyof typeof borderWidth;
