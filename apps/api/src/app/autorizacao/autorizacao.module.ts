import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AutorizacaoController } from './autorizacao.controller';
import { PermissaoGuard } from './permissao.guard';

/**
 * Módulo de Autorização (RBAC, doc 04 §11). Importa o AuthModule para reutilizar
 * o JwtAuthGuard (identidade). Exporta o PermissaoGuard para os módulos que
 * exporão endpoints Administrativos (Billing, LGPD, Comunidade) nas épicas seguintes.
 */
@Module({
  imports: [AuthModule],
  controllers: [AutorizacaoController],
  providers: [PermissaoGuard],
  exports: [PermissaoGuard],
})
export class AutorizacaoModule {}
