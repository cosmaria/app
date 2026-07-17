// Opacidade (doc 11 §5.6, ui-kit §14).

export const opacity = {
  /** Estado disabled — preserva compreensão, não apaga legibilidade (ui-kit §14.2). */
  disabled: 0.4,
  /** Scrim de modal/sheet (ui-kit §14.4). */
  overlay: 0.6,
  /** Camada de hover sobre superfícies — faixa 8–12% (ui-kit §14.3). */
  hoverOverlayMin: 0.08,
  hoverOverlayMax: 0.12,
  hoverOverlay: 0.1,
} as const;

export type OpacityToken = keyof typeof opacity;
