// @cosmaria/shared-design-tokens — fonte ÚNICA de design tokens da plataforma.
//
// Doc de referência: docs/11-design-system.md §5 (autoridade raiz) +
// docs/design-system/01-visual-language, 02-ui-kit. Consumido por qualquer
// stack (React Native em apps/mobile, e um exportador de plugin do Figma para
// gerar Variables) — nunca hardcode de valor num componente (doc 11 §14).
//
// Status dos valores: CANDIDATOS a validação com usuários reais antes do
// lançamento (doc 11 §4). A ESTRUTURA (nomes de token, tipos) é estável; os
// valores podem trocar sem retrabalho, porque tudo referencia o nome.

export { color } from './color';
export type { ThemedColor, AppContext, ColorTokens } from './color';

export { fontFamily, fontSize, fontWeight, lineHeight } from './typography';
export type { FontSizeToken, FontWeightToken, LineHeightToken } from './typography';

export { spacing } from './spacing';
export type { SpacingToken } from './spacing';

export { radius, borderWidth } from './radius';
export type { RadiusToken, BorderWidthToken } from './radius';

export { elevationUsage, elevationShadowLight } from './elevation';
export type { ElevationLevel, ShadowSpec } from './elevation';

export { opacity } from './opacity';
export type { OpacityToken } from './opacity';

export { duration, easing } from './motion';
export type { DurationToken, EasingToken } from './motion';

export { breakpoint, gridColumns, gridGutter, minTouchTarget, contrastMinimum } from './layout';
export type { Breakpoint } from './layout';

export { resolvePalette, accentFor, buildTheme } from './theme';
export type { ThemeMode, ResolvedPalette, Theme } from './theme';

export { buildFigmaTokens } from './figma-tokens';
export type {
  FigmaTokenExport,
  FigmaCollection,
  FigmaVariable,
  FigmaVariableType,
} from './figma-tokens';
