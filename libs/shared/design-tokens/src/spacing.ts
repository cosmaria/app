// Escala de espaçamento base 4px (doc 11 §5.3, ui-kit §9.1).
// Todo layout usa spacing por token, nunca margem ad-hoc.
// Chaves espelham os nomes de token do doc 11 (space.1 … space.24).

export const spacing = {
  '1': 4, // ajuste mínimo interno
  '2': 8, // ícone-texto, microagrupamento
  '3': 12, // controles compactos
  '4': 16, // padding e gap padrão / gutter de grid
  '6': 24, // entre grupos
  '8': 32, // entre seções
  '12': 48, // separação ampla
  '16': 64, // marcos editoriais
  '24': 96, // uso institucional raro
} as const;

export type SpacingToken = keyof typeof spacing;
