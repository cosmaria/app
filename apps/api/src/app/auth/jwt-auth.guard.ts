import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  AUTENTICACAO_PUBLIC_API,
  type AutenticacaoPublicApi,
  type IdentidadeAutenticada,
} from '@cosmaria/core-public-api';

/** Requisição com a identidade autenticada anexada pelo guard. */
export interface RequestAutenticada extends Request {
  usuario?: IdentidadeAutenticada;
}

/**
 * Extrai a identidade autenticada da requisição (garantida pelo JwtAuthGuard).
 * Defensivo: lança se ausente, evitando `!` espalhado pelos controllers.
 */
export function identidadeDe(req: RequestAutenticada): IdentidadeAutenticada {
  if (!req.usuario) {
    throw new UnauthorizedException({ code: 'SESSAO_INVALIDA', message: 'Sessão inválida.' });
  }
  return req.usuario;
}

/**
 * Guard de autenticação (doc 04 §10). Extrai o Bearer token, valida via
 * interface pública do Core (AUTENTICACAO_PUBLIC_API) e anexa a identidade à
 * requisição. Fundação reutilizável pelos módulos Grow/Med em sprints futuras —
 * eles dependerão apenas da public-api, nunca do interior do Core.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    @Inject(AUTENTICACAO_PUBLIC_API)
    private readonly autenticacao: AutenticacaoPublicApi,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<RequestAutenticada>();
    const token = this.extrairToken(req);
    if (!token) {
      throw new UnauthorizedException({
        code: 'TOKEN_AUSENTE',
        message: 'Token de acesso ausente.',
      });
    }

    try {
      req.usuario = this.autenticacao.validar(token);
      return true;
    } catch {
      throw new UnauthorizedException({
        code: 'SESSAO_INVALIDA',
        message: 'Sessão inválida ou expirada.',
      });
    }
  }

  private extrairToken(req: RequestAutenticada): string | null {
    const header = req.headers.authorization;
    if (!header) {
      return null;
    }
    const [tipo, valor] = header.split(' ');
    return tipo === 'Bearer' && valor ? valor : null;
  }
}
