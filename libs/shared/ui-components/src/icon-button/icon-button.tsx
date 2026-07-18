// IconButton — ação sem label visual, só ícone (ui-kit §26.8, component-library
// família 9 "Icon Button"). Irmão do Button: mesma stack de tokens, mesmos padrões
// de estado (pressed por overlay neutro, loading sem layout shift, hitSlop para
// garantir o alvo mínimo). NÃO altera o Button.
//
// Regras aplicadas (doc 11 §5.1/§9, ui-kit §26.8, component-library §9):
//  - hierarquias por PROPÓSITO (primary/secondary/tertiary/destructive), nunca por
//    produto — Core/Grow/Med diferenciam-se só pelo accent contextual;
//  - primary sobre accent usa color.text.onAccent; destructive sobre crítico usa
//    color.text.onCritical; destructive NUNCA usa accent;
//  - alvo mínimo 44×44 sempre (hitSlop compensa o `sm` de 36 visual);
//  - loading bloqueia novo toque, oculta o ícone por opacidade (sem layout shift),
//    mantém o tamanho e o nome acessível, e mostra progresso;
//  - accessibilityLabel é OBRIGATÓRIO (ação sem texto precisa de nome acessível) —
//    o ícone é decorativo (não anunciado), evitando anúncio duplicado;
//  - `shape` (roundedSquare/circular) muda SÓ a geometria (radius), nunca hierarchy,
//    estado ou alvo; `selected` é ESTADO (não hierarchy): ring de accent + a11y
//    selected, com precedência disabled→loading→pressed→selected→default;
//  - Tooltip NÃO existe internamente no RN — em desktop/web é composto por fora;
//  - nenhum hardcode: todo valor vem de @cosmaria/shared-design-tokens.
//
// O `icon` é uma render-function que RECEBE `size` e `color` já resolvidos pelo
// componente (a partir dos tokens), porque é o IconButton — não o chamador — que
// possui a cor semântica (on-accent/on-critical/accent) e a dimensão oficial do
// ícone. O chamador só fornece o glifo.

import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  buildTheme,
  borderWidth,
  fontSize,
  opacity,
  radius,
  minTouchTarget,
  type AppContext,
  type ThemeMode,
} from '@cosmaria/shared-design-tokens';

/** Propósito visual (nunca por produto). Consistente com o Button. */
export type IconButtonHierarchy = 'primary' | 'secondary' | 'tertiary' | 'destructive';
export type IconButtonSize = 'sm' | 'md' | 'lg';
/** Forma do container — só a geometria muda, nunca hierarchy/estado/alvo. */
export type IconButtonShape = 'roundedSquare' | 'circular';

/** Props injetadas no `icon`: dimensão e cor resolvidas pelo componente (tokens). */
export interface IconRenderProps {
  readonly size: number;
  readonly color: string;
}

export interface IconButtonProps {
  /** Glifo da ação. Recebe `size`/`color` oficiais do componente. Obrigatório. */
  readonly icon: (props: IconRenderProps) => React.ReactNode;
  /** Nome acessível OBRIGATÓRIO — descreve ação + objeto (ex.: "Excluir foto").
   *  Sem ele não há como anunciar a ação (não há texto visível). */
  readonly accessibilityLabel: string;
  readonly onPress?: () => void;
  /** Propósito visual (nunca por produto). Default: secondary (neutro). */
  readonly hierarchy?: IconButtonHierarchy;
  readonly size?: IconButtonSize;
  /** Geometria do container. Default: roundedSquare. Não altera hierarchy/estado/alvo. */
  readonly shape?: IconButtonShape;
  /** Estado de seleção (toggle) — NÃO é hierarchy. Aplica ring de accent + a11y selected. Default: false. */
  readonly selected?: boolean;
  /** Contexto de app — define o accent do primary (doc 11 §13). */
  readonly context?: AppContext;
  readonly mode?: ThemeMode;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  /** Dica acessível opcional (accessibilityHint nativo). */
  readonly accessibilityHint?: string;
  readonly testID?: string;
}

interface IconSizeSpec {
  /** Lado do container (quadrado). O alvo efetivo nunca fica abaixo de 44 (hitSlop). */
  readonly box: number;
  /** Dimensão do ícone — escala oficial (doc 11 §5.2), faixa 20–24 do §9. */
  readonly icon: number;
  readonly borderRadius: number;
}

// Escala de tamanho espelha a do Button (36/44/52) para alinhar em barras/linhas
// mistas; 44 é o `minTouchTarget`. Ícone 20 (sm) / 24 (md, lg) fica no intervalo
// oficial do §9 (20–24px) — os três tamanhos diferenciam-se pelo alvo, o `sm`
// atinge 44 via hitSlop. Radius md (component-library §9).
const SIZE: Record<IconButtonSize, IconSizeSpec> = {
  sm: { box: 36, icon: fontSize.lg, borderRadius: radius.md },
  md: { box: minTouchTarget, icon: fontSize.xl, borderRadius: radius.md },
  lg: { box: 52, icon: fontSize.xl, borderRadius: radius.md },
};

interface HierarchyColors {
  readonly background: string;
  readonly border: string | undefined;
  /** Cor do ícone (e do indicador de loading). */
  readonly icon: string;
}

function resolveHierarchy(
  hierarchy: IconButtonHierarchy,
  theme: ReturnType<typeof buildTheme>,
): HierarchyColors {
  switch (hierarchy) {
    case 'primary':
      // Ícone sobre superfície Accent → token on-accent (doc 11 §5.1).
      return { background: theme.accent, border: undefined, icon: theme.text.onAccent };
    case 'destructive':
      // Ícone sobre superfície crítica → token on-critical, nunca accent (doc 11 §5.1).
      return {
        background: theme.semantic.critical,
        border: undefined,
        icon: theme.text.onCritical,
      };
    case 'secondary':
      return { background: theme.bg.surface, border: theme.border, icon: theme.text.primary };
    case 'tertiary':
      // Baixa ênfase: sem preenchimento, ícone em texto secundário.
      return { background: 'transparent', border: undefined, icon: theme.text.secondary };
  }
}

/** Overlay neutro de pressed — claro no Dark, escuro no Light (ui-kit §7.10/§14.3). */
function pressedOverlay(mode: ThemeMode): string {
  return mode === 'dark'
    ? `rgba(255,255,255,${opacity.hoverOverlay})`
    : `rgba(0,0,0,${opacity.hoverOverlay})`;
}

export function IconButton(props: IconButtonProps): React.JSX.Element {
  const {
    icon,
    accessibilityLabel,
    onPress,
    hierarchy = 'secondary',
    size = 'md',
    shape = 'roundedSquare',
    selected = false,
    context = 'core',
    mode = 'dark',
    disabled = false,
    loading = false,
    accessibilityHint,
    testID,
  } = props;

  // Validação de desenvolvimento: nome acessível ausência silenciosa é proibida.
  if (typeof __DEV__ !== 'undefined' && __DEV__ && accessibilityLabel.trim() === '') {
    console.warn(
      'IconButton: accessibilityLabel é obrigatório e não pode ser vazio — uma ação só com ícone precisa de nome acessível (component-library §9).',
    );
  }

  const theme = useMemo(() => buildTheme(mode, context), [mode, context]);
  const sizeSpec = SIZE[size];
  const colors = useMemo(() => resolveHierarchy(hierarchy, theme), [hierarchy, theme]);
  const [pressed, setPressed] = useState(false);

  const isInactive = disabled || loading;

  // hitSlop garante 44×44 mesmo quando o visual é menor (sm=36) — mesmo padrão do Button.
  // O shape muda apenas a geometria (radius), nunca a dimensão do alvo.
  const hitExtra = Math.max(0, (minTouchTarget - sizeSpec.box) / 2);
  const borderRadius = shape === 'circular' ? radius.pill : sizeSpec.borderRadius;

  // Borda: selected desenha o ring de seleção (accent + borderWidth.focus), tokens
  // oficiais de seleção/foco (ui-kit §7.10/§20.5); senão, a borda estrutural da
  // hierarquia (secondary). Border-box do RN mantém o alvo inalterado.
  const borderSpec = selected
    ? { borderWidth: borderWidth.focus, borderColor: theme.accent }
    : colors.border !== undefined
      ? { borderWidth: borderWidth.hairline, borderColor: colors.border }
      : undefined;

  const containerStyle: StyleProp<ViewStyle> = [
    styles.base,
    {
      width: sizeSpec.box,
      height: sizeSpec.box,
      borderRadius,
      backgroundColor: colors.background,
    },
    borderSpec,
    disabled && { opacity: opacity.disabled },
  ];

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      // Estados coexistem no a11y (disabled/busy/selected). A precedência VISUAL é
      // disabled → loading → pressed → selected → default: a opacidade de disabled
      // domina tudo; o spinner de loading substitui o ícone; o overlay de pressed
      // (só quando ativo) cobre o ring de selected; selected fica acima do default.
      accessibilityState={{ disabled: isInactive, busy: loading, selected }}
      disabled={isInactive}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      hitSlop={hitExtra}
      style={(state: PressableStateCallbackType) => [
        containerStyle,
        state.pressed && styles.pressedContainer,
      ]}
    >
      {/* Ícone decorativo (não anunciado — o nome vem do Pressable). Oculto por
          opacidade em loading para preservar o tamanho (sem layout shift). */}
      <View
        style={[styles.iconBox, loading && styles.hiddenForLoading]}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {icon({ size: sizeSpec.icon, color: colors.icon })}
      </View>

      {loading ? (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator color={colors.icon} />
        </View>
      ) : null}

      {pressed && !isInactive ? (
        <View
          pointerEvents="none"
          style={[styles.overlay, { borderRadius, backgroundColor: pressedOverlay(mode) }]}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  iconBox: { alignItems: 'center', justifyContent: 'center' },
  hiddenForLoading: { opacity: 0 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressedContainer: {},
});
