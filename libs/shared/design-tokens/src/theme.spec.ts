// Testes da resolução de tema (doc 11 §4/§5.1/§13).
// Garante que Dark é o padrão, que Light usa os MESMOS nomes de token (só muda o
// valor) e que o accent é a única diferenciação por contexto — sem lógica de tema
// vazando para o consumidor.

import { color } from './color';
import { accentFor, buildTheme, resolvePalette } from './theme';

describe('resolvePalette', () => {
  it('resolve os neutros/semânticos do tema Dark a partir dos tokens', () => {
    const p = resolvePalette('dark');
    expect(p.bg.base).toBe(color.bg.base.dark);
    expect(p.bg.surface).toBe(color.bg.surface.dark);
    expect(p.bg.surface2).toBe(color.bg.surface2.dark);
    expect(p.text.primary).toBe(color.text.primary.dark);
    expect(p.text.onAccent).toBe(color.text.onAccent.dark);
    expect(p.border).toBe(color.border.dark);
    expect(p.semantic.critical).toBe(color.semantic.critical.dark);
  });

  it('resolve o tema Light usando os mesmos nomes, só trocando o valor', () => {
    const p = resolvePalette('light');
    expect(p.bg.base).toBe(color.bg.base.light);
    expect(p.text.primary).toBe(color.text.primary.light);
    expect(p.semantic.info).toBe(color.semantic.info.light);
  });

  it('onAccent é branco nos dois temas', () => {
    expect(resolvePalette('dark').text.onAccent).toBe('#FFFFFF');
    expect(resolvePalette('light').text.onAccent).toBe('#FFFFFF');
  });

  it('onCritical é resolvido (branco nos dois temas) e distinto do papel de accent', () => {
    expect(resolvePalette('dark').text.onCritical).toBe(color.text.onCritical.dark);
    expect(resolvePalette('light').text.onCritical).toBe('#FFFFFF');
  });

  it('a paleta resolvida NÃO expõe accent (accent entra por contexto)', () => {
    expect('accent' in resolvePalette('dark')).toBe(false);
  });
});

describe('accentFor', () => {
  it('resolve o accent de cada contexto por tema (doc 11 §13)', () => {
    expect(accentFor('core', 'dark')).toBe('#8B7FE0');
    expect(accentFor('core', 'light')).toBe('#5F4FCC');
    expect(accentFor('grow', 'dark')).toBe('#2E9E6B');
    expect(accentFor('grow', 'light')).toBe('#1F7A52');
    expect(accentFor('med', 'dark')).toBe('#6E7FE8');
    expect(accentFor('med', 'light')).toBe('#4A5BC4');
  });

  it('o accent de um app nunca vaza para outro (Med ≠ Grow ≠ Core)', () => {
    for (const mode of ['dark', 'light'] as const) {
      const values = [accentFor('core', mode), accentFor('grow', mode), accentFor('med', mode)];
      expect(new Set(values).size).toBe(3);
    }
  });
});

describe('buildTheme', () => {
  it('compõe modo + contexto + paleta resolvida', () => {
    const t = buildTheme('dark', 'med');
    expect(t.mode).toBe('dark');
    expect(t.context).toBe('med');
    expect(t.accent).toBe(color.accent.med.dark);
    expect(t.text.onAccent).toBe('#FFFFFF');
    expect(t.text.onCritical).toBe('#FFFFFF');
    expect(t.bg.base).toBe(color.bg.base.dark);
  });

  it('o primário (accent) do Med não é uma cor semântica de estado', () => {
    const t = buildTheme('light', 'med');
    const semanticValues = Object.values(t.semantic);
    expect(semanticValues).not.toContain(t.accent);
  });
});
