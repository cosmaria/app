// Export dos tokens para o Figma (organizado nas mesmas coleções que o plugin
// COSMARIA cria: Color/Theme, Color/Context, Dimension/Scale, Opacity/Semantic).
//
// Objetivo: uma fonte ÚNICA. Este módulo deriva a estrutura dos tokens canônicos
// (color, spacing, radius, opacity) — se um token for renomeado/removido, este
// arquivo quebra o typecheck, o que impede o export de divergir do código.
//
// O artefato serializado vive em `figma/cosmaria.tokens.json`, importável por um
// exportador de Variables do Figma / Tokens Studio, e serve para RECONCILIAR os
// valores que o plugin hoje embute inline (ver figma/README.md).

import { color } from './color';
import { spacing } from './spacing';
import { radius, borderWidth } from './radius';
import { opacity } from './opacity';

export type FigmaVariableType = 'COLOR' | 'FLOAT';

export interface FigmaVariable {
  readonly type: FigmaVariableType;
  /** Valor por nome de mode da coleção (ex.: Dark/Light, Core/Grow/Med, Default). */
  readonly values: Readonly<Record<string, string | number>>;
  readonly description?: string;
}

export interface FigmaCollection {
  readonly modes: readonly string[];
  readonly variables: Readonly<Record<string, FigmaVariable>>;
}

export type FigmaTokenExport = Readonly<Record<string, FigmaCollection>>;

/** Constrói o export a partir dos tokens canônicos (single source, typechecked). */
export function buildFigmaTokens(): FigmaTokenExport {
  const themed = (dark: string, light: string, description?: string): FigmaVariable => ({
    type: 'COLOR',
    values: { Dark: dark, Light: light },
    ...(description ? { description } : {}),
  });

  const scalar = (value: number, description?: string): FigmaVariable => ({
    type: 'FLOAT',
    values: { Default: value },
    ...(description ? { description } : {}),
  });

  return {
    'Color/Theme': {
      modes: ['Dark', 'Light'],
      variables: {
        'bg/base': themed(color.bg.base.dark, color.bg.base.light, 'Fundo de aplicação'),
        'bg/surface': themed(color.bg.surface.dark, color.bg.surface.light, 'Superfície principal'),
        'bg/surface-2': themed(
          color.bg.surface2.dark,
          color.bg.surface2.light,
          'Superfície elevada',
        ),
        'text/primary': themed(color.text.primary.dark, color.text.primary.light),
        'text/secondary': themed(color.text.secondary.dark, color.text.secondary.light),
        'text/tertiary': themed(color.text.tertiary.dark, color.text.tertiary.light),
        'text/on-accent': themed(
          color.text.onAccent.dark,
          color.text.onAccent.light,
          'Texto/ícone sobre superfície Accent',
        ),
        'text/on-critical': themed(
          color.text.onCritical.dark,
          color.text.onCritical.light,
          'Texto/ícone sobre superfície semântica crítica',
        ),
        border: themed(color.border.dark, color.border.light),
        'semantic/success': themed(color.semantic.success.dark, color.semantic.success.light),
        'semantic/warning': themed(color.semantic.warning.dark, color.semantic.warning.light),
        'semantic/critical': themed(color.semantic.critical.dark, color.semantic.critical.light),
        'semantic/info': themed(color.semantic.info.dark, color.semantic.info.light),
      },
    },
    'Color/Context': {
      modes: ['Core', 'Grow', 'Med'],
      variables: {
        'accent/dark': {
          type: 'COLOR',
          values: {
            Core: color.accent.core.dark,
            Grow: color.accent.grow.dark,
            Med: color.accent.med.dark,
          },
          description: 'Accent por contexto (tema Dark)',
        },
        'accent/light': {
          type: 'COLOR',
          values: {
            Core: color.accent.core.light,
            Grow: color.accent.grow.light,
            Med: color.accent.med.light,
          },
          description: 'Accent por contexto (tema Light)',
        },
      },
    },
    'Dimension/Scale': {
      modes: ['Default'],
      variables: {
        'space/1': scalar(spacing['1']),
        'space/2': scalar(spacing['2']),
        'space/3': scalar(spacing['3']),
        'space/4': scalar(spacing['4']),
        'space/6': scalar(spacing['6']),
        'space/8': scalar(spacing['8']),
        'space/12': scalar(spacing['12']),
        'space/16': scalar(spacing['16']),
        'space/24': scalar(spacing['24']),
        'radius/sm': scalar(radius.sm),
        'radius/md': scalar(radius.md),
        'radius/lg': scalar(radius.lg),
        'radius/pill': scalar(radius.pill),
        'border/hairline': scalar(borderWidth.hairline),
        'border/focus': scalar(borderWidth.focus),
      },
    },
    'Opacity/Semantic': {
      modes: ['Default'],
      variables: {
        disabled: scalar(opacity.disabled),
        overlay: scalar(opacity.overlay),
        'hover-overlay': scalar(opacity.hoverOverlay),
      },
    },
  };
}
