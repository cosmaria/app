import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Papel, Permissao } from '@cosmaria/core-domain';
import { PermissaoGuard } from './permissao.guard';

function montar(papeis: Papel[] | undefined, requeridas: Permissao[]) {
  const reflector = new Reflector();
  jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requeridas);
  const ctx = {
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({
      getRequest: () => ({ usuario: papeis ? { papeis } : undefined }),
    }),
  } as unknown as ExecutionContext;
  return { guard: new PermissaoGuard(reflector), ctx };
}

describe('PermissaoGuard', () => {
  it('deixa passar quando o handler não exige permissão', () => {
    const { guard, ctx } = montar([Papel.USUARIO], []);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('deixa passar ADMIN em rota que exige GERIR_PLATAFORMA', () => {
    const { guard, ctx } = montar([Papel.ADMIN], [Permissao.GERIR_PLATAFORMA]);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('bloqueia USUARIO comum em rota administrativa (403)', () => {
    const { guard, ctx } = montar([Papel.USUARIO], [Permissao.GERIR_PLATAFORMA]);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('bloqueia quando não há identidade (sem autenticação)', () => {
    const { guard, ctx } = montar(undefined, [Permissao.GERIR_PLATAFORMA]);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
