// Testes dos tokens de cor — trava os valores APROVADOS (doc 11 §5.1) contra
// regressão acidental. NÃO redefine nenhuma decisão visual: apenas verifica que
// o código continua espelhando a fonte de verdade (docs/11-design-system.md §5.1
// e design-system/01-visual-language §12), e as invariantes estruturais do
// sistema (accent ≠ semântica, crítico independente do accent, on-accent branco).

import { color, type AppContext, type ColorTokens, type ThemedColor } from './color';

/** Regex de cor hex de 6 dígitos — todo valor de cor deve casar (doc 11 §5.1). */
const HEX6 = /^#[0-9A-F]{6}$/;

/** Achata a árvore de tokens em pares [caminho, ThemedColor]. */
function flattenThemed(
  node: unknown,
  path: string[] = [],
): Array<{ path: string; value: ThemedColor }> {
  const out: Array<{ path: string; value: ThemedColor }> = [];
  if (
    node &&
    typeof node === 'object' &&
    'dark' in (node as Record<string, unknown>) &&
    'light' in (node as Record<string, unknown>)
  ) {
    out.push({ path: path.join('.'), value: node as ThemedColor });
    return out;
  }
  if (node && typeof node === 'object') {
    for (const [key, child] of Object.entries(node as Record<string, unknown>)) {
      out.push(...flattenThemed(child, [...path, key]));
    }
  }
  return out;
}

const allThemed = flattenThemed(color);

describe('color — valores aprovados (doc 11 §5.1)', () => {
  it('Accent Core: Dark #8B7FE0, Light #5F4FCC', () => {
    expect(color.accent.core).toEqual({ dark: '#8B7FE0', light: '#5F4FCC' });
  });

  it('Accent Grow: Dark #2E9E6B, Light #1F7A52', () => {
    expect(color.accent.grow).toEqual({ dark: '#2E9E6B', light: '#1F7A52' });
  });

  it('Accent Med: Dark #6E7FE8, Light #4A5BC4', () => {
    // Valor explicitamente citado na tarefa e no doc 11 §5.1 / 01-visual-language §9.2.
    expect(color.accent.med.dark).toBe('#6E7FE8');
    expect(color.accent.med.light).toBe('#4A5BC4');
  });

  it('color.text.onAccent = #FFFFFF em Dark e Light', () => {
    // Branco nos dois temas: o accent é saturado em Dark e Light (doc 11 §5.1, nota).
    expect(color.text.onAccent.dark).toBe('#FFFFFF');
    expect(color.text.onAccent.light).toBe('#FFFFFF');
  });

  it('Semânticos batem com o doc 11 §5.1', () => {
    expect(color.semantic.success).toEqual({ dark: '#34C77B', light: '#1E9A5C' });
    expect(color.semantic.warning).toEqual({ dark: '#E8A93E', light: '#B9791E' });
    expect(color.semantic.critical).toEqual({ dark: '#E5675E', light: '#C6382E' });
    expect(color.semantic.info).toEqual({ dark: '#4EA1E8', light: '#1F71B8' });
  });

  it('Neutros de fundo, texto e borda batem com o doc 11 §5.1', () => {
    expect(color.bg.base).toEqual({ dark: '#0B0F14', light: '#F7F8FA' });
    expect(color.bg.surface).toEqual({ dark: '#12181F', light: '#FFFFFF' });
    expect(color.bg.surface2).toEqual({ dark: '#1A222B', light: '#EEF1F4' });
    expect(color.text.primary).toEqual({ dark: '#EDF1F5', light: '#10151A' });
    expect(color.text.secondary).toEqual({ dark: '#9AA7B2', light: '#4B5760' });
    expect(color.text.tertiary).toEqual({ dark: '#6B7885', light: '#7C8790' });
    expect(color.border).toEqual({ dark: '#232D38', light: '#DDE3E8' });
  });
});

describe('color — validade dos valores', () => {
  it('todo token de cor tem os dois temas como hex #RRGGBB válido', () => {
    expect(allThemed.length).toBeGreaterThan(0);
    for (const { path, value } of allThemed) {
      // path entra no objeto comparado para localizar a falha sem 2º arg de expect.
      expect({ path, dark: HEX6.test(value.dark) }).toEqual({ path, dark: true });
      expect({ path, light: HEX6.test(value.light) }).toEqual({ path, light: true });
    }
  });

  it('nenhum token tem valor vazio, nulo ou não-string', () => {
    for (const { value } of allThemed) {
      expect(typeof value.dark).toBe('string');
      expect(typeof value.light).toBe('string');
    }
  });
});

describe('color — presença dos tokens obrigatórios', () => {
  it('expõe todos os grupos e chaves obrigatórios (doc 11 §5.1)', () => {
    expect(Object.keys(color.bg).sort()).toEqual(['base', 'surface', 'surface2']);
    expect(Object.keys(color.text).sort()).toEqual([
      'onAccent',
      'primary',
      'secondary',
      'tertiary',
    ]);
    expect(Object.keys(color.semantic).sort()).toEqual(['critical', 'info', 'success', 'warning']);
    expect(Object.keys(color.accent).sort()).toEqual(['core', 'grow', 'med']);
    expect(color.border).toBeDefined();
  });
});

describe('color — separação Accent × Semântica (doc 11 §5.1)', () => {
  const accents = Object.values(color.accent);
  const semantics = Object.values(color.semantic);

  it('nenhum valor de Accent coincide com um valor Semântico (accent nunca é estado)', () => {
    for (const mode of ['dark', 'light'] as const) {
      const accentValues = accents.map((a) => a[mode]);
      const semanticValues = semantics.map((s) => s[mode]);
      for (const av of accentValues) {
        expect(semanticValues).not.toContain(av);
      }
    }
  });

  it('cor crítica é independente do Accent — nunca reaproveita um accent', () => {
    for (const mode of ['dark', 'light'] as const) {
      const accentValues = accents.map((a) => a[mode]);
      expect(accentValues).not.toContain(color.semantic.critical[mode]);
    }
  });
});

describe('color — ausência de tokens duplicados com nomes diferentes', () => {
  it('cada Accent de contexto é distinto dos demais em cada tema', () => {
    for (const mode of ['dark', 'light'] as const) {
      const values = [color.accent.core[mode], color.accent.grow[mode], color.accent.med[mode]];
      expect(new Set(values).size).toBe(values.length);
    }
  });

  it('a paleta de identidade+semântica não colapsa dois nomes no mesmo valor', () => {
    // onAccent (#FFFFFF) é neutro e fica fora deste conjunto — repetição de branco
    // com bg.surface.light é intencional, não duplicação de identidade.
    for (const mode of ['dark', 'light'] as const) {
      const identity = [
        ...Object.values(color.accent).map((c) => c[mode]),
        ...Object.values(color.semantic).map((c) => c[mode]),
      ];
      expect(new Set(identity).size).toBe(identity.length);
    }
  });
});

describe('color — compatibilidade de tipos exportados', () => {
  it('AppContext cobre exatamente core|grow|med e indexa color.accent', () => {
    const contexts: AppContext[] = ['core', 'grow', 'med'];
    for (const ctx of contexts) {
      const themed: ThemedColor = color.accent[ctx];
      expect(themed.dark).toMatch(HEX6);
      expect(themed.light).toMatch(HEX6);
    }
  });

  it('ColorTokens reflete a forma pública de `color` (checagem estrutural)', () => {
    // Falha de COMPILAÇÃO se a forma pública mudar de modo incompatível.
    const sample: Pick<ColorTokens, 'accent' | 'semantic'> = {
      accent: color.accent,
      semantic: color.semantic,
    };
    expect(sample.accent.med).toBe(color.accent.med);
  });
});
