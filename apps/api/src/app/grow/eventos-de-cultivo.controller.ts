import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  type EventoManejoView,
  type EventoSanidadeView,
  ListarManejosDoCicloUseCase,
  ListarSanidadeDoCicloUseCase,
  RegistrarManejoUseCase,
  RegistrarSanidadeUseCase,
  ResolverSanidadeUseCase,
} from '@cosmaria/grow-application';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';
import { RegistrarManejoDto, RegistrarSanidadeDto, ResolverSanidadeDto } from './dto/grow.dtos';

/** Eventos de manejo (doc 09 `/v1/eventos-manejo`) — histórico imutável do que se fez. */
@Controller('eventos-manejo')
@UseGuards(JwtAuthGuard)
export class EventoManejoController {
  constructor(private readonly registrar: RegistrarManejoUseCase) {}

  @Post()
  registrarManejo(
    @Body() dto: RegistrarManejoDto,
    @Req() req: RequestAutenticada,
  ): Promise<EventoManejoView> {
    return this.registrar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      cicloId: dto.cicloId,
      plantaId: dto.plantaId,
      tipo: dto.tipo,
      ocorridoEm: dto.ocorridoEm ? new Date(dto.ocorridoEm) : undefined,
      observacoes: dto.observacoes,
    });
  }
}

/** Eventos de sanidade (doc 09 `/v1/eventos-sanidade`) — resolução monotônica. */
@Controller('eventos-sanidade')
@UseGuards(JwtAuthGuard)
export class EventoSanidadeController {
  constructor(
    private readonly registrar: RegistrarSanidadeUseCase,
    private readonly resolver: ResolverSanidadeUseCase,
  ) {}

  @Post()
  registrarSanidade(
    @Body() dto: RegistrarSanidadeDto,
    @Req() req: RequestAutenticada,
  ): Promise<EventoSanidadeView> {
    return this.registrar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      cicloId: dto.cicloId,
      plantaId: dto.plantaId,
      tipo: dto.tipo,
      severidade: dto.severidade,
      descricao: dto.descricao,
      tratamentoAplicado: dto.tratamentoAplicado,
      ocorridoEm: dto.ocorridoEm ? new Date(dto.ocorridoEm) : undefined,
    });
  }

  @Post(':eventoId/resolver')
  resolverSanidade(
    @Param('eventoId') eventoId: string,
    @Body() dto: ResolverSanidadeDto,
    @Req() req: RequestAutenticada,
  ): Promise<EventoSanidadeView> {
    return this.resolver.executar({
      usuarioId: identidadeDe(req).usuarioId,
      eventoId,
      tratamentoAplicado: dto.tratamentoAplicado,
    });
  }
}

/** Listagens dos eventos de um ciclo. Legíveis mesmo após o encerramento. */
@Controller('ciclos')
@UseGuards(JwtAuthGuard)
export class EventosDoCicloController {
  constructor(
    private readonly manejos: ListarManejosDoCicloUseCase,
    private readonly sanidades: ListarSanidadeDoCicloUseCase,
  ) {}

  @Get(':cicloId/eventos-manejo')
  manejosDoCiclo(
    @Param('cicloId') cicloId: string,
    @Req() req: RequestAutenticada,
  ): Promise<EventoManejoView[]> {
    return this.manejos.executar({ usuarioId: identidadeDe(req).usuarioId, cicloId });
  }

  @Get(':cicloId/eventos-sanidade')
  sanidadesDoCiclo(
    @Param('cicloId') cicloId: string,
    @Req() req: RequestAutenticada,
    @Query('abertos') abertos?: string,
  ): Promise<EventoSanidadeView[]> {
    return this.sanidades.executar({
      usuarioId: identidadeDe(req).usuarioId,
      cicloId,
      apenasAbertos: abertos === 'true',
    });
  }
}
