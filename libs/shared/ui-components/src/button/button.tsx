// Button — componente piloto da biblioteca (ui-kit §26, component-library família 8).
//
// Consome exclusivamente @cosmaria/shared-design-tokens (nunca hardcode de valor,
// doc 11 §14). Regras aplicadas:
//  - variantes por PROPÓSITO (primário/secundário/terciário/destrutivo/baixo destaque),
//    nunca cosméticas (ui-kit §26.1–§26.5);
//  - primário usa o accent do CONTEXTO; destrutivo usa a semântica crítica, nunca accent
//    (ui-kit §26.4 / §26.15);
//  - alvo mínimo de toque 44×44 (doc 11 §9); tamanho `sm` visual 36 compensa com hitSlop;
//  - loading não muda a largura (sem layout shift) e bloqueia novo toque = idempotência
//    visual (ui-kit §26.13/§26.14);
//  - hover/pressed por OVERLAY neutro 8–12%, não por hex de accent inventado (ui-kit §7.10);
//  - nome acessível, papel e estado anunciados (ui-kit §26 acessibilidade).

import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableStateCallbackType,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  buildTheme,
  fontSize,
  fontWeight,
  opacity,
  radius,
  spacing,
  minTouchTarget,
  type AppContext,
  type ThemeMode,
} from '@cosmaria/shared-design-tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'low-emphasis';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  /** Verbo específico, sentence case (ui-kit §26 conteúdo). Obrigatório. */
  readonly label: string;
  readonly onPress?: () => void;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  /** Contexto de app — define o accent do primário (doc 11 §13). */
  readonly context?: AppContext;
  readonly mode?: ThemeMode;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  /** Mobile: ação principal costuma ocupar a largura total (ui-kit §26.9). */
  readonly fullWidth?: boolean;
  /** Ícone inicial opcional (máx. 1, ui-kit §26.6) — reforça o verbo. */
  readonly startIcon?: React.ReactNode;
  /** Ícone final opcional (máx. 1, ui-kit §26.7) — direção/continuidade.
   *  Ordem visual: startIcon → label → endIcon; oculto em Loading; ausente não reserva espaço. */
  readonly endIcon?: React.ReactNode;
  /** Nome acessível; usa `label` quando ausente. */
  readonly accessibilityLabel?: string;
  readonly testID?: string;
}

interface SizeSpec {
  readonly height: number;
  readonly paddingH: number;
  readonly gap: number;
  readonly font: number;
  readonly borderRadius: number;
}

const SIZE: Record<ButtonSize, SizeSpec> = {
  sm: {
    height: 36,
    paddingH: spacing['3'],
    gap: spacing['2'],
    font: fontSize.sm,
    borderRadius: radius.sm,
  },
  md: {
    height: 44,
    paddingH: spacing['4'],
    gap: spacing['2'],
    font: fontSize.base,
    borderRadius: radius.md,
  },
  lg: {
    height: 52,
    paddingH: spacing['6'],
    gap: spacing['2'],
    font: fontSize.md,
    borderRadius: radius.md,
  },
};

interface VariantColors {
  readonly background: string;
  readonly border: string | undefined;
  readonly text: string;
  readonly weight: TextStyle['fontWeight'];
}

function resolveColors(
  variant: ButtonVariant,
  theme: ReturnType<typeof buildTheme>,
): VariantColors {
  switch (variant) {
    case 'primary':
      return {
        background: theme.accent,
        border: undefined,
        // Conteúdo sobre superfície Accent → token semântico (doc 11 §5.1, color.text.on-accent).
        text: theme.text.onAccent,
        weight: fontWeight.semibold,
      };
    case 'destructive':
      return {
        background: theme.semantic.critical,
        border: undefined,
        // Conteúdo sobre superfície crítica → token semântico dedicado
        // (doc 11 §5.1, color.text.on-critical), independente de on-accent.
        text: theme.text.onCritical,
        weight: fontWeight.semibold,
      };
    case 'secondary':
      return {
        background: theme.bg.surface,
        border: theme.border,
        text: theme.text.primary,
        weight: fontWeight.medium,
      };
    case 'tertiary':
      return {
        background: 'transparent',
        border: undefined,
        text: theme.accent,
        weight: fontWeight.medium,
      };
    case 'low-emphasis':
      return {
        background: 'transparent',
        border: undefined,
        text: theme.text.secondary,
        weight: fontWeight.medium,
      };
  }
}

/** Overlay neutro de pressed — claro no Dark, escuro no Light (ui-kit §7.10/§14.3). */
function pressedOverlay(mode: ThemeMode): string {
  return mode === 'dark'
    ? `rgba(255,255,255,${opacity.hoverOverlay})`
    : `rgba(0,0,0,${opacity.hoverOverlay})`;
}

export function Button(props: ButtonProps): React.JSX.Element {
  const {
    label,
    onPress,
    variant = 'primary',
    size = 'md',
    context = 'core',
    mode = 'dark',
    disabled = false,
    loading = false,
    fullWidth = false,
    startIcon,
    endIcon,
    accessibilityLabel,
    testID,
  } = props;

  const theme = useMemo(() => buildTheme(mode, context), [mode, context]);
  const sizeSpec = SIZE[size];
  const colors = useMemo(() => resolveColors(variant, theme), [variant, theme]);
  const [pressed, setPressed] = useState(false);

  const isInactive = disabled || loading;

  const containerStyle: StyleProp<ViewStyle> = [
    styles.base,
    {
      height: sizeSpec.height,
      paddingHorizontal: sizeSpec.paddingH,
      borderRadius: sizeSpec.borderRadius,
      backgroundColor: colors.background,
      columnGap: sizeSpec.gap,
    },
    colors.border !== undefined && { borderWidth: 1, borderColor: colors.border },
    fullWidth && styles.fullWidth,
    disabled && { opacity: opacity.disabled },
  ];

  const labelStyle: StyleProp<TextStyle> = [
    styles.label,
    { color: colors.text, fontSize: sizeSpec.font, fontWeight: colors.weight },
  ];

  // hitSlop garante o alvo mínimo de 44px mesmo quando o visual é menor (sm=36).
  const hitVertical = Math.max(0, (minTouchTarget - sizeSpec.height) / 2);

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      hitSlop={{ top: hitVertical, bottom: hitVertical }}
      style={(state: PressableStateCallbackType) => [
        containerStyle,
        state.pressed && styles.pressedContainer,
      ]}
    >
      {/* Conteúdo — opacidade 0 durante loading para preservar a largura (sem layout shift). */}
      <View
        style={[styles.content, { columnGap: sizeSpec.gap }, loading && styles.hiddenForLoading]}
      >
        {startIcon !== undefined ? <View>{startIcon}</View> : null}
        <Text numberOfLines={1} style={labelStyle}>
          {label}
        </Text>
        {endIcon !== undefined ? <View>{endIcon}</View> : null}
      </View>

      {loading ? (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator color={colors.text} />
        </View>
      ) : null}

      {pressed && !isInactive ? (
        <View
          pointerEvents="none"
          style={[
            styles.pressOverlay,
            { borderRadius: sizeSpec.borderRadius, backgroundColor: pressedOverlay(mode) },
          ]}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  fullWidth: { alignSelf: 'stretch' },
  content: { flexDirection: 'row', alignItems: 'center' },
  hiddenForLoading: { opacity: 0 },
  label: { includeFontPadding: false },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  pressedContainer: {},
});
