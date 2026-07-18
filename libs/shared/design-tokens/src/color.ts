// Tokens de cor — fonte única (doc 11 §5.1, doc 13/design-system/01-visual-language §12).
//
// Regra permanente (doc 11 §4/§14): todo componente referencia o NOME do token,
// nunca o valor cru. Dark é o tema padrão; Light usa exatamente os mesmos nomes,
// só muda o valor. Todos os valores são CANDIDATOS sujeitos a validação com
// usuários reais antes do lançamento (doc 11 §4) — a estrutura é estável, os
// valores podem trocar sem retrabalho.

/** Um valor de cor tem uma variante por tema, mesmo nome de token nos dois. */
export interface ThemedColor {
  readonly dark: string;
  readonly light: string;
}

/** Contexto de aplicativo que define o accent (doc 11 §5.1, §13). */
export type AppContext = 'core' | 'grow' | 'med';

/** Neutros de fundo, texto e borda — compartilhados por toda a plataforma. */
export const color = {
  bg: {
    /** Plano mais distante / fundo de aplicação. */
    base: { dark: '#0B0F14', light: '#F7F8FA' },
    /** Superfície principal de conteúdo. */
    surface: { dark: '#12181F', light: '#FFFFFF' },
    /** Superfície secundária ou elevada. */
    surface2: { dark: '#1A222B', light: '#EEF1F4' },
  },
  text: {
    primary: { dark: '#EDF1F5', light: '#10151A' },
    secondary: { dark: '#9AA7B2', light: '#4B5760' },
    tertiary: { dark: '#6B7885', light: '#7C8790' },
    /**
     * Texto/ícone sobre uma superfície Accent (ex.: botão primário) — doc 11 §5.1,
     * token `color.text.on-accent`. Branco nos dois temas porque o accent é saturado
     * tanto em Dark quanto em Light. Substitui o `#FFFFFF` avulso antes usado no Button.
     */
    onAccent: { dark: '#FFFFFF', light: '#FFFFFF' },
    /**
     * Texto/ícone sobre uma superfície SEMÂNTICA CRÍTICA (ex.: botão destrutivo) —
     * doc 11 §5.1, token `color.text.on-critical`. Função semântica DISTINTA de
     * `onAccent`: destrutivo fica sobre `semantic.critical`, não sobre um accent.
     * Hoje compartilha o valor (#FFFFFF), mas os dois tokens são independentes —
     * `onCritical` NUNCA é alias de `onAccent`; cada um pode evoluir por conta própria.
     */
    onCritical: { dark: '#FFFFFF', light: '#FFFFFF' },
  },
  border: { dark: '#232D38', light: '#DDE3E8' },

  /**
   * Cores semânticas — independentes do accent de app, NUNCA usadas como
   * identidade visual de um módulo (doc 11 §5.1).
   */
  semantic: {
    /** Confirmação, condição positiva confirmada. */
    success: { dark: '#34C77B', light: '#1E9A5C' },
    /** Situação que requer avaliação, não falha. Alerta de IA (severidade média). */
    warning: { dark: '#E8A93E', light: '#B9791E' },
    /** Erro, risco, ação destrutiva. Alerta de IA (severidade alta). */
    critical: { dark: '#E5675E', light: '#C6382E' },
    /** Informação neutra relevante. */
    info: { dark: '#4EA1E8', light: '#1F71B8' },
  },

  /**
   * Accent Tokens — o ÚNICO ponto de diferenciação visual entre apps (doc 11 §13).
   * Um novo app futuro registra um novo accent aqui, nunca reaproveita/modifica os existentes.
   */
  accent: {
    /** Plataforma / onboarding / Conta — violeta-cosmos. */
    core: { dark: '#8B7FE0', light: '#5F4FCC' },
    /** Grow — verde-teal botânico. NUNCA usado como cor de "sucesso" (doc 11 §5.1). */
    grow: { dark: '#2E9E6B', light: '#1F7A52' },
    /** Med — índigo calmo, deliberadamente NÃO verde para não soar recreativo;
     *  NUNCA usado como "informação clínica segura" (doc 11 §5.1). */
    med: { dark: '#6E7FE8', light: '#4A5BC4' },
  },
} as const;

export type ColorTokens = typeof color;
