// Elevação (doc 11 §5.5, ui-kit §13).
//
// Elevação é um token de NÍVEL (0–5), não uma sombra fixa — renderizada
// diferente por tema (ui-kit §13.8/§13.9):
//   - Dark:  clareamento sutil da superfície + borda sutil, sombra mínima
//            (sombras "somem" em fundo escuro).
//   - Light: sombra suave crescente (+ possível borda).
//
// O nível cresce apenas com sobreposição e distância perceptiva, nunca para
// sinalizar importância de negócio (ui-kit §13.1). Valores de sombra do Light
// são candidatos (doc 11 §4).

export type ElevationLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** Especificação de sombra (Light Mode) — offset/blur/spread em px, cor rgba. */
export interface ShadowSpec {
  readonly offsetY: number;
  readonly blur: number;
  readonly spread: number;
  readonly color: string;
}

/**
 * Uso semântico de cada nível (ui-kit §13.2–§13.6) — orienta qual nível aplicar,
 * independente do tema.
 */
export const elevationUsage: Record<ElevationLevel, string> = {
  0: 'superfície base / conteúdo plano',
  1: 'cards clicáveis, agrupamentos sutis',
  2: 'menus, popovers, elementos temporários',
  3: 'dropdown/overflow elevado',
  4: 'sheets',
  5: 'modais sobrepostos com scrim',
};

/**
 * Renderização em Light: sombra suave crescente (ui-kit §13.9). Candidatos.
 * Em Dark, a "elevação" é obtida subindo a superfície (bg.surface → surface2)
 * + borda sutil; por isso o mapa de sombra Dark é intencionalmente vazio/mínimo.
 */
export const elevationShadowLight: Record<ElevationLevel, ShadowSpec | null> = {
  0: null,
  1: { offsetY: 1, blur: 2, spread: 0, color: 'rgba(16,21,26,0.06)' },
  2: { offsetY: 2, blur: 6, spread: 0, color: 'rgba(16,21,26,0.08)' },
  3: { offsetY: 4, blur: 12, spread: 0, color: 'rgba(16,21,26,0.10)' },
  4: { offsetY: 8, blur: 20, spread: 0, color: 'rgba(16,21,26,0.12)' },
  5: { offsetY: 16, blur: 32, spread: 0, color: 'rgba(16,21,26,0.16)' },
};
