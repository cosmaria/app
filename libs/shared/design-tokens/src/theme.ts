// Resolução de tema (doc 11 §4/§5.1, §13).
//
// Dark é o padrão da plataforma; Light usa os mesmos nomes de token, só o valor
// muda. Um componente nunca condiciona lógica ao tema — consome o tema já
// resolvido (mesma superfície de nomes nos dois modos). O accent é a única
// diferenciação entre apps (Core/Grow/Med) e entra por contexto, não por tema.

import { color, type AppContext, type ThemedColor } from './color';

export type ThemeMode = 'dark' | 'light';

/** Paleta resolvida para um modo — valores prontos para consumo (ex.: tema React Native). */
export interface ResolvedPalette {
  readonly bg: { readonly base: string; readonly surface: string; readonly surface2: string };
  readonly text: {
    readonly primary: string;
    readonly secondary: string;
    readonly tertiary: string;
    /** Texto/ícone sobre superfície Accent (branco nos dois temas) — `color.text.on-accent`. */
    readonly onAccent: string;
    /** Texto/ícone sobre superfície semântica crítica — `color.text.on-critical`. */
    readonly onCritical: string;
  };
  readonly border: string;
  readonly semantic: {
    readonly success: string;
    readonly warning: string;
    readonly critical: string;
    readonly info: string;
  };
}

function pick(token: ThemedColor, mode: ThemeMode): string {
  return mode === 'dark' ? token.dark : token.light;
}

/** Resolve os neutros e semânticos para um modo (accent entra por contexto — ver accentFor). */
export function resolvePalette(mode: ThemeMode): ResolvedPalette {
  return {
    bg: {
      base: pick(color.bg.base, mode),
      surface: pick(color.bg.surface, mode),
      surface2: pick(color.bg.surface2, mode),
    },
    text: {
      primary: pick(color.text.primary, mode),
      secondary: pick(color.text.secondary, mode),
      tertiary: pick(color.text.tertiary, mode),
      onAccent: pick(color.text.onAccent, mode),
      onCritical: pick(color.text.onCritical, mode),
    },
    border: pick(color.border, mode),
    semantic: {
      success: pick(color.semantic.success, mode),
      warning: pick(color.semantic.warning, mode),
      critical: pick(color.semantic.critical, mode),
      info: pick(color.semantic.info, mode),
    },
  };
}

/** Accent do contexto de app, resolvido para o modo (doc 11 §13). */
export function accentFor(context: AppContext, mode: ThemeMode): string {
  return pick(color.accent[context], mode);
}

/** Tema completo = modo + contexto de app. É o que a camada de apresentação consome. */
export interface Theme extends ResolvedPalette {
  readonly mode: ThemeMode;
  readonly context: AppContext;
  readonly accent: string;
}

export function buildTheme(mode: ThemeMode, context: AppContext): Theme {
  return {
    mode,
    context,
    accent: accentFor(context, mode),
    ...resolvePalette(mode),
  };
}
