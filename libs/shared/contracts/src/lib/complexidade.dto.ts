/**
 * Contratos HTTP da Complexidade Progressiva (doc 09 — /v1/preferencia-complexidade).
 * Tipos puros, compartilhados entre backend (apps/api) e mobile (apps/mobile).
 */

export interface PreferenciaComplexidadeResponse {
  /** ESSENCIAL | AVANCADO | ESPECIALISTA. */
  nivel: string;
  modoEspecialista: boolean;
  /** Campos avançados liberados individualmente, sem subir de nível. */
  camposHabilitados: string[];
}

/** Corpo de `PUT /v1/preferencia-complexidade`. Campo ausente não é alterado. */
export interface AtualizarPreferenciaComplexidadeRequest {
  nivel?: string;
  habilitarCampos?: string[];
  desabilitarCampos?: string[];
}
