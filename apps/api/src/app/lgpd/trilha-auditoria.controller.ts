import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ConsultarTrilhaDeAuditoriaUseCase, type TrilhaView } from '@cosmaria/core-application';
import { Permissao } from '@cosmaria/core-domain';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissaoGuard } from '../autorizacao/permissao.guard';
import { RequerPermissao } from '../autorizacao/requer-permissao.decorator';

/**
 * Trilha de auditoria (doc 09 `GET /v1/admin/trilha-auditoria`, arquétipo API-6).
 * Administrativa: exige autenticação + a permissão LER_TRILHA_AUDITORIA (RBAC, doc 04 §11).
 * É o primeiro endpoint administrativo real a exercitar o PermissaoGuard.
 */
@Controller('admin/trilha-auditoria')
@UseGuards(JwtAuthGuard, PermissaoGuard)
@RequerPermissao(Permissao.LER_TRILHA_AUDITORIA)
export class TrilhaAuditoriaController {
  constructor(private readonly consultar: ConsultarTrilhaDeAuditoriaUseCase) {}

  @Get()
  listar(@Query('limite') limite?: string): Promise<TrilhaView[]> {
    const n = Number(limite);
    const limiteEfetivo = Number.isFinite(n) && n > 0 && n <= 500 ? Math.floor(n) : 100;
    return this.consultar.executar(limiteEfetivo);
  }
}
