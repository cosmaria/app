// Testes do TextField — renderizado com react-test-renderer sobre o mock leve de
// `react-native` (mesma infra do Button/IconButton). Comportamentais/semânticos,
// sem snapshots. Cobre os 30 requisitos da tarefa.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { Button, IconButton, TextField } from '../index';
import {
  accentFor,
  borderWidth,
  color,
  fontSize,
  opacity,
  radius,
} from '@cosmaria/shared-design-tokens';

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
const inputStyleOf = (r: TestRenderer.ReactTestRenderer) =>
  StyleSheet.flatten(inputOf(r).props.style);

/** Container do campo = a única View com flexDirection row E borderWidth. */
function fieldStyleOf(r: TestRenderer.ReactTestRenderer): Record<string, unknown> {
  const v = r.root.findAllByType('View').find((n) => {
    const s = StyleSheet.flatten(n.props.style);
    return s['flexDirection'] === 'row' && s['borderWidth'] !== undefined;
  });
  if (!v) throw new Error('container do campo não encontrado');
  return StyleSheet.flatten(v.props.style);
}

const rootStyleOf = (r: TestRenderer.ReactTestRenderer) =>
  StyleSheet.flatten(r.root.findAllByType('View')[0].props.style);

const textByContent = (r: TestRenderer.ReactTestRenderer, content: string) =>
  r.root.findAllByType('Text').find((t) => t.props.children === content);

function mustText(r: TestRenderer.ReactTestRenderer, content: string) {
  const node = textByContent(r, content);
  if (!node) throw new Error(`Text não encontrado: ${content}`);
  return node;
}

const focus = (r: TestRenderer.ReactTestRenderer): void => {
  act(() => {
    (inputOf(r).props.onFocus as (e: unknown) => void)({});
  });
};

describe('TextField — render, export, retrocompat (1, 29, 30)', () => {
  it('renderiza o campo com input', () => {
    const r = render(<TextField label="Nome" />);
    expect(inputOf(r)).toBeTruthy();
  });

  it('é exportado publicamente sem quebrar a biblioteca existente', () => {
    expect(typeof TextField).toBe('function');
    expect(typeof Button).toBe('function');
    expect(typeof IconButton).toBe('function');
  });
});

describe('TextField — conteúdo básico (2, 3, 4, 22, 23)', () => {
  it('mostra o label e o associa ao input (aria-labelledby)', () => {
    const r = render(<TextField label="E-mail" />);
    expect(textByContent(r, 'E-mail')).toBeTruthy();
    expect(inputOf(r).props['aria-labelledby']).toBeDefined();
    expect(inputOf(r).props.accessibilityLabel).toBe('E-mail');
  });

  it('placeholder é exemplo, nunca substitui o label', () => {
    const r = render(<TextField label="Nome" placeholder="ex.: Maria" />);
    expect(inputOf(r).props.placeholder).toBe('ex.: Maria');
    // O label continua presente (não foi substituído pelo placeholder).
    expect(textByContent(r, 'Nome')).toBeTruthy();
  });

  it('value controlado e onChangeText', () => {
    const onChangeText = jest.fn();
    const r = render(<TextField label="Nome" value="abc" onChangeText={onChangeText} />);
    expect(inputOf(r).props.value).toBe('abc');
    act(() => {
      (inputOf(r).props.onChangeText as (t: string) => void)('abcd');
    });
    expect(onChangeText).toHaveBeenCalledWith('abcd');
  });

  it('defaultValue inicializa o campo não-controlado', () => {
    const r = render(<TextField label="Nome" defaultValue="inicial" />);
    expect(inputOf(r).props.value).toBe('inicial');
  });

  it('accessibilityLabel supre o nome quando não há label visível; hint é repassado', () => {
    const r = render(
      <TextField accessibilityLabel="Busca" accessibilityHint="digite e confirme" />,
    );
    expect(inputOf(r).props.accessibilityLabel).toBe('Busca');
    expect(inputOf(r).props.accessibilityHint).toBe('digite e confirme');
    // Sem label visível: nenhuma linha de label.
    expect(textByContent(r, 'Busca')).toBeUndefined();
  });
});

describe('TextField — required/optional (6)', () => {
  it('required marca "obrigatório" e define aria-required', () => {
    const r = render(<TextField label="CPF" required />);
    expect(textByContent(r, 'obrigatório')).toBeTruthy();
    expect(inputOf(r).props['aria-required']).toBe(true);
  });

  it('não-required marca "opcional" (vocabulário oficial) sem aria-required', () => {
    const r = render(<TextField label="Apelido" />);
    expect(textByContent(r, 'opcional')).toBeTruthy();
    expect(inputOf(r).props['aria-required']).toBeUndefined();
  });
});

describe('TextField — disabled e readOnly (7, 8, 9, 24)', () => {
  it('disabled bloqueia edição, aplica opacidade e anuncia estado', () => {
    const r = render(<TextField label="Nome" disabled />);
    expect(inputOf(r).props.editable).toBe(false);
    expect(rootStyleOf(r).opacity).toBe(opacity.disabled);
    expect(inputOf(r).props['aria-disabled']).toBe(true);
    expect(inputOf(r).props.accessibilityState).toEqual({ disabled: true });
  });

  it('readOnly bloqueia edição, usa superfície distinta e anuncia aria-readonly', () => {
    const r = render(<TextField label="Nome" readOnly mode="dark" />);
    expect(inputOf(r).props.editable).toBe(false);
    expect(inputOf(r).props['aria-readonly']).toBe(true);
    expect(fieldStyleOf(r).backgroundColor).toBe(color.bg.surface2.dark);
  });
});

describe('TextField — estados semânticos e validação (10, 11, 25)', () => {
  it('error usa a semântica crítica na borda e marca aria-invalid', () => {
    const r = render(
      <TextField label="E-mail" status="error" validationMessage="E-mail inválido" mode="dark" />,
    );
    expect(fieldStyleOf(r).borderColor).toBe(color.semantic.critical.dark);
    expect(inputOf(r).props['aria-invalid']).toBe(true);
  });

  it('mensagem de validação substitui o helper (não competem) e fica associada', () => {
    const r = render(
      <TextField
        label="E-mail"
        helperText="usaremos para contato"
        status="error"
        validationMessage="E-mail inválido"
        mode="dark"
      />,
    );
    // A mensagem de validação aparece; o helper é suprimido.
    expect(textByContent(r, 'E-mail inválido')).toBeTruthy();
    expect(textByContent(r, 'usaremos para contato')).toBeUndefined();
    // Cor da mensagem = crítico (reforço, não único indicador — o texto explica).
    const msg = mustText(r, 'E-mail inválido');
    expect(StyleSheet.flatten(msg.props.style).color).toBe(color.semantic.critical.dark);
    // Associação: input aria-describedby === nativeID da mensagem.
    expect(inputOf(r).props['aria-describedby']).toBe(msg.props.nativeID);
  });

  it('warning e success são estados oficiais (borda semântica própria)', () => {
    const w = render(
      <TextField label="a" status="warning" validationMessage="atenção" mode="dark" />,
    );
    expect(fieldStyleOf(w).borderColor).toBe(color.semantic.warning.dark);
    const s = render(<TextField label="a" status="success" validationMessage="ok" mode="dark" />);
    expect(fieldStyleOf(s).borderColor).toBe(color.semantic.success.dark);
  });
});

describe('TextField — helper e foco (5, 12)', () => {
  it('helper text aparece e é associado quando não há validação', () => {
    const r = render(<TextField label="Senha" helperText="mínimo 8 caracteres" />);
    const helper = mustText(r, 'mínimo 8 caracteres');
    expect(inputOf(r).props['aria-describedby']).toBe(helper.props.nativeID);
  });

  it('focused aplica ring de accent (borderWidth.focus)', () => {
    const r = render(<TextField label="Nome" context="core" mode="dark" />);
    expect(fieldStyleOf(r).borderColor).toBe(color.border.dark);
    focus(r);
    expect(fieldStyleOf(r).borderColor).toBe(color.accent.core.dark);
    expect(fieldStyleOf(r).borderWidth).toBe(borderWidth.focus);
  });
});

describe('TextField — escopo: sem multiline nem contador (13, 16)', () => {
  it('é single-line: não habilita multiline (Text Area é a família 12)', () => {
    const r = render(<TextField label="Nome" />);
    expect(inputOf(r).props.multiline).toBeFalsy();
  });

  it('não renderiza contador de caracteres (recurso da Text Area)', () => {
    const r = render(<TextField label="Nome" maxLength={10} defaultValue="ab" />);
    // Nenhum texto de contador tipo "2/10".
    expect(
      r.root.findAllByType('Text').some((t) => /\d+\s*\/\s*\d+/.test(String(t.props.children))),
    ).toBe(false);
  });
});

describe('TextField — secureTextEntry e maxLength (14, 15)', () => {
  it('secureTextEntry preserva o nome acessível', () => {
    const r = render(<TextField label="Senha" secureTextEntry />);
    expect(inputOf(r).props.secureTextEntry).toBe(true);
    expect(inputOf(r).props.accessibilityLabel).toBe('Senha');
  });

  it('maxLength é repassado ao input', () => {
    const r = render(<TextField label="PIN" maxLength={6} />);
    expect(inputOf(r).props.maxLength).toBe(6);
  });
});

describe('TextField — ícones, afixos e ausência de espaço (17, 18, 19, 20, 21)', () => {
  it('startIcon é renderizado e tratado como decorativo', () => {
    const icon = React.createElement('Glyph', { testID: 'start' });
    const r = render(<TextField label="Busca" startIcon={icon} />);
    expect(r.root.findAllByProps({ testID: 'start' }).length).toBeGreaterThan(0);
    expect(
      r.root.findAllByProps({ importantForAccessibility: 'no-hide-descendants' }).length,
    ).toBeGreaterThan(0);
  });

  it('endIcon é renderizado', () => {
    const icon = React.createElement('Glyph', { testID: 'end' });
    const r = render(<TextField label="Busca" endIcon={icon} />);
    expect(r.root.findAllByProps({ testID: 'end' }).length).toBeGreaterThan(0);
  });

  it('prefix e suffix textuais são renderizados', () => {
    const r = render(<TextField label="Site" prefix="https://" suffix=".com" />);
    expect(textByContent(r, 'https://')).toBeTruthy();
    expect(textByContent(r, '.com')).toBeTruthy();
  });

  it('sem elementos opcionais não reserva espaço (sem ícone/afixo/suporte)', () => {
    const r = render(<TextField label="Nome" />);
    // Nenhum ícone decorativo, nenhum afixo, nenhuma linha de suporte.
    expect(
      r.root.findAllByProps({ importantForAccessibility: 'no-hide-descendants' }),
    ).toHaveLength(0);
    expect(inputOf(r).props['aria-describedby']).toBeUndefined();
    // Só label + marcador (2 Text); nenhum texto de suporte extra.
    expect(r.root.findAllByType('Text')).toHaveLength(2);
  });
});

describe('TextField — contexto e tema por tokens (26, 27)', () => {
  it('Core/Grow/Med resolvem o accent do foco por contexto (nunca duplicação)', () => {
    for (const ctx of ['core', 'grow', 'med'] as const) {
      const r = render(<TextField label="a" context={ctx} mode="dark" />);
      focus(r);
      expect(fieldStyleOf(r).borderColor).toBe(accentFor(ctx, 'dark'));
    }
  });

  it('Dark e Light resolvem cores por token (mesmo componente)', () => {
    const dark = render(<TextField label="a" mode="dark" />);
    const light = render(<TextField label="a" mode="light" />);
    expect(fieldStyleOf(dark).borderColor).toBe(color.border.dark);
    expect(fieldStyleOf(light).borderColor).toBe(color.border.light);
    expect(inputStyleOf(dark).color).toBe(color.text.primary.dark);
    expect(inputStyleOf(light).color).toBe(color.text.primary.light);
  });
});

describe('TextField — tokens e ausência de hardcode (28)', () => {
  it('não inlina hexadecimais no componente', () => {
    const src = readFileSync(resolve(__dirname, 'text-field.tsx'), 'utf8');
    expect(src.match(/#[0-9A-Fa-f]{6}/g) ?? []).toHaveLength(0);
  });

  it('usa tokens oficiais para radius do campo', () => {
    const r = render(<TextField label="a" />);
    expect(fieldStyleOf(r).borderRadius).toBe(radius.md);
    expect(fieldStyleOf(r).borderWidth).toBe(borderWidth.hairline);
  });

  it('altura mínima segue a escala oficial (sm 44 / md 48 / lg 56)', () => {
    expect(fieldStyleOf(render(<TextField label="a" size="sm" />)).minHeight).toBe(44);
    expect(fieldStyleOf(render(<TextField label="a" size="md" />)).minHeight).toBe(48);
    expect(fieldStyleOf(render(<TextField label="a" size="lg" />)).minHeight).toBe(56);
    // fontSize do input vem do token base.
    expect(inputStyleOf(render(<TextField label="a" />)).fontSize).toBe(fontSize.base);
  });
});
