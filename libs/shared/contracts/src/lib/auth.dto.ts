/**
 * Contratos HTTP de autenticação (doc 09 — /v1/auth/*).
 * Tipos puros, compartilhados entre o backend (apps/api) e o mobile (apps/mobile),
 * eliminando divergência de contrato entre cliente e servidor (doc 13 §9).
 */

export interface RegistrarRequest {
  email: string;
  senha: string;
}

export interface RegistrarResponse {
  usuarioId: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface UsuarioResumoDTO {
  id: string;
  email: string;
}

/** Resposta comum de /login e /refresh (doc 04 §10). */
export interface AutenticacaoResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  usuario: UsuarioResumoDTO;
}

/** Resposta de GET /v1/autorizacao/verificar (doc 04 §11). */
export interface VerificarPermissaoResponse {
  permissao: string;
  permitido: boolean;
}

/** Resposta de GET /v1/autorizacao/eu — papéis e permissões efetivas do usuário. */
export interface MinhaAutorizacaoResponse {
  usuarioId: string;
  email: string;
  papeis: string[];
  permissoes: string[];
}
