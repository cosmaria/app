import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Permissao, PoliticaDeAutorizacao } from '@cosmaria/core-domain';
import { PERMISSOES_REQUERIDAS } from './requer-permissao.decorator';
import type { RequestAutenticada } from '../auth/jwt-auth.guard';

/**
 * Guard de autorização (RBAC, doc 04 §11). Lê as permissões exigidas por
 * `@RequerPermissao(...)` e as confronta com os papéis da identidade autenticada
 * (populada antes pelo JwtAuthGuard). Consulta a PoliticaDeAutorizacao do domínio —
 * nunca reimplementa a regra aqui. Sem permissões exigidas, deixa passar.
 */
@Injectable()
export class PermissaoGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requeridas =
      this.reflector.getAllAndOverride<Permissao[]>(PERMISSOES_REQUERIDAS, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requeridas.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest<RequestAutenticada>();
    const papeis = req.usuario?.papeis ?? [];

    const autorizado = requeridas.every((permissao) =>
      PoliticaDeAutorizacao.concede(papeis, permissao),
    );
    if (!autorizado) {
      throw new ForbiddenException({
        code: 'ACESSO_NEGADO',
        message: 'Você não tem permissão para executar esta ação.',
      });
    }
    return true;
  }
}
