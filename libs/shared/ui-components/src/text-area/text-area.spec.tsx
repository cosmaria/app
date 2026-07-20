// Testes do TextArea (component-library família 12) — renderizado com
// react-test-renderer sobre o mock leve de `react-native`. Comportamentais/
// semânticos, sem snapshots. Foca no que distingue a Text Area do Text Field:
// multiline, altura mínima 96, autoexpansão e contador.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { Button, TextArea, TextField } from '../index';
import { borderWidth, color, opacity, radius } from '@cosmaria/shared-design-tokens';

(globalThis as Record<string, unknown>)['IS_REACT_ACT_ENVIRONMENT'] = true;

const originalConsoleError = console.error.bind(console);
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    const first = args[0];
    if (typeof first === 'string' && first.includes('react-test-renderer is deprecated')) return;
    originalConsoleError(...args);
  });
});
afterAll(() => {
  jest.restoreAllMocks();
});

function render(element: React.ReactElement): TestRenderer.ReactTestRenderer {
  let r!: TestRenderer.ReactTestRenderer;
  act(() => {
    r = TestRenderer.create(element);
  });
  return r;
}

const inputOf = (r: TestRenderer.ReactTestRenderer) => r.root.findByType('TextInput');

/** Caixa da área = a única View com borderWidth. */
function boxStyleOf(r: TestRenderer.ReactTestRenderer): Record<string, unknown> {
  const v = r.root.findAllByType('View').find((n) => {
    const s = StyleSheet.flatten(n.props.style);
    return s['borderWidth'] !== undefined;
  });
  if (!v) throw new Error('caixa da área não encontrada');
  return StyleSheet.flatten(v.props.style);
}

const rootStyleOf = (r: TestRenderer.ReactTestRenderer) =>
  StyleSheet.flatten(r.root.findAllByType('View')[0].props.style);

const textByContent = (r: TestRenderer.ReactTestRenderer, content: string) =>
  r.root.findAllByType('Text').find((t) => t.props.children === content);

const counterOf = (r: TestRenderer.ReactTestRenderer) =>
  r.root.findAllByType('Text').find((t) => /^\d+\/\d+$/.test(String(t.props.children)));

const focus = (r: TestRenderer.ReactTestRenderer): void => {
  act(() => {
    (inputOf(r).props.onFocus as (e: unknown) => void)({});
  });
};

describe('TextArea — render, multiline, export (1, 29, 30)', () => {
  it('renderiza uma área multilinha com altura mínima 96', () => {
    const r = render(<TextArea label="Observações" />);
    expect(inputOf(r).props.multiline).toBe(true);
    expect(inputOf(r).props['aria-multiline']).toBe(true);
    expect(boxStyleOf(r).minHeight).toBe(96);
  });

  it('é exportado publicamente sem quebrar a biblioteca existente', () => {
    expect(typeof TextArea).toBe('function');
    expect(typeof TextField).toBe('function');
    expect(typeof Button).toBe('function');
  });

  it('não usa ícones/afixos dentro da área (doc 03 §12)', () => {
    const r = render(<TextArea label="Notas" />);
    expect(
      r.root.findAllByProps({ importantForAccessibility: 'no-hide-descendants' }),
    ).toHaveLength(0);
  });
});

describe('TextArea — conteúdo (label, placeholder, value)', () => {
  it('mostra e associa o label (aria-labelledby)', () => {
    const r = render(<TextArea label="Descrição" />);
    expect(textByContent(r, 'Descrição')).toBeTruthy();
    expect(inputOf(r).props['aria-labelledby']).toBeDefined();
    expect(inputOf(r).props.accessibilityLabel).toBe('Descrição');
  });

  it('placeholder é exemplo, nunca substitui o label', () => {
    const r = render(<TextArea label="Bio" placeholder="fale sobre você" />);
    expect(inputOf(r).props.placeholder).toBe('fale sobre você');
    expect(textByContent(r, 'Bio')).toBeTruthy();
  });

  it('value controlado + onChangeText; defaultValue inicializa não-controlado', () => {
    const onChangeText = jest.fn();
    const r = render(<TextArea label="a" value="abc" onChangeText={onChangeText} />);
    expect(inputOf(r).props.value).toBe('abc');
    act(() => {
      (inputOf(r).props.onChangeText as (t: string) => void)('abcd');
    });
    expect(onChangeText).toHaveBeenCalledWith('abcd');
    expect(inputOf(render(<TextArea label="a" defaultValue="ini" />)).props.value).toBe('ini');
  });

  it('accessibilityLabel supre o nome sem label visível; hint repassado', () => {
    const r = render(<TextArea accessibilityLabel="Comentário" accessibilityHint="opcional" />);
    expect(inputOf(r).props.accessibilityLabel).toBe('Comentário');
    expect(inputOf(r).props.accessibilityHint).toBe('opcional');
    expect(textByContent(r, 'Comentário')).toBeUndefined();
  });
});

describe('TextArea — requiredness (Obrigatório/Opcional)', () => {
  it('required exibe "Obrigatório" + aria-required', () => {
    const r = render(<TextArea label="Motivo" required />);
    expect(textByContent(r, 'Obrigatório')).toBeTruthy();
    expect(inputOf(r).props['aria-required']).toBe(true);
  });

  it('opcional exibe "Opcional" sem aria-required', () => {
    const r = render(<TextArea label="Notas" />);
    expect(textByContent(r, 'Opcional')).toBeTruthy();
    expect(inputOf(r).props['aria-required']).toBeUndefined();
  });
});

describe('TextArea — contador (variante "Com contador")', () => {
  it('exibe o contador atual/limite quando showCounter + maxLength', () => {
    const r = render(<TextArea label="Bio" maxLength={200} showCounter defaultValue="oi" />);
    const counter = counterOf(r);
    expect(counter).toBeTruthy();
    expect(counter?.props.children).toBe('2/200');
  });

  it('contador acompanha o texto digitado', () => {
    const r = render(<TextArea label="Bio" maxLength={50} showCounter />);
    act(() => {
      (inputOf(r).props.onChangeText as (t: string) => void)('abcde');
    });
    expect(counterOf(r)?.props.children).toBe('5/50');
  });

  it('sem showCounter (ou sem maxLength) não há contador', () => {
    expect(counterOf(render(<TextArea label="a" maxLength={100} />))).toBeUndefined();
    expect(counterOf(render(<TextArea label="a" showCounter />))).toBeUndefined();
  });

  it('maxLength é repassado ao input', () => {
    expect(inputOf(render(<TextArea label="a" maxLength={120} />)).props.maxLength).toBe(120);
  });
});

describe('TextArea — disabled, readOnly, estados', () => {
  it('disabled bloqueia edição, aplica opacidade e anuncia', () => {
    const r = render(<TextArea label="a" disabled />);
    expect(inputOf(r).props.editable).toBe(false);
    expect(rootStyleOf(r).opacity).toBe(opacity.disabled);
    expect(inputOf(r).props['aria-disabled']).toBe(true);
    expect(inputOf(r).props.accessibilityState).toEqual({ disabled: true });
  });

  it('readOnly bloqueia edição, superfície distinta e aria-readonly', () => {
    const r = render(<TextArea label="a" readOnly mode="dark" />);
    expect(inputOf(r).props.editable).toBe(false);
    expect(inputOf(r).props['aria-readonly']).toBe(true);
    expect(boxStyleOf(r).backgroundColor).toBe(color.bg.surface2.dark);
  });

  it('error e warning usam a semântica própria na borda; error marca aria-invalid', () => {
    const e = render(<TextArea label="a" status="error" validationMessage="erro" mode="dark" />);
    expect(boxStyleOf(e).borderColor).toBe(color.semantic.critical.dark);
    expect(inputOf(e).props['aria-invalid']).toBe(true);
    const w = render(<TextArea label="a" status="warning" validationMessage="aviso" mode="dark" />);
    expect(boxStyleOf(w).borderColor).toBe(color.semantic.warning.dark);
  });

  it('mensagem de validação substitui o helper (não competem) e fica associada', () => {
    const r = render(
      <TextArea
        label="a"
        helperText="ajuda"
        status="error"
        validationMessage="corrija"
        mode="dark"
      />,
    );
    expect(textByContent(r, 'corrija')).toBeTruthy();
    expect(textByContent(r, 'ajuda')).toBeUndefined();
    const msg = textByContent(r, 'corrija');
    expect(inputOf(r).props['aria-describedby']).toBe(msg?.props.nativeID);
  });

  it('focused aplica ring de accent (borderWidth.focus)', () => {
    const r = render(<TextArea label="a" context="grow" mode="dark" />);
    expect(boxStyleOf(r).borderColor).toBe(color.border.dark);
    focus(r);
    expect(boxStyleOf(r).borderColor).toBe(color.accent.grow.dark);
    expect(boxStyleOf(r).borderWidth).toBe(borderWidth.focus);
  });
});

describe('TextArea — footer e ausência de espaço', () => {
  it('sem helper/validação/contador não há rodapé', () => {
    const r = render(<TextArea label="Nome" />);
    // Só label + marcador (2 Text); nenhum texto de suporte/contador.
    expect(r.root.findAllByType('Text')).toHaveLength(2);
    expect(inputOf(r).props['aria-describedby']).toBeUndefined();
  });

  it('helper aparece e é associado quando não há validação', () => {
    const r = render(<TextArea label="Bio" helperText="até 3 linhas" />);
    const helper = textByContent(r, 'até 3 linhas');
    expect(helper).toBeTruthy();
    expect(inputOf(r).props['aria-describedby']).toBe(helper?.props.nativeID);
  });
});

describe('TextArea — contexto/tema por tokens e sem hardcode', () => {
  it('Core/Grow/Med resolvem o accent do foco por contexto', () => {
    for (const ctx of ['core', 'grow', 'med'] as const) {
      const r = render(<TextArea label="a" context={ctx} mode="dark" />);
      focus(r);
      expect(boxStyleOf(r).borderColor).toBe(color.accent[ctx].dark);
    }
  });

  it('Dark e Light resolvem cores por token (mesmo componente)', () => {
    expect(boxStyleOf(render(<TextArea label="a" mode="dark" />)).borderColor).toBe(
      color.border.dark,
    );
    expect(boxStyleOf(render(<TextArea label="a" mode="light" />)).borderColor).toBe(
      color.border.light,
    );
  });

  it('não inlina hexadecimais no componente e usa radius oficial', () => {
    const src = readFileSync(resolve(__dirname, 'text-area.tsx'), 'utf8');
    expect(src.match(/#[0-9A-Fa-f]{6}/g) ?? []).toHaveLength(0);
    expect(boxStyleOf(render(<TextArea label="a" />)).borderRadius).toBe(radius.md);
  });
});
