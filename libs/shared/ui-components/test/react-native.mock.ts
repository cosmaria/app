// Mock mínimo de `react-native` para testar componentes da biblioteca com
// react-test-renderer em ambiente Node, SEM o preset pesado do React Native
// (que exigiria Metro/Babel/haste e quebraria a suíte Node do backend).
//
// Só modela o que os componentes da lib consomem: os host components (View/Text/
// Pressable/ActivityIndicator/TextInput) e o StyleSheet (create/flatten). Os host
// components viram nós de host nomeados no renderer, então os testes localizam por
// tipo e leem as props/estilos reais que o componente aplicou. Ativado por
// moduleNameMapper no jest.config.js apenas para quem importa `react-native`.

import React from 'react';

type HostProps = Record<string, unknown> & { children?: React.ReactNode };

/** Fabrica um host component que renderiza um nó nomeado preservando as props. */
function host(name: string): (props: HostProps) => React.ReactElement {
  const Component = (props: HostProps): React.ReactElement =>
    React.createElement(name, props, props.children);
  Component.displayName = name;
  return Component;
}

export const View = host('View');
export const Text = host('Text');
export const Pressable = host('Pressable');
export const ActivityIndicator = host('ActivityIndicator');
export const TextInput = host('TextInput');

/** Estilos podem ser objeto, array aninhado ou valores falsy (curto-circuito de JSX). */
type Style = Record<string, unknown> | Style[] | false | null | undefined;

export const StyleSheet = {
  create<T extends Record<string, unknown>>(styles: T): T {
    return styles;
  },
  /** Achata arrays/aninhamentos e ignora falsy — suficiente para asserção de estilo. */
  flatten(style: Style): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    const walk = (s: Style): void => {
      if (!s) return;
      if (Array.isArray(s)) {
        for (const item of s) walk(item);
        return;
      }
      Object.assign(out, s);
    };
    walk(style);
    return out;
  },
  hairlineWidth: 1,
  absoluteFillObject: {} as Record<string, unknown>,
};

// Tipos usados apenas como `import type` pelo componente — erased em runtime.
// Não precisam de valor; declarados aqui só para o import não quebrar caso algum
// consumidor os importe como valor por engano.
export type PressableStateCallbackType = { pressed: boolean };
export type StyleProp<T> = T | T[] | null | undefined;
export type ViewStyle = Record<string, unknown>;
export type TextStyle = Record<string, unknown>;
export type TextInputProps = Record<string, unknown>;
export type NativeSyntheticEvent<T> = { nativeEvent: T };
export type TextInputFocusEventData = Record<string, unknown>;

export default { View, Text, Pressable, ActivityIndicator, TextInput, StyleSheet };
