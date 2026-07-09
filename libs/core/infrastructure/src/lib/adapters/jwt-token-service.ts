import { createHash } from 'node:crypto';
import jwt from 'jsonwebtoken';
import type { Papel } from '@cosmaria/core-domain';
import type {
  AccessTokenGerado,
  AccessTokenPayload,
  RefreshTokenGerado,
  RefreshTokenPayload,
  TokenService,
} from '@cosmaria/core-application';

export interface JwtConfig {
  accessSecret: string;
  refreshSecret: string;
  /** Tempo de vida do access token, em segundos. */
  accessTtlSegundos: number;
  /** Tempo de vida do refresh token, em segundos. */
  refreshTtlSegundos: number;
}

interface AccessClaims {
  sub: string;
  email: string;
  papeis: string[];
}

interface RefreshClaims {
  sub: string;
  sid: string;
}

/**
 * Implementação da porta TokenService com jsonwebtoken (access token) +
 * SHA-256 (hash determinístico do refresh token, guardado na sessão).
 * O provedor de token é substituível sem tocar na regra de negócio (doc 13 §16.1).
 */
export class JwtTokenService implements TokenService {
  constructor(private readonly config: JwtConfig) {}

  gerarAccessToken(payload: AccessTokenPayload): AccessTokenGerado {
    const claims: AccessClaims = {
      sub: payload.usuarioId,
      email: payload.email,
      papeis: payload.papeis,
    };
    const token = jwt.sign(claims, this.config.accessSecret, {
      expiresIn: this.config.accessTtlSegundos,
    });
    return { token, expiraEmSegundos: this.config.accessTtlSegundos };
  }

  verificarAccessToken(token: string): AccessTokenPayload {
    const decoded = jwt.verify(token, this.config.accessSecret) as unknown as AccessClaims;
    return {
      usuarioId: decoded.sub,
      email: decoded.email,
      papeis: (decoded.papeis ?? []) as Papel[],
    };
  }

  gerarRefreshToken(payload: RefreshTokenPayload): RefreshTokenGerado {
    const claims: RefreshClaims = { sub: payload.usuarioId, sid: payload.sessaoId };
    const token = jwt.sign(claims, this.config.refreshSecret, {
      expiresIn: this.config.refreshTtlSegundos,
    });
    const expiraEm = new Date(Date.now() + this.config.refreshTtlSegundos * 1000);
    return { token, expiraEm };
  }

  verificarRefreshToken(token: string): RefreshTokenPayload {
    const decoded = jwt.verify(token, this.config.refreshSecret) as unknown as RefreshClaims;
    return { usuarioId: decoded.sub, sessaoId: decoded.sid };
  }

  hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
