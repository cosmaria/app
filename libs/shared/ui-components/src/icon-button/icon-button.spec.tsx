// Testes do IconButton — renderizado de verdade com react-test-renderer sobre o
// mock leve de `react-native` (mesma infra do Button). Comportamentais/semânticos,
// sem snapshots frágeis. Cobre os 20 requisitos da tarefa.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
import { Button, IconButton } from '../index';
import {
  accentFor,
  borderWidth,
  buildTheme,
  color,
  fontSize,
  opacity,
  radius,
} from '@cosmaria/shared-design-tokens';

(globalThis as Record<string, unknown>)['IS_REACT_ACT_ENVIRONMENT'] = true;

// Silencia apenas o aviso de depreciação do react-test-renderer (esperado).
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

/** Glifo de teste: registra o size/color que o componente injeta. */
const glyph = (p: { size: number; color: string }) =>
  React.createElement('Glyph', { testID: 'glyph', size: p.size, color: p.color });

const pressableOf = (r: TestRenderer.ReactTestRenderer) =>
  r.root.findByProps({ accessibilityRole: 'button' });

function containerStyleOf(r: TestRenderer.ReactTestRenderer): Record<string, unknown> {
  const style = pressableOf(r).props.style;
  const resolved = typeof style === 'function' ? style({ pressed: false }) : style;
  return StyleSheet.flatten(resolved);
}

function iconBoxStyleOf(r: TestRenderer.ReactTestRenderer): Record<string, unknown> {
  const box = r.root.findAllByProps({ importantForAccessibility: 'no-hide-descendants' })[0];
  return StyleSheet.flatten(box.props.style);
}

const glyphOf = (r: TestRenderer.ReactTestRenderer) => r.root.findByProps({ testID: 'glyph' });

describe('IconButton — renderização e export (1, 17, 18)', () => {
  it('renderiza a ação só-ícone com papel de botão', () => {
    const r = render(<IconButton icon={glyph} accessibilityLabel="Fechar" />);
    expect(pressableOf(r).props.accessibilityRole).toBe('button');
    expect(glyphOf(r)).toBeTruthy();
  });

  it('é exportado publicamente e não quebra o export existente (retrocompat)', () => {
    expect(typeof IconButton).toBe('function');
    // Button (componente anterior) segue exportado — biblioteca retrocompatível.
    expect(typeof Button).toBe('function');
  });
});

describe('IconButton — hierarquias (2, 13, 14)', () => {
  it('primary usa Accent contextual como fundo e onAccent no ícone', () => {
    const r = render(
      <IconButton
        icon={glyph}
        accessibilityLabel="Salvar"
        hierarchy="primary"
        context="grow"
        mode="dark"
      />,
    );
    expect(containerStyleOf(r).backgroundColor).toBe(color.accent.grow.dark);
    expect(glyphOf(r).props.color).toBe(buildTheme('dark', 'grow').text.onAccent);
    expect(glyphOf(r).props.color).toBe('#FFFFFF');
  });

  it('secondary usa superfície neutra + borda estrutural', () => {
    const r = render(
      <IconButton icon={glyph} accessibilityLabel="Editar" hierarchy="secondary" mode="dark" />,
    );
    expect(containerStyleOf(r).backgroundColor).toBe(color.bg.surface.dark);
    expect(containerStyleOf(r).borderColor).toBe(color.border.dark);
    expect(glyphOf(r).props.color).toBe(color.text.primary.dark);
  });

  it('tertiary é baixa ênfase (transparente, ícone secundário)', () => {
    const r = render(
      <IconButton icon={glyph} accessibilityLabel="Mais" hierarchy="tertiary" mode="dark" />,
    );
    expect(containerStyleOf(r).backgroundColor).toBe('transparent');
    expect(glyphOf(r).props.color).toBe(color.text.secondary.dark);
  });

  it('destructive usa semântica crítica e onCritical no ícone — nunca accent', () => {
    const r = render(
      <IconButton
        icon={glyph}
        accessibilityLabel="Excluir foto"
        hierarchy="destructive"
        mode="dark"
      />,
    );
    expect(containerStyleOf(r).backgroundColor).toBe(color.semantic.critical.dark);
    expect(glyphOf(r).props.color).toBe(buildTheme('dark', 'core').text.onCritical);
    // Garante que o fundo do destrutivo NÃO é um accent de contexto.
    expect(containerStyleOf(r).backgroundColor).not.toBe(color.accent.core.dark);
  });
});

describe('IconButton — Core, Grow, Med por contexto (19)', () => {
  it('primary resolve o accent do contexto (nunca hierarchy por produto)', () => {
    for (const ctx of ['core', 'grow', 'med'] as const) {
      const r = render(
        <IconButton
          icon={glyph}
          accessibilityLabel="Ok"
          hierarchy="primary"
          context={ctx}
          mode="dark"
        />,
      );
      expect(containerStyleOf(r).backgroundColor).toBe(accentFor(ctx, 'dark'));
    }
  });
});

describe('IconButton — tamanhos e alvo (3, 5)', () => {
  it('sm/md/lg têm caixas distintas e ícone na escala oficial', () => {
    const sm = render(<IconButton icon={glyph} accessibilityLabel="a" size="sm" />);
    const md = render(<IconButton icon={glyph} accessibilityLabel="a" size="md" />);
    const lg = render(<IconButton icon={glyph} accessibilityLabel="a" size="lg" />);

    expect(containerStyleOf(sm).width).toBe(36);
    expect(containerStyleOf(md).width).toBe(44);
    expect(containerStyleOf(lg).width).toBe(52);
    // Container quadrado.
    expect(containerStyleOf(md).width).toBe(containerStyleOf(md).height);

    // Ícone dentro da faixa oficial §9 (20–24), da escala tipográfica.
    expect(glyphOf(sm).props.size).toBe(fontSize.lg);
    expect(glyphOf(md).props.size).toBe(fontSize.xl);
    expect(glyphOf(lg).props.size).toBe(fontSize.xl);
  });

  it('preserva alvo mínimo 44×44: sm compensa com hitSlop, md/lg já ≥44', () => {
    const sm = render(<IconButton icon={glyph} accessibilityLabel="a" size="sm" />);
    const md = render(<IconButton icon={glyph} accessibilityLabel="a" size="md" />);
    // 36 + 2*4 = 44.
    expect(pressableOf(sm).props.hitSlop).toBe(4);
    expect(pressableOf(md).props.hitSlop).toBe(0);
  });
});

describe('IconButton — acessibilidade (4, 5→role, 20)', () => {
  it('accessibilityLabel obrigatório é anunciado; hint opcional é repassado', () => {
    const r = render(
      <IconButton
        icon={glyph}
        accessibilityLabel="Excluir foto"
        accessibilityHint="Remove permanentemente"
      />,
    );
    expect(pressableOf(r).props.accessibilityLabel).toBe('Excluir foto');
    expect(pressableOf(r).props.accessibilityHint).toBe('Remove permanentemente');
  });

  it('accessibilityRole é button', () => {
    const r = render(<IconButton icon={glyph} accessibilityLabel="a" />);
    expect(pressableOf(r).props.accessibilityRole).toBe('button');
  });

  it('ícone é decorativo (sem anúncio duplicado) e não tem label próprio', () => {
    const r = render(<IconButton icon={glyph} accessibilityLabel="Fechar" />);
    const box = r.root.findAllByProps({ importantForAccessibility: 'no-hide-descendants' })[0];
    expect(box.props.accessibilityElementsHidden).toBe(true);
    expect(glyphOf(r).props.accessibilityLabel).toBeUndefined();
  });

  it('em desenvolvimento, alerta quando accessibilityLabel é vazio (sem ausência silenciosa)', () => {
    (globalThis as Record<string, unknown>)['__DEV__'] = true;
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      render(<IconButton icon={glyph} accessibilityLabel="   " />);
      expect(warn).toHaveBeenCalled();
    } finally {
      warn.mockRestore();
      delete (globalThis as Record<string, unknown>)['__DEV__'];
    }
  });
});

describe('IconButton — estado disabled (6, 7)', () => {
  it('anuncia disabled, bloqueia interação e usa o token de opacidade (não só cor)', () => {
    const r = render(<IconButton icon={glyph} accessibilityLabel="a" disabled />);
    const p = pressableOf(r);
    expect(p.props.disabled).toBe(true);
    expect(p.props.accessibilityState.disabled).toBe(true);
    expect(containerStyleOf(r).opacity).toBe(opacity.disabled);
  });
});

describe('IconButton — estado loading (8, 9, 10, 11, 12)', () => {
  it('bloqueia novos acionamentos (disabled) e anuncia busy', () => {
    const onPress = jest.fn();
    const r = render(<IconButton icon={glyph} accessibilityLabel="a" loading onPress={onPress} />);
    const p = pressableOf(r);
    expect(p.props.disabled).toBe(true);
    expect(p.props.accessibilityState.busy).toBe(true);
  });

  it('mostra indicador de progresso e mantém o nome acessível', () => {
    const r = render(<IconButton icon={glyph} accessibilityLabel="Salvando" loading />);
    expect(r.root.findAllByType('ActivityIndicator').length).toBe(1);
    expect(pressableOf(r).props.accessibilityLabel).toBe('Salvando');
  });

  it('preserva o tamanho do componente durante loading (sem layout shift)', () => {
    const normal = render(<IconButton icon={glyph} accessibilityLabel="a" size="md" />);
    const busy = render(<IconButton icon={glyph} accessibilityLabel="a" size="md" loading />);
    expect(containerStyleOf(busy).width).toBe(containerStyleOf(normal).width);
    expect(containerStyleOf(busy).height).toBe(containerStyleOf(normal).height);
  });

  it('oculta visualmente o ícone em loading (opacidade 0)', () => {
    const r = render(<IconButton icon={glyph} accessibilityLabel="a" loading />);
    expect(iconBoxStyleOf(r).opacity).toBe(0);
  });
});

describe('IconButton — tokens, sem hardcode e sem espaço extra (15, 16)', () => {
  it('não inlina hexadecimais no componente', () => {
    const src = readFileSync(resolve(__dirname, 'icon-button.tsx'), 'utf8');
    expect(src.match(/#[0-9A-Fa-f]{6}/g) ?? []).toHaveLength(0);
  });

  it('usa apenas tokens oficiais para dimensões (radius e ícone)', () => {
    const md = render(<IconButton icon={glyph} accessibilityLabel="a" size="md" />);
    expect(containerStyleOf(md).borderRadius).toBe(radius.md);
    expect(glyphOf(md).props.size).toBe(fontSize.xl);
  });

  it('não reserva espaço extra: sem texto e container exatamente do tamanho do alvo', () => {
    const r = render(<IconButton icon={glyph} accessibilityLabel="a" size="md" />);
    // Ação só-ícone: nenhum nó de texto (nada de label visual).
    expect(r.root.findAllByType('Text')).toHaveLength(0);
    expect(containerStyleOf(r).width).toBe(44);
    expect(containerStyleOf(r).height).toBe(44);
  });
});

// Overlay de pressed = View com backgroundColor rgba (ring de selected é borda, não bg).
function hasPressOverlay(r: TestRenderer.ReactTestRenderer): boolean {
  return r.root.findAllByType('View').some((v) => {
    const bg = StyleSheet.flatten(v.props.style)['backgroundColor'];
    return typeof bg === 'string' && bg.startsWith('rgba(');
  });
}

function pressIn(r: TestRenderer.ReactTestRenderer): void {
  act(() => {
    (pressableOf(r).props.onPressIn as () => void)();
  });
}

describe('IconButton — shape (1, 2, 3, 12)', () => {
  it('default é roundedSquare (radius oficial do sistema)', () => {
    const r = render(<IconButton icon={glyph} accessibilityLabel="a" />);
    expect(containerStyleOf(r).borderRadius).toBe(radius.md);
  });

  it('roundedSquare usa o radius oficial (radius.md)', () => {
    const r = render(<IconButton icon={glyph} accessibilityLabel="a" shape="roundedSquare" />);
    expect(containerStyleOf(r).borderRadius).toBe(radius.md);
  });

  it('circular usa radius integral (radius.pill)', () => {
    const r = render(<IconButton icon={glyph} accessibilityLabel="a" shape="circular" />);
    expect(containerStyleOf(r).borderRadius).toBe(radius.pill);
  });

  it('shape não altera dimensão: roundedSquare e circular têm o mesmo alvo', () => {
    const sq = render(
      <IconButton icon={glyph} accessibilityLabel="a" size="md" shape="roundedSquare" />,
    );
    const ci = render(
      <IconButton icon={glyph} accessibilityLabel="a" size="md" shape="circular" />,
    );
    expect(containerStyleOf(ci).width).toBe(containerStyleOf(sq).width);
    expect(containerStyleOf(ci).height).toBe(containerStyleOf(sq).height);
    // Só o radius difere.
    expect(containerStyleOf(ci).borderRadius).not.toBe(containerStyleOf(sq).borderRadius);
  });
});

describe('IconButton — selected (4, 5, 6, 7, 8)', () => {
  it('selected=false (default): sem ring de accent e a11y selected false', () => {
    const r = render(<IconButton icon={glyph} accessibilityLabel="a" hierarchy="tertiary" />);
    expect(pressableOf(r).props.accessibilityState.selected).toBe(false);
    expect(containerStyleOf(r).borderColor).toBeUndefined();
  });

  it('selected=true: aplica ring de accent (borderWidth.focus) e a11y selected', () => {
    const r = render(
      <IconButton
        icon={glyph}
        accessibilityLabel="a"
        hierarchy="tertiary"
        selected
        mode="dark"
        context="grow"
      />,
    );
    expect(pressableOf(r).props.accessibilityState.selected).toBe(true);
    expect(containerStyleOf(r).borderColor).toBe(color.accent.grow.dark);
    expect(containerStyleOf(r).borderWidth).toBe(borderWidth.focus);
  });

  it('accessibilityState.selected reflete a prop', () => {
    const on = render(<IconButton icon={glyph} accessibilityLabel="a" selected />);
    const off = render(<IconButton icon={glyph} accessibilityLabel="a" selected={false} />);
    expect(pressableOf(on).props.accessibilityState.selected).toBe(true);
    expect(pressableOf(off).props.accessibilityState.selected).toBe(false);
  });

  it('selected coexiste com Primary (estado, não hierarchy): mantém fundo accent + ring', () => {
    const r = render(
      <IconButton
        icon={glyph}
        accessibilityLabel="a"
        hierarchy="primary"
        selected
        context="core"
        mode="dark"
      />,
    );
    expect(containerStyleOf(r).backgroundColor).toBe(color.accent.core.dark);
    expect(pressableOf(r).props.accessibilityState.selected).toBe(true);
    expect(containerStyleOf(r).borderWidth).toBe(borderWidth.focus);
  });

  it('selected coexiste com Secondary: ring de accent substitui a borda estrutural', () => {
    const base = render(
      <IconButton icon={glyph} accessibilityLabel="a" hierarchy="secondary" mode="dark" />,
    );
    const sel = render(
      <IconButton
        icon={glyph}
        accessibilityLabel="a"
        hierarchy="secondary"
        selected
        mode="dark"
        context="med"
      />,
    );
    // Sem selected: borda estrutural (token border, hairline).
    expect(containerStyleOf(base).borderColor).toBe(color.border.dark);
    expect(containerStyleOf(base).borderWidth).toBe(borderWidth.hairline);
    // Com selected: ring de accent (focus).
    expect(containerStyleOf(sel).borderColor).toBe(color.accent.med.dark);
    expect(containerStyleOf(sel).borderWidth).toBe(borderWidth.focus);
  });
});

describe('IconButton — selected × outros estados e prioridade (9, 10, 11)', () => {
  it('selected + disabled: a11y selected+disabled, opacidade de disabled domina', () => {
    const r = render(<IconButton icon={glyph} accessibilityLabel="a" selected disabled />);
    const p = pressableOf(r);
    expect(p.props.accessibilityState).toMatchObject({ selected: true, disabled: true });
    expect(p.props.disabled).toBe(true);
    expect(containerStyleOf(r).opacity).toBe(opacity.disabled);
  });

  it('selected + loading: a11y selected+busy, ícone oculto e indicador presente', () => {
    const r = render(<IconButton icon={glyph} accessibilityLabel="a" selected loading />);
    const p = pressableOf(r);
    expect(p.props.accessibilityState).toMatchObject({ selected: true, busy: true });
    expect(iconBoxStyleOf(r).opacity).toBe(0);
    expect(r.root.findAllByType('ActivityIndicator').length).toBe(1);
  });

  it('prioridade pressed: cobre selected quando ativo, mas é suprimido por disabled', () => {
    // Ativo + selected: pressIn mostra o overlay de pressed (pressed acima de selected).
    const active = render(<IconButton icon={glyph} accessibilityLabel="a" selected />);
    expect(hasPressOverlay(active)).toBe(false);
    pressIn(active);
    expect(hasPressOverlay(active)).toBe(true);

    // Disabled: mesmo com pressIn, nenhum overlay (disabled tem precedência sobre pressed).
    const off = render(<IconButton icon={glyph} accessibilityLabel="a" selected disabled />);
    pressIn(off);
    expect(hasPressOverlay(off)).toBe(false);
  });
});

describe('IconButton — Tooltip e label (13, 14, 15)', () => {
  it('não possui Tooltip interno no RN (nenhum texto/nó de tooltip)', () => {
    const r = render(
      <IconButton icon={glyph} accessibilityLabel="Fechar" shape="circular" selected />,
    );
    // Nenhum texto visível (o nome vem só do accessibilityLabel); nada de tooltip interno.
    expect(r.root.findAllByType('Text')).toHaveLength(0);
    expect(r.root.findAllByType('Tooltip')).toHaveLength(0);
  });

  it('accessibilityLabel permanece obrigatório e anunciado com shape/selected', () => {
    const r = render(
      <IconButton icon={glyph} accessibilityLabel="Favoritar" shape="circular" selected />,
    );
    expect(pressableOf(r).props.accessibilityLabel).toBe('Favoritar');
  });

  it('API pública expõe shape e selected sem quebrar (retrocompat)', () => {
    // Compila e renderiza com o contrato completo, incluindo shape e selected.
    const r = render(
      <IconButton
        icon={glyph}
        accessibilityLabel="Completo"
        hierarchy="secondary"
        size="lg"
        shape="circular"
        selected
        context="med"
        mode="light"
        disabled={false}
        loading={false}
        accessibilityHint="dica"
        testID="ib-full"
      />,
    );
    expect(r.root.findByProps({ testID: 'ib-full' })).toBeTruthy();
    expect(containerStyleOf(r).borderRadius).toBe(radius.pill);
  });
});
