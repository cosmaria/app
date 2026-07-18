// TextField — entrada textual curta (ui-kit; component-library família 11 "Text
// Field"). Reutilizável em Core/Grow/Med, Dark/Light — tudo resolvido por tokens,
// nunca por componentes duplicados. Consome só @cosmaria/shared-design-tokens.
//
// Escopo (auditoria doc 03 §11 / 05 §11): texto curto de uma linha. NÃO inclui
// multiline nem contador — são a família 12 (Text Area). Não implementa máscara,
// moeda, dose, unidade nem validação de domínio (regra de negócio fica fora).
//
// Anatomia (doc 03 §11): label + marcador de obrigatório/opcional · container do
// campo (leading ícone/prefixo · input · trailing ícone/sufixo) · texto auxiliar
// OU mensagem de estado (a mensagem substitui o helper — não competem).
//
// Estados (doc 03 §11): default/focused/filled/disabled/readOnly/error/warning/
// success. Precedência visual: disabled → readOnly → error → warning → success →
// focused → filled → default. Estado nunca é comunicado só por cor (a mensagem de
// validação e o estado acessível carregam o significado).

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

export type TextFieldSize = 'sm' | 'md' | 'lg';
/** Estados semânticos oficiais (doc 03 §11). Independentes do Accent. */
export type TextFieldStatus = 'default' | 'error' | 'warning' | 'success';

export interface TextFieldProps {
  /** Rótulo persistente (doc 03 §11 — nunca substituído por placeholder). */
  readonly label?: string;
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onChangeText?: (text: string) => void;
  /** Exemplo, nunca rótulo. */
  readonly placeholder?: string;
  /** Texto auxiliar. Suprimido quando há mensagem de validação (não competem). */
  readonly helperText?: string;
  /** Mensagem do estado (erro/aviso/sucesso). Fica associada ao campo. */
  readonly validationMessage?: string;
  readonly status?: TextFieldStatus;
  /** Requiredness (Figma `Required`). Marca "obrigatório"/"opcional" + a11y. */
  readonly required?: boolean;
  readonly disabled?: boolean;
  /** Somente leitura: bloqueia edição, permite leitura/seleção (doc 03 §11 "Sensível/Somente leitura"). */
  readonly readOnly?: boolean;
  /** Campo sensível (variante "Sensível") — preserva o nome acessível. */
  readonly secureTextEntry?: boolean;
  readonly maxLength?: number;
  readonly size?: TextFieldSize;
  /** Ícone inicial decorativo (não anunciado). Alternativa ao `prefix` no mesmo slot. */
  readonly startIcon?: React.ReactNode;
  /** Ícone/afixo final decorativo (não anunciado). Alternativa ao `suffix`. */
  readonly endIcon?: React.ReactNode;
  /** Prefixo textual (ex.: "@"). Alternativa ao `startIcon`. */
  readonly prefix?: string;
  /** Sufixo textual (ex.: ".com"). Alternativa ao `endIcon`. */
  readonly suffix?: string;
  readonly context?: AppContext;
  readonly mode?: ThemeMode;
  /** Nome acessível quando não há `label` visível. */
  readonly accessibilityLabel?: string;
  readonly accessibilityHint?: string;
  readonly testID?: string;
  // Props nativas compatíveis (curadas — sem regra de domínio).
  readonly keyboardType?: TextInputProps['keyboardType'];
  readonly autoCapitalize?: TextInputProps['autoCapitalize'];
  readonly autoComplete?: TextInputProps['autoComplete'];
  readonly autoCorrect?: TextInputProps['autoCorrect'];
  readonly returnKeyType?: TextInputProps['returnKeyType'];
  readonly onSubmitEditing?: TextInputProps['onSubmitEditing'];
  readonly onFocus?: TextInputProps['onFocus'];
  readonly onBlur?: TextInputProps['onBlur'];
}

interface SizeSpec {
  /** Altura mínima do campo (doc 03 §11: Compacto 44 · Padrão 48 · Confortável 56). */
  readonly minHeight: number;
}

const SIZE: Record<TextFieldSize, SizeSpec> = {
  sm: { minHeight: 44 }, // Compacto — = minTouchTarget
  md: { minHeight: 48 }, // Padrão (= spacing['12'])
  lg: { minHeight: 56 }, // Confortável
};

function statusColor(
  status: TextFieldStatus,
  theme: ReturnType<typeof buildTheme>,
): string | undefined {
  switch (status) {
    case 'error':
      return theme.semantic.critical;
    case 'warning':
      return theme.semantic.warning;
    case 'success':
      return theme.semantic.success;
    default:
      return undefined;
  }
}

export function TextField(props: TextFieldProps): React.JSX.Element {
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
    secureTextEntry = false,
    maxLength,
    size = 'md',
    startIcon,
    endIcon,
    prefix,
    suffix,
    context = 'core',
    mode = 'dark',
    accessibilityLabel,
    accessibilityHint,
    testID,
    keyboardType,
    autoCapitalize,
    autoComplete,
    autoCorrect,
    returnKeyType,
    onSubmitEditing,
    onFocus,
    onBlur,
  } = props;

  if (typeof __DEV__ !== 'undefined' && __DEV__) {
    if (label === undefined && accessibilityLabel === undefined) {
      console.warn(
        'TextField: informe `label` ou `accessibilityLabel` — o campo precisa de nome acessível.',
      );
    }
    if (startIcon !== undefined && prefix !== undefined) {
      console.warn('TextField: use `startIcon` OU `prefix` no slot inicial, não ambos.');
    }
    if (endIcon !== undefined && suffix !== undefined) {
      console.warn('TextField: use `endIcon` OU `suffix` no slot final, não ambos.');
    }
  }

  const theme = useMemo(() => buildTheme(mode, context), [mode, context]);
  const sizeSpec = SIZE[size];
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

  const containerStyle: StyleProp<ViewStyle> = [
    styles.field,
    {
      minHeight: sizeSpec.minHeight,
      borderWidth: focusRing ? borderWidth.focus : borderWidth.hairline,
      borderColor,
      borderRadius: radius.md,
      backgroundColor: readOnly ? theme.bg.surface2 : theme.bg.surface,
      columnGap: spacing['2'],
    },
  ];

  const inputStyle: StyleProp<TextStyle> = [
    styles.input,
    { color: theme.text.primary, fontSize: fontSize.base, fontWeight: fontWeight.regular },
  ];

  const affix = (content: string): React.JSX.Element => (
    <Text style={{ color: theme.text.secondary, fontSize: fontSize.base }}>{content}</Text>
  );

  const decorativeIcon = (node: React.ReactNode): React.JSX.Element => (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {node}
    </View>
  );

  const leading =
    startIcon !== undefined
      ? decorativeIcon(startIcon)
      : prefix !== undefined
        ? affix(prefix)
        : null;
  const trailing =
    endIcon !== undefined ? decorativeIcon(endIcon) : suffix !== undefined ? affix(suffix) : null;

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
          {/* Requiredness por PALAVRA oficial (decisão de marca): "Obrigatório"/
              "Opcional" — discreto, nunca asterisco isolado nem só cor. A semântica
              de acessibilidade vai em aria-required no input. Texto livre para
              crescer (i18n) — sem largura fixa nem truncamento. */}
          <Text style={{ color: theme.text.tertiary, fontSize: fontSize.sm }}>
            {required ? 'Obrigatório' : 'Opcional'}
          </Text>
        </View>
      ) : null}

      <View style={containerStyle}>
        {leading}
        <TextInput
          style={inputStyle}
          value={text}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.text.tertiary}
          editable={!editingBlocked}
          secureTextEntry={secureTextEntry}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
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
          testID={testID !== undefined ? `${testID}-input` : undefined}
        />
        {trailing}
      </View>

      {supportText !== undefined && supportText !== '' ? (
        <Text
          nativeID={supportId}
          style={{
            color: showValidation && sColor !== undefined ? sColor : theme.text.secondary,
            fontSize: fontSize.sm,
          }}
          accessibilityLiveRegion={status === 'error' ? 'assertive' : 'polite'}
          aria-live={status === 'error' ? 'assertive' : 'polite'}
        >
          {supportText}
        </Text>
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
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing['4'],
    overflow: 'hidden',
  },
  // flex:1 garante que ícones/afixos não comprimam o input.
  input: { flex: 1, paddingVertical: 0, includeFontPadding: false },
});
