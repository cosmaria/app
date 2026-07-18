// Testes dos tokens escalares (espaçamento, raio, opacidade, motion, layout,
// tipografia), da estabilidade dos exports públicos do pacote e da paridade do
// export Figma com os tokens canônicos (fonte ÚNICA — doc 11 §5, §17).

// Importa o barrel público relativo (a que o alias @cosmaria/shared-design-tokens
// resolve) — mesma superfície pública, respeitando as fronteiras Nx (import
// relativo dentro do próprio projeto).
import * as publicApi from './index';
import { color } from './color';
import { spacing } from './spacing';
import { radius, borderWidth } from './radius';
import { opacity } from './opacity';
import { duration, easing } from './motion';
import { fontSize, fontWeight, lineHeight } from './typography';
import { breakpoint, gridColumns, gridGutter, minTouchTarget, contrastMinimum } from './layout';
import { buildFigmaTokens } from './figma-tokens';

describe('escala de espaçamento (doc 11 §5.3)', () => {
  it('base 4px com os degraus oficiais', () => {
    expect(spacing).toEqual({
      '1': 4,
      '2': 8,
      '3': 12,
      '4': 16,
      '6': 24,
      '8': 32,
      '12': 48,
      '16': 64,
      '24': 96,
    });
  });

  it('todos os valores são múltiplos positivos de 4', () => {
    for (const v of Object.values(spacing)) {
      expect(v).toBeGreaterThan(0);
      expect(v % 4).toBe(0);
    }
  });
});

describe('raio e borda (doc 11 §5.4)', () => {
  it('escala de raio oficial', () => {
    expect(radius).toEqual({ sm: 4, md: 8, lg: 16, pill: 999 });
  });
  it('espessuras de borda (hairline/focus)', () => {
    expect(borderWidth).toEqual({ hairline: 1, focus: 2 });
  });
});

describe('opacidade (doc 11 §5.6)', () => {
  it('valores oficiais e faixa de hover 8–12%', () => {
    expect(opacity.disabled).toBe(0.4);
    expect(opacity.overlay).toBe(0.6);
    expect(opacity.hoverOverlay).toBe(0.1);
    expect(opacity.hoverOverlay).toBeGreaterThanOrEqual(opacity.hoverOverlayMin);
    expect(opacity.hoverOverlay).toBeLessThanOrEqual(opacity.hoverOverlayMax);
  });
  it('toda opacidade fica no intervalo [0,1]', () => {
    for (const v of Object.values(opacity)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

describe('motion (doc 11 §5.7)', () => {
  it('durações oficiais em ms, estritamente crescentes', () => {
    expect(duration).toEqual({ instant: 100, fast: 150, base: 200, slow: 300, deliberate: 500 });
    const seq = [
      duration.instant,
      duration.fast,
      duration.base,
      duration.slow,
      duration.deliberate,
    ];
    for (let i = 1; i < seq.length; i++) expect(seq[i]).toBeGreaterThan(seq[i - 1]);
  });
  it('cada easing é um cubic-bezier de 4 coeficientes', () => {
    for (const curve of Object.values(easing)) {
      expect(curve).toHaveLength(4);
      for (const c of curve) expect(typeof c).toBe('number');
    }
  });
});

describe('tipografia (doc 11 §5.2)', () => {
  it('escala tipográfica oficial', () => {
    expect(fontSize).toEqual({
      xs: 12,
      sm: 14,
      base: 16,
      md: 18,
      lg: 20,
      xl: 24,
      '2xl': 30,
      '3xl': 38,
      '4xl': 48,
    });
  });
  it('pesos como string numérica (compatível com React Native)', () => {
    expect(fontWeight).toEqual({
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    });
  });
  it('lineHeight de metadados nunca abaixo de 1.3', () => {
    expect(lineHeight.snug).toBeGreaterThanOrEqual(1.3);
  });
});

describe('layout e acessibilidade (doc 11 §5.8, §9)', () => {
  it('breakpoints, grid e gutter', () => {
    expect(breakpoint).toEqual({ mobile: 0, tablet: 600, desktop: 1024 });
    expect(gridColumns).toEqual({ mobile: 4, tablet: 8, desktop: 12 });
    expect(gridGutter).toBe(spacing['4']);
  });
  it('alvo mínimo de toque de 44px (WCAG / doc 11 §9)', () => {
    expect(minTouchTarget).toBe(44);
  });
  it('pisos de contraste WCAG AA', () => {
    expect(contrastMinimum.normalText).toBe(4.5);
    expect(contrastMinimum.largeText).toBe(3);
  });
});

describe('estabilidade dos exports públicos (@cosmaria/shared-design-tokens)', () => {
  // Trava a superfície pública do pacote: remover/renomear um export é uma
  // quebra de contrato e deve falhar aqui, não silenciosamente no consumidor.
  const expected = [
    'color',
    'fontFamily',
    'fontSize',
    'fontWeight',
    'lineHeight',
    'spacing',
    'radius',
    'borderWidth',
    'elevationUsage',
    'elevationShadowLight',
    'opacity',
    'duration',
    'easing',
    'breakpoint',
    'gridColumns',
    'gridGutter',
    'minTouchTarget',
    'contrastMinimum',
    'resolvePalette',
    'accentFor',
    'buildTheme',
    'buildFigmaTokens',
  ];

  it.each(expected)('exporta `%s`', (name) => {
    expect((publicApi as Record<string, unknown>)[name]).toBeDefined();
  });

  it('funções públicas são chamáveis', () => {
    expect(typeof publicApi.resolvePalette).toBe('function');
    expect(typeof publicApi.accentFor).toBe('function');
    expect(typeof publicApi.buildTheme).toBe('function');
    expect(typeof publicApi.buildFigmaTokens).toBe('function');
  });
});

describe('paridade do export Figma com os tokens canônicos (fonte única)', () => {
  const figma = buildFigmaTokens();

  it('Color/Theme text/on-accent = color.text.onAccent', () => {
    const v = figma['Color/Theme'].variables['text/on-accent'];
    expect(v.values['Dark']).toBe(color.text.onAccent.dark);
    expect(v.values['Light']).toBe(color.text.onAccent.light);
  });

  it('Color/Theme text/on-critical = color.text.onCritical', () => {
    const v = figma['Color/Theme'].variables['text/on-critical'];
    expect(v.values['Dark']).toBe(color.text.onCritical.dark);
    expect(v.values['Light']).toBe(color.text.onCritical.light);
  });

  it('Color/Context accent Med (Dark/Light) = color.accent.med', () => {
    expect(figma['Color/Context'].variables['accent/dark'].values['Med']).toBe(
      color.accent.med.dark,
    );
    expect(figma['Color/Context'].variables['accent/light'].values['Med']).toBe(
      color.accent.med.light,
    );
  });

  it('Dimension/Scale space/6 = spacing[6] = 24', () => {
    expect(figma['Dimension/Scale'].variables['space/6'].values['Default']).toBe(spacing['6']);
    expect(spacing['6']).toBe(24);
  });

  it('nenhum valor de cor do export Figma diverge do token canônico', () => {
    const theme = figma['Color/Theme'].variables;
    expect(theme['semantic/critical'].values['Dark']).toBe(color.semantic.critical.dark);
    expect(theme['bg/base'].values['Light']).toBe(color.bg.base.light);
    expect(theme['border'].values['Dark']).toBe(color.border.dark);
  });
});
