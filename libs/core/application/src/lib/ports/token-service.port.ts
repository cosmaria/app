/**
 * Porta do serviço de tokens (access token JWT + refresh token).
 * Implementada na infraestrutura (jsonwebtoken + crypto). O provedor é
 * substituível sem tocar na regra de negócio (doc 13 §16.1).
 */
import type { Papel } from '@cosmaria/core-domain';

export interface AccessTokenGerado {
  token: string;
  expiraEmSegundos: number;
}

export interface AccessTokenPayload {
  usuarioId: string;
  email: string;
  /** Papéis de acesso (RBAC, doc 04 §11) — viajam no token para autorização stateless. */
  papeis: Papel[];
}

export interface RefreshTokenGerado {
  token: string;
  expiraEm: Date;
}

export interface RefreshTokenPayload {
  usuarioId: string;
  sessaoId: string;
}

export interface TokenService {
  gerarAccessToken(payload: AccessTokenPayload): AccessTokenGerado;
  /** Lança erro se o token for inválido/expirado. */
  verificarAccessToken(token: string): AccessTokenPayload;

  gerarRefreshToken(payload: RefreshTokenPayload): RefreshTokenGerado;
  /** Lança erro se o refresh token for inválido/expirado. */
  verificarRefreshToken(token: string): RefreshTokenPayload;

  /** Hash determinístico (ex.: SHA-256) do refresh token, para guardar na sessão. */
  hashRefreshToken(token: string): string;
}

export const TOKEN_SERVICE = Symbol('TokenService');
