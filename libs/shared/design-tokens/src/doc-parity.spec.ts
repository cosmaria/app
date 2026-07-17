// Paridade entre a DOCUMENTAÇÃO oficial e o CÓDIGO.
//
// A tabela de tokens do doc 11 §5.1 (docs/11-design-system.md) é a fonte de
// verdade. Este teste lê o markdown e verifica que cada valor de cor no código
// bate com o publicado no documento, incluindo a tradução de nomenclatura
// kebab-case (doc) → camelCase (código): `color.text.on-accent` ↔ onAccent e
// `color.bg.surface-2` ↔ surface2. Se doc e código divergirem, isto falha —
// impedindo drift silencioso entre especificação e implementação.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { color, type ThemedColor } from './color';

const DOC_PATH = resolve(__dirname, '../../../../docs/11-design-system.md');
const doc = readFileSync(DOC_PATH, 'utf8');
const lines = doc.split(/\r?\n/);

// Não-global para `.test` (evita o estado de lastIndex de um regex global);
// versão global só para extrair todas as ocorrências com `.match`.
const HEX = /#[0-9A-Fa-f]{6}/;
const HEX_ALL = /#[0-9A-Fa-f]{6}/g;

/**
 * Encontra a linha de TABELA (começa com `|`) que define um token e devolve os
 * hex na ordem [dark, light]. O token é casado entre crases para desambiguar
 * `color.bg.surface` de `color.bg.surface-2`.
 */
function docColorsFor(docToken: string): { dark: string; light: string } {
  const needle = '`' + docToken + '`';
  const row = lines.find((l) => l.trimStart().startsWith('|') && l.includes(needle) && HEX.test(l));
  if (!row) throw new Error(`Token não encontrado na tabela do doc 11: ${docToken}`);
  const hexes = row.match(HEX_ALL);
  if (!hexes || hexes.length < 2) {
    throw new Error(`Linha do token ${docToken} não tem 2 valores hex: ${row}`);
  }
  return { dark: hexes[0].toUpperCase(), light: hexes[1].toUpperCase() };
}

/** Mapeia o nome de token do doc (kebab) para o acessor do código (camelCase). */
const CASES: Array<{ docToken: string; code: ThemedColor }> = [
  { docToken: 'color.bg.base', code: color.bg.base },
  { docToken: 'color.bg.surface', code: color.bg.surface },
  { docToken: 'color.bg.surface-2', code: color.bg.surface2 }, // kebab → camel
  { docToken: 'color.text.primary', code: color.text.primary },
  { docToken: 'color.text.secondary', code: color.text.secondary },
  { docToken: 'color.text.tertiary', code: color.text.tertiary },
  { docToken: 'color.text.on-accent', code: color.text.onAccent }, // kebab → camel
  { docToken: 'color.border', code: color.border },
  { docToken: 'color.semantic.success', code: color.semantic.success },
  { docToken: 'color.semantic.warning', code: color.semantic.warning },
  { docToken: 'color.semantic.critical', code: color.semantic.critical },
  { docToken: 'color.semantic.info', code: color.semantic.info },
  { docToken: 'color.accent.core', code: color.accent.core },
  { docToken: 'color.accent.grow', code: color.accent.grow },
  { docToken: 'color.accent.med', code: color.accent.med },
];

describe('paridade doc 11 §5.1 ↔ código', () => {
  it('o documento fonte existe e contém a tabela de cor', () => {
    expect(doc).toContain('color.accent.med');
    expect(doc.length).toBeGreaterThan(1000);
  });

  it.each(CASES)('$docToken bate em Dark e Light', ({ docToken, code }) => {
    const fromDoc = docColorsFor(docToken);
    expect(code.dark.toUpperCase()).toBe(fromDoc.dark);
    expect(code.light.toUpperCase()).toBe(fromDoc.light);
  });

  it('Med no doc é exatamente #6E7FE8 / #4A5BC4 (valor citado na especificação)', () => {
    const fromDoc = docColorsFor('color.accent.med');
    expect(fromDoc).toEqual({ dark: '#6E7FE8', light: '#4A5BC4' });
  });

  it('a nomenclatura kebab-case do doc traduz para camelCase no código', () => {
    // Presença no doc (kebab) — os acessores camelCase equivalentes existem no código.
    expect(doc).toContain('color.text.on-accent');
    expect(doc).toContain('color.bg.surface-2');
    expect(color.text.onAccent).toBeDefined();
    expect(color.bg.surface2).toBeDefined();
  });
});
