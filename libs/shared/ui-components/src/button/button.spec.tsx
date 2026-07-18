// Testes do Button (componente piloto) — renderizado de verdade com
// react-test-renderer sobre um mock leve de `react-native` (ver
// libs/shared/ui-components/test/react-native.mock.ts). NÃO altera o componente:
// só observa as props/estilos que ele aplica a partir dos tokens.
//
// Cobre (doc 11 §5.1/§9, ui-kit §26): variantes, tamanhos, estados
// default/disabled/loading, on-accent no primário, semântica crítica no
// destrutivo, padding lg=24, largura estável em loading, bloqueio em loading,
// nome acessível, ícone inicial, e ausência de hex para conteúdo sobre accent.

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';
// Import relativo do barrel do próprio projeto (fronteiras Nx); design-tokens é
// outro projeto, então entra pelo alias público (correto para cross-project).
import { Button } from '../index';
import { buildTheme, color, spacing } from '@cosmaria/shared-design-tokens';

// react-test-renderer/act exige este flag no React 19.
(globalThis as Record<string, unknown>)['IS_REACT_ACT_ENVIRONMENT'] = true;

// react-test-renderer emite um aviso de depreciação por render. Ele é esperado
// (usamos o renderer só para inspecionar props/estilos, sem DOM) e não indica
// falha — silenciamos APENAS essa mensagem, deixando qualquer outro erro passar.
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

const pressableOf = (r: TestRenderer.ReactTestRenderer) =>
  r.root.findByProps({
    accessibilityRole: 'button',
  });

function containerStyleOf(r: TestRenderer.ReactTestRenderer): Record<string, unknown> {
  const style = pressableOf(r).props.style;
  const resolved = typeof style === 'function' ? style({ pressed: false }) : style;
  return StyleSheet.flatten(resolved);
}

function labelNodeOf(r: TestRenderer.ReactTestRenderer) {
  const node = r.root.findAllByType('Text').find((t) => typeof t.props.children === 'string');
  if (!node) throw new Error('label Text não encontrado na árvore do Button');
  return node;
}

function labelStyleOf(r: TestRenderer.ReactTestRenderer): Record<string, unknown> {
  return StyleSheet.flatten(labelNodeOf(r).props.style);
}

/** Estilo achatado do container de conteúdo (única View com flexDirection row). */
function contentStyleOf(r: TestRenderer.ReactTestRenderer): Record<string, unknown> {
  for (const v of r.root.findAllByType('View')) {
    const s = StyleSheet.flatten(v.props.style);
    if (s['flexDirection'] === 'row') return s;
  }
  throw new Error('container de conteúdo (View flexDirection row) não encontrado');
}

describe('Button — variantes (ui-kit §26.1–§26.5)', () => {
  it('primário usa o accent do contexto como fundo', () => {
    const r = render(<Button label="Salvar" variant="primary" context="grow" mode="dark" />);
    expect(containerStyleOf(r).backgroundColor).toBe(color.accent.grow.dark);
  });

  it('destrutivo usa a semântica crítica (nunca o accent)', () => {
    const r = render(<Button label="Excluir" variant="destructive" mode="dark" />);
    expect(containerStyleOf(r).backgroundColor).toBe(color.semantic.critical.dark);
  });

  it('secundário usa superfície + borda; terciário é transparente', () => {
    const sec = render(<Button label="Cancelar" variant="secondary" mode="dark" />);
    expect(containerStyleOf(sec).backgroundColor).toBe(color.bg.surface.dark);
    expect(containerStyleOf(sec).borderColor).toBe(color.border.dark);

    const ter = render(<Button label="Ver mais" variant="tertiary" mode="dark" />);
    expect(containerStyleOf(ter).backgroundColor).toBe('transparent');
  });

  it('cada variante produz um tratamento de fundo distinto o suficiente', () => {
    const bg = (v: 'primary' | 'secondary' | 'tertiary' | 'destructive') =>
      containerStyleOf(render(<Button label="x" variant={v} context="core" mode="dark" />))
        .backgroundColor;
    expect(bg('primary')).not.toBe(bg('destructive'));
    expect(bg('primary')).not.toBe(bg('secondary'));
    expect(bg('tertiary')).toBe('transparent');
  });
});

describe('Button — tamanhos (ui-kit §26)', () => {
  it('sm=36, md=44, lg=52 de altura', () => {
    expect(containerStyleOf(render(<Button label="x" size="sm" />)).height).toBe(36);
    expect(containerStyleOf(render(<Button label="x" size="md" />)).height).toBe(44);
    expect(containerStyleOf(render(<Button label="x" size="lg" />)).height).toBe(52);
  });

  it('padding horizontal do Large é 24px (space.6)', () => {
    expect(containerStyleOf(render(<Button label="x" size="lg" />)).paddingHorizontal).toBe(
      spacing['6'],
    );
    expect(spacing['6']).toBe(24);
  });
});

describe('Button — tokens de conteúdo sobre accent e sobre crítico (doc 11 §5.1)', () => {
  it('primário usa color.text.onAccent (#FFFFFF) no texto, nos dois temas', () => {
    const dark = render(<Button label="Salvar" variant="primary" context="med" mode="dark" />);
    expect(labelStyleOf(dark).color).toBe(buildTheme('dark', 'med').text.onAccent);
    expect(labelStyleOf(dark).color).toBe('#FFFFFF');

    const light = render(<Button label="Salvar" variant="primary" context="med" mode="light" />);
    expect(labelStyleOf(light).color).toBe('#FFFFFF');
  });

  it('destrutivo usa color.text.onCritical (#FFFFFF) no texto, nos dois temas', () => {
    const dark = render(<Button label="Excluir" variant="destructive" mode="dark" />);
    expect(labelStyleOf(dark).color).toBe(buildTheme('dark', 'core').text.onCritical);
    expect(labelStyleOf(dark).color).toBe('#FFFFFF');

    const light = render(<Button label="Excluir" variant="destructive" mode="light" />);
    expect(labelStyleOf(light).color).toBe('#FFFFFF');
  });

  it('o componente não inlina NENHUM hex — accent e crítico usam tokens', () => {
    const src = readFileSync(resolve(__dirname, 'button.tsx'), 'utf8');
    // Primário → token on-accent; destrutivo → token on-critical.
    expect(src).toMatch(/text:\s*theme\.text\.onAccent/);
    expect(src).toMatch(/text:\s*theme\.text\.onCritical/);
    // Nenhum hexadecimal cru permanece no componente (ON_CRITICAL foi tokenizado).
    expect(src.match(/#[0-9A-Fa-f]{6}/g) ?? []).toHaveLength(0);
  });
});

describe('Button — estados default/disabled/loading (ui-kit §26.13/§26.14)', () => {
  it('default: habilitado, sem busy', () => {
    const r = render(<Button label="Salvar" onPress={() => undefined} />);
    const p = pressableOf(r);
    expect(p.props.disabled).toBe(false);
    expect(p.props.accessibilityState).toEqual({ disabled: false, busy: false });
  });

  it('disabled: desabilita interação, anuncia estado e aplica opacidade', () => {
    const r = render(<Button label="Salvar" disabled />);
    const p = pressableOf(r);
    expect(p.props.disabled).toBe(true);
    expect(p.props.accessibilityState.disabled).toBe(true);
    expect(containerStyleOf(r).opacity).toBe(0.4);
  });

  it('loading: bloqueia novos acionamentos (disabled) e anuncia busy', () => {
    const onPress = jest.fn();
    const r = render(<Button label="Salvar" loading onPress={onPress} />);
    const p = pressableOf(r);
    // Mecanismo de bloqueio de múltiplos toques: Pressable fica disabled em loading.
    expect(p.props.disabled).toBe(true);
    expect(p.props.accessibilityState.busy).toBe(true);
  });

  it('loading: mostra o indicador e MANTÉM o label (sem remoção → sem layout shift)', () => {
    const r = render(<Button label="Salvar" loading />);
    // ActivityIndicator presente…
    expect(r.root.findAllByType('ActivityIndicator').length).toBe(1);
    // …e o label continua na árvore (largura preservada; só é ocultado por opacidade).
    expect(labelNodeOf(r).props.children).toBe('Salvar');
  });
});

describe('Button — acessibilidade', () => {
  it('nome acessível vem do label por padrão', () => {
    const r = render(<Button label="Salvar cultivo" />);
    expect(pressableOf(r).props.accessibilityLabel).toBe('Salvar cultivo');
  });

  it('accessibilityLabel explícito tem precedência sobre o label', () => {
    const r = render(<Button label="Salvar" accessibilityLabel="Salvar e continuar" />);
    expect(pressableOf(r).props.accessibilityLabel).toBe('Salvar e continuar');
  });

  it('papel de botão é anunciado', () => {
    const r = render(<Button label="x" />);
    expect(pressableOf(r).props.accessibilityRole).toBe('button');
  });
});

describe('Button — ícone inicial e preservação de props públicas', () => {
  it('renderiza o startIcon fornecido', () => {
    const icon = React.createElement('StartIcon', { testID: 'start-icon' });
    const r = render(<Button label="Adicionar" startIcon={icon} />);
    expect(r.root.findAllByProps({ testID: 'start-icon' }).length).toBeGreaterThan(0);
  });

  it('aceita e preserva todas as props públicas documentadas sem quebrar', () => {
    const r = render(
      <Button
        label="Completo"
        onPress={() => undefined}
        variant="primary"
        size="lg"
        context="med"
        mode="light"
        disabled={false}
        loading={false}
        fullWidth
        startIcon={React.createElement('StartIcon', { testID: 'ic-start' })}
        endIcon={React.createElement('EndIcon', { testID: 'ic-end' })}
        accessibilityLabel="Ação completa"
        testID="btn-completo"
      />,
    );
    expect(r.root.findByProps({ testID: 'btn-completo' })).toBeTruthy();
    expect(pressableOf(r).props.accessibilityLabel).toBe('Ação completa');
  });
});

describe('Button — endIcon (ícone final, ui-kit §26.7)', () => {
  it('renderiza o endIcon fornecido', () => {
    const r = render(
      <Button label="Continuar" endIcon={React.createElement('EndIcon', { testID: 'ic-end' })} />,
    );
    expect(r.root.findAllByProps({ testID: 'ic-end' }).length).toBeGreaterThan(0);
  });

  it('ordem visual é startIcon → label → endIcon', () => {
    // Label único e accessibilityLabel distinto: o marcador do label só aparece
    // como filho de texto (não também no accessibilityLabel das props do Pressable).
    const r = render(
      <Button
        label="ZLABELZ"
        accessibilityLabel="acc"
        startIcon={React.createElement('StartIcon', { testID: 'ic-start' })}
        endIcon={React.createElement('EndIcon', { testID: 'ic-end' })}
      />,
    );
    const json = JSON.stringify(r.toJSON());
    const iStart = json.indexOf('ic-start');
    const iLabel = json.indexOf('ZLABELZ');
    const iEnd = json.indexOf('ic-end');
    expect(iStart).toBeGreaterThanOrEqual(0);
    expect(iLabel).toBeGreaterThan(iStart);
    expect(iEnd).toBeGreaterThan(iLabel);
  });

  it('ausência de ícones não cria wrapper (não reserva espaço)', () => {
    const r = render(<Button label="Salvar" />);
    // Só o container de conteúdo; nenhum View de wrapper de ícone.
    expect(r.root.findAllByType('View')).toHaveLength(1);
  });

  it('startIcon e endIcon adicionam exatamente um wrapper cada', () => {
    const r = render(
      <Button
        label="Salvar"
        startIcon={React.createElement('StartIcon', {})}
        endIcon={React.createElement('EndIcon', {})}
      />,
    );
    // container de conteúdo + wrapper do startIcon + wrapper do endIcon.
    expect(r.root.findAllByType('View')).toHaveLength(3);
  });

  it('em Loading, endIcon é ocultado com o conteúdo (opacidade 0) e o nome acessível é preservado', () => {
    const r = render(
      <Button
        label="Continuar"
        endIcon={React.createElement('EndIcon', { testID: 'ic-end' })}
        loading
        accessibilityLabel="Continuar ação"
      />,
    );
    // O container de conteúdo (que contém o endIcon) é ocultado por opacidade — sem layout shift.
    expect(contentStyleOf(r).opacity).toBe(0);
    // endIcon continua na árvore (só oculto visualmente); nome acessível preservado.
    expect(r.root.findAllByProps({ testID: 'ic-end' }).length).toBeGreaterThan(0);
    expect(pressableOf(r).props.accessibilityLabel).toBe('Continuar ação');
  });

  it('endIcon recebe o mesmo tratamento (wrapper) do startIcon', () => {
    // Ambos entram no mesmo container de conteúdo, com o mesmo gap — tratamento equivalente.
    const r = render(
      <Button
        label="Salvar"
        startIcon={React.createElement('StartIcon', { testID: 'ic-start' })}
        endIcon={React.createElement('EndIcon', { testID: 'ic-end' })}
      />,
    );
    expect(contentStyleOf(r).columnGap).toBeDefined();
    expect(r.root.findAllByProps({ testID: 'ic-start' }).length).toBe(1);
    expect(r.root.findAllByProps({ testID: 'ic-end' }).length).toBe(1);
  });
});
