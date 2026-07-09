import { SetMetadata } from '@nestjs/common';
import type { Permissao } from '@cosmaria/core-domain';

export const PERMISSOES_REQUERIDAS = 'permissoes_requeridas';

/**
 * Marca um handler/controller como exigindo uma ou mais permissões (RBAC, doc 04 §11).
 * Usar SEMPRE junto do JwtAuthGuard, que popula a identidade:
 *   `@UseGuards(JwtAuthGuard, PermissaoGuard) @RequerPermissao(Permissao.GERIR_PLATAFORMA)`
 * É a base dos endpoints Administrativos (doc 09 API-6) das épicas futuras.
 */
export const RequerPermissao = (...permissoes: Permissao[]): MethodDecorator & ClassDecorator =>
  SetMetadata(PERMISSOES_REQUERIDAS, permissoes);
