// TextArea — conteúdo textual de múltiplas linhas (component-library família 12
// "Text Area"). Distinta do TextField (família 11): área multilinha com altura
// mínima, autoexpansão e contador opcional; sem ícones/prefixo/sufixo dentro da
// área (doc 03 §12). Reutilizável em Core/Grow/Med e Dark/Light por tokens.
// Consome só @cosmaria/shared-design-tokens; zero hardcode.
//
// Escopo (doc 03 §12): texto livre de várias linhas. NÃO implementa máscara,
// unidade, dose nem validação de domínio. Não é NumberField/SearchField.
//
// Anatomia (doc 03 §12): label + marcador obrigatório/opcional · área de edição
// (multiline, min 96px, autoexpansível) · rodapé: texto auxiliar OU mensagem de
// estado (não competem) + contador opcional.
//
// Estados (doc 03 §12): default/focused/filled/disabled/readOnly/warning/error
// (sem success — 03 §12). Precedência: disabled → readOnly → error → warning →
// focused → filled → default. Estado nunca só por cor (mensagem + a11y).

import { useId, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import {
  buildTheme,
  borderWidth,
  fontSize,
  fontWeight,
  opacity,
  radius,
  spacing,
  type AppContext,
  type ThemeMode,
} from '@cosmaria/shared-design-tokens';

/** Estados semânticos oficiais do Text Area (doc 03 §12). Sem success. */
export type TextAreaStatus = 'default' | 'error' | 'warning';

/** Altura mínima da área de edição (doc 03 §12 — 96px). Autoexpande além disso. */
const MIN_HEIGHT = 96;

export interface TextAreaProps {
  readonly label?: string;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onChangeText?: (text: string) => void;
  readonly placeholder?: string;
  /** Texto auxiliar. Suprimido quando há mensagem de validação (não competem). */
  readonly helperText?: string;
  readonly validationMessage?: string;
  readonly status?: TextAreaStatus;
  readonly required?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly maxLength?: number;
  /** Exibe o contador `atual/limite` (variante "Com contador"). Requer `maxLength`. */
  readonly showCounter?: boolean;
  readonly context?: AppContext;
  readonly mode?: ThemeMode;
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
  readonly testID?: string;
  // Props nativas compatíveis (curadas — sem regra de domínio).
  readonly keyboardType?: TextInputProps['keyboardType'];
  readonly autoCapitalize?: TextInputProps['autoCapitalize'];
  readonly autoComplete?: TextInputProps['autoComplete'];
  readonly autoCorrect?: TextInputProps['autoCorrect'];
  readonly onFocus?: TextInputProps['onFocus'];
  readonly onBlur?: TextInputProps['onBlur'];
}

function statusColor(
  status: TextAreaStatus,
  theme: ReturnType<typeof buildTheme>,
): string | undefined {
  switch (status) {
    case 'error':
      return theme.semantic.critical;
    case 'warning':
      return theme.semantic.warning;
    default:
      return undefined;
  }
}

export function TextArea(props: TextAreaProps): React.JSX.Element {
  const {
    label,
    value,
    defaultValue,
    onChangeText,
    placeholder,
    helperText,
    validationMessage,
    status = 'default',
    required = false,
    disabled = false,
    readOnly = false,
    maxLength,
    showCounter = false,
    context = 'core',
    mode = 'dark',
    accessibilityLabel,
    accessibilityHint,
    testID,
    keyboardType,
    autoCapitalize,
    autoComplete,
    autoCorrect,
    onFocus,
    onBlur,
  } = props;

  if (
    typeof __DEV__ !== 'undefined' &&
    __DEV__ &&
    label === undefined &&
    accessibilityLabel === undefined
  ) {
    console.warn(
      'TextArea: informe `label` ou `accessibilityLabel` — a área precisa de nome acessível.',
    );
  }

  const theme = useMemo(() => buildTheme(mode, context), [mode, context]);
  const [focused, setFocused] = useState(false);

  const isControlled = value !== undefined;
  const [innerText, setInnerText] = useState(defaultValue ?? '');
  const text = isControlled ? value : innerText;

  const reactId = useId();
  const labelId = `${reactId}-label`;
  const supportId = `${reactId}-support`;

  const editingBlocked = disabled || readOnly;
  const sColor = statusColor(status, theme);
  const showValidation =
    status !== 'default' && validationMessage !== undefined && validationMessage !== '';
  const supportText = showValidation ? validationMessage : helperText;
  const counterVisible = showCounter && maxLength !== undefined;

  // Precedência: disabled/readOnly (neutro) → status → focused → default.
  const borderColor =
    disabled || readOnly
      ? theme.border
      : sColor !== undefined
        ? sColor
        : focused
          ? theme.accent
          : theme.border;
  const focusRing = focused && !editingBlocked;

  const handleChangeText = (t: string): void => {
    if (!isControlled) setInnerText(t);
    onChangeText?.(t);
  };

  const boxStyle: StyleProp<ViewStyle> = [
    styles.box,
    {
      minHeight: MIN_HEIGHT,
      borderWidth: focusRing ? borderWidth.focus : borderWidth.hairline,
      borderColor,
      borderRadius: radius.md,
      backgroundColor: readOnly ? theme.bg.surface2 : theme.bg.surface,
    },
  ];

  const inputStyle: StyleProp<TextStyle> = [
    styles.input,
    { color: theme.text.primary, fontSize: fontSize.base, fontWeight: fontWeight.regular },
  ];

  const hasFooter = (supportText !== undefined && supportText !== '') || counterVisible;

  return (
    <View style={[styles.root, disabled && { opacity: opacity.disabled }]} testID={testID}>
      {label !== undefined ? (
        <View style={styles.labelRow}>
          <Text
            nativeID={labelId}
            style={{
              color: theme.text.primary,
              fontSize: fontSize.sm,
              fontWeight: fontWeight.medium,
            }}
          >
            {label}
          </Text>
          <Text style={{ color: theme.text.tertiary, fontSize: fontSize.sm }}>
            {required ? 'Obrigatório' : 'Opcional'}
          </Text>
        </View>
      ) : null}

      <View style={boxStyle}>
        <TextInput
          style={inputStyle}
          multiline
          textAlignVertical="top"
          value={text}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.text.tertiary}
          editable={!editingBlocked}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled }}
          aria-labelledby={label !== undefined ? labelId : undefined}
          aria-describedby={supportText !== undefined && supportText !== '' ? supportId : undefined}
          aria-disabled={disabled || undefined}
          aria-readonly={readOnly || undefined}
          aria-required={required || undefined}
          aria-invalid={status === 'error' || undefined}
          aria-multiline
          testID={testID !== undefined ? `${testID}-input` : undefined}
        />
      </View>

      {hasFooter ? (
        <View style={styles.footer}>
          {supportText !== undefined && supportText !== '' ? (
            <Text
              nativeID={supportId}
              style={{
                color: showValidation && sColor !== undefined ? sColor : theme.text.secondary,
                fontSize: fontSize.sm,
                flex: 1,
              }}
              accessibilityLiveRegion={status === 'error' ? 'assertive' : 'polite'}
              aria-live={status === 'error' ? 'assertive' : 'polite'}
            >
              {supportText}
            </Text>
          ) : (
            <View style={styles.footerSpacer} />
          )}
          {counterVisible ? (
            // Contador reflete maxLength; NÃO é live region (evita anúncio excessivo).
            <Text style={{ color: theme.text.tertiary, fontSize: fontSize.sm }}>
              {`${text.length}/${maxLength}`}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  // Largura controlada pelo parent; sem margem externa própria.
  root: { alignSelf: 'stretch' },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: spacing['2'],
    marginBottom: spacing['2'],
  },
  box: {
    paddingHorizontal: spacing['4'],
    paddingVertical: spacing['3'],
    overflow: 'hidden',
  },
  // Multiline autoexpansível: cresce com o conteúdo a partir do mínimo.
  input: { flex: 1, minHeight: MIN_HEIGHT, padding: 0, includeFontPadding: false },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: spacing['2'],
    marginTop: spacing['1'],
  },
  footerSpacer: { flex: 1 },
});
