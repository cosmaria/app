/**
 * Contratos HTTP de Identidade Social (doc 09 — /v1/comunidade/perfis/*, /v1/comunidade/vinculo-perfis).
 * Tipos puros, compartilhados entre backend (apps/api) e mobile (apps/mobile).
 *
 * `usuarioId` nunca aparece aqui: a Conta jamais é exposta à Comunidade (doc 08 §12.1).
 */

export interface PerfilPublicoResponse {
  perfilId: string;
  contexto: string;
  nomeExibicao: string | null;
  /** Sugestão neutra, derivada só do id opaco do perfil (doc 06 §13). */
  nomeSugerido: string;
  avatarUrl: string | null;
  biografia: string | null;
  anonimo: boolean;
}

/**
 * Corpo de `PUT /v1/comunidade/perfis/{contexto}`.
 * Campo ausente = não alterar; `null` explícito = limpar (voltar ao anonimato).
 */
export interface AtualizarPerfilRequest {
  nomeExibicao?: string | null;
  avatarUrl?: string | null;
  biografia?: string | null;
}

/** Corpo de `POST /v1/comunidade/vinculo-perfis` (Versão 2, atrás de feature flag). */
export interface AutorizarVinculoPerfisRequest {
  perfilIds: string[];
  /** Contextos onde o vínculo aparece a terceiros — permite revelação parcial (doc 06 §18). */
  visivelEm: string[];
}

export interface VinculoPerfisResponse {
  vinculoId: string;
  perfilIds: string[];
  visivelEm: string[];
  vigente: boolean;
}
