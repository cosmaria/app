import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  type ColheitaView,
  type CuraView,
  FinalizarCuraUseCase,
  FinalizarSecagemUseCase,
  GerarLoteUseCase,
  ListarColheitasDoCicloUseCase,
  type LoteView,
  ObterColheitaUseCase,
  ObterLoteUseCase,
  RegistrarColheitaUseCase,
  RegistrarCuraUseCase,
  RegistrarSecagemUseCase,
  type SecagemView,
} from '@cosmaria/grow-application';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';
import {
  GerarLoteDto,
  RegistrarColheitaDto,
  RegistrarCuraDto,
  RegistrarSecagemDto,
} from './dto/grow.dtos';

/** Colheitas (doc 09 `/v1/colheitas`) — 0—N por ciclo, colheita escalonada. */
@Controller('colheitas')
@UseGuards(JwtAuthGuard)
export class ColheitaController {
  constructor(
    private readonly registrar: RegistrarColheitaUseCase,
    private readonly obter: ObterColheitaUseCase,
  ) {}

  @Post()
  registrarColheita(
    @Body() dto: RegistrarColheitaDto,
    @Req() req: RequestAutenticada,
  ): Promise<ColheitaView> {
    return this.registrar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      cicloId: dto.cicloId,
      plantaIds: dto.plantaIds,
      pesoUmidoGramas: dto.pesoUmidoGramas,
      colhidoEm: dto.colhidoEm ? new Date(dto.colhidoEm) : undefined,
      observacoes: dto.observacoes,
    });
  }

  @Get(':colheitaId')
  obterColheita(
    @Param('colheitaId') colheitaId: string,
    @Req() req: RequestAutenticada,
  ): Promise<ColheitaView> {
    return this.obter.executar({ usuarioId: identidadeDe(req).usuarioId, colheitaId });
  }
}

/** Listagem das colheitas de um ciclo. Legível mesmo após o encerramento. */
@Controller('ciclos')
@UseGuards(JwtAuthGuard)
export class ColheitasDoCicloController {
  constructor(private readonly listar: ListarColheitasDoCicloUseCase) {}

  @Get(':cicloId/colheitas')
  colheitasDoCiclo(
    @Param('cicloId') cicloId: string,
    @Req() req: RequestAutenticada,
  ): Promise<ColheitaView[]> {
    return this.listar.executar({ usuarioId: identidadeDe(req).usuarioId, cicloId });
  }
}

/** Secagens (doc 09 `/v1/secagens`) — 1—1 com a colheita, finalização monotônica. */
@Controller('secagens')
@UseGuards(JwtAuthGuard)
export class SecagemController {
  constructor(
    private readonly registrar: RegistrarSecagemUseCase,
    private readonly finalizar: FinalizarSecagemUseCase,
  ) {}

  @Post()
  registrarSecagem(
    @Body() dto: RegistrarSecagemDto,
    @Req() req: RequestAutenticada,
  ): Promise<SecagemView> {
    return this.registrar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      colheitaId: dto.colheitaId,
      iniciadaEm: dto.iniciadaEm ? new Date(dto.iniciadaEm) : undefined,
      finalizadaEm: dto.finalizadaEm ? new Date(dto.finalizadaEm) : undefined,
      temperaturaC: dto.temperaturaC,
      umidadeRelativa: dto.umidadeRelativa,
      observacoes: dto.observacoes,
    });
  }

  @Post(':secagemId/finalizar')
  finalizarSecagem(
    @Param('secagemId') secagemId: string,
    @Req() req: RequestAutenticada,
  ): Promise<SecagemView> {
    return this.finalizar.executar({ usuarioId: identidadeDe(req).usuarioId, secagemId });
  }
}

/** Curas (doc 09 `/v1/curas`) — 1—1 com a secagem. */
@Controller('curas')
@UseGuards(JwtAuthGuard)
export class CuraController {
  constructor(
    private readonly registrar: RegistrarCuraUseCase,
    private readonly finalizar: FinalizarCuraUseCase,
  ) {}

  @Post()
  registrarCura(@Body() dto: RegistrarCuraDto, @Req() req: RequestAutenticada): Promise<CuraView> {
    return this.registrar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      secagemId: dto.secagemId,
      iniciadaEm: dto.iniciadaEm ? new Date(dto.iniciadaEm) : undefined,
      finalizadaEm: dto.finalizadaEm ? new Date(dto.finalizadaEm) : undefined,
      temperaturaC: dto.temperaturaC,
      umidadeRelativa: dto.umidadeRelativa,
      burping: dto.burping,
      observacoes: dto.observacoes,
    });
  }

  @Post(':curaId/finalizar')
  finalizarCura(
    @Param('curaId') curaId: string,
    @Req() req: RequestAutenticada,
  ): Promise<CuraView> {
    return this.finalizar.executar({ usuarioId: identidadeDe(req).usuarioId, curaId });
  }
}

/** Lotes (doc 09 `/v1/lotes`) — unidade terminal do fluxo, 1—1 com a cura. */
@Controller('lotes')
@UseGuards(JwtAuthGuard)
export class LoteController {
  constructor(
    private readonly gerar: GerarLoteUseCase,
    private readonly obter: ObterLoteUseCase,
  ) {}

  @Post()
  gerarLote(@Body() dto: GerarLoteDto, @Req() req: RequestAutenticada): Promise<LoteView> {
    return this.gerar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      curaId: dto.curaId,
      codigo: dto.codigo,
      pesoSecoGramas: dto.pesoSecoGramas,
      observacoes: dto.observacoes,
    });
  }

  @Get(':loteId')
  obterLote(@Param('loteId') loteId: string, @Req() req: RequestAutenticada): Promise<LoteView> {
    return this.obter.executar({ usuarioId: identidadeDe(req).usuarioId, loteId });
  }
}
