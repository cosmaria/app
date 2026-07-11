import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import {
  type ComparacaoDeCiclosView,
  CompararCiclosUseCase,
  ObterRelatorioDoCicloUseCase,
  type RelatorioDoCicloView,
} from '@cosmaria/grow-application';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';

/** Relatório determinístico de um ciclo (doc 09 `GET /v1/ciclos/{id}/relatorio`, API-3). */
@Controller('ciclos')
@UseGuards(JwtAuthGuard)
export class RelatorioDoCicloController {
  constructor(private readonly relatorio: ObterRelatorioDoCicloUseCase) {}

  @Get(':cicloId/relatorio')
  obterRelatorio(
    @Param('cicloId') cicloId: string,
    @Req() req: RequestAutenticada,
  ): Promise<RelatorioDoCicloView> {
    return this.relatorio.executar({ usuarioId: identidadeDe(req).usuarioId, cicloId });
  }
}

/**
 * Comparação entre ciclos (doc 02 §5.12). Fica sob `/estatisticas` para não colidir com a
 * rota paramétrica `GET /v1/ciclos/{id}`. `ids` é uma lista separada por vírgula.
 */
@Controller('estatisticas')
@UseGuards(JwtAuthGuard)
export class ComparacaoDeCiclosController {
  constructor(private readonly comparar: CompararCiclosUseCase) {}

  @Get('comparar-ciclos')
  compararCiclos(
    @Req() req: RequestAutenticada,
    @Query('ids') ids?: string,
  ): Promise<ComparacaoDeCiclosView> {
    const cicloIds = (ids ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return this.comparar.executar({ usuarioId: identidadeDe(req).usuarioId, cicloIds });
  }
}
