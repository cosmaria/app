import { ehPapelValido, Papel, SessaoInvalidaError } from '@cosmaria/core-domain';
import { TokenService } from '../ports/token-service.port';

export interface IdentidadeAutenticada {
  usuarioId: string;
  email: string;
  /** Papéis de acesso (RBAC, doc 04 §11), extraídos do token. */
  papeis: Papel[];
}

/**
 * Valida um access token e devolve a identidade — consumido pelo guard do
 * apps/api e, futuramente, pela public-api que outros módulos (Grow/Med) usam.
 * Stateless por desempenho (não consulta o banco a cada requisição, doc 09 princípio 1).
 */
export class ValidarAccessTokenUseCase {
  constructor(private readonly tokens: TokenService) {}

  executar(token: string): IdentidadeAutenticada {
    try {
      const payload = this.tokens.verificarAccessToken(token);
      // Papéis vêm do token (fonte externa) — descarta qualquer valor desconhecido.
      const papeis = (payload.papeis ?? []).filter((p): p is Papel => ehPapelValido(p));
      return { usuarioId: payload.usuarioId, email: payload.email, papeis };
    } catch {
      throw new SessaoInvalidaError();
    }
  }
}
