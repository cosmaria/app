import { Body, Controller, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import {
  AtualizarTarefaUseCase,
  ConcluirTarefaUseCase,
  type ConcluirTarefaResult,
  CriarTarefaUseCase,
  ListarTarefasUseCase,
  type TarefaView,
} from '@cosmaria/grow-application';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';
import { AtualizarTarefaDto, CriarTarefaDto } from './dto/grow.dtos';

/** Tarefas e lembretes (doc 09 `/v1/tarefas`). Plano de ação mutável do cultivo. */
@Controller('tarefas')
@UseGuards(JwtAuthGuard)
export class TarefaController {
  constructor(
    private readonly criar: CriarTarefaUseCase,
    private readonly listar: ListarTarefasUseCase,
    private readonly atualizar: AtualizarTarefaUseCase,
    private readonly concluir: ConcluirTarefaUseCase,
  ) {}

  @Post()
  criarTarefa(@Body() dto: CriarTarefaDto, @Req() req: RequestAutenticada): Promise<TarefaView> {
    return this.criar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      cicloId: dto.cicloId,
      plantaId: dto.plantaId,
      titulo: dto.titulo,
      tipo: dto.tipo,
      previstaPara: dto.previstaPara ? new Date(dto.previstaPara) : undefined,
      recorrenciaDias: dto.recorrenciaDias,
    });
  }

  /** `GET /v1/tarefas?cicloId=&pendentes=true` — a agenda do usuário. */
  @Get()
  listarTarefas(
    @Req() req: RequestAutenticada,
    @Query('cicloId') cicloId?: string,
    @Query('pendentes') pendentes?: string,
  ): Promise<TarefaView[]> {
    return this.listar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      cicloId,
      apenasPendentes: pendentes === 'true',
    });
  }

  @Put(':tarefaId')
  atualizarTarefa(
    @Param('tarefaId') tarefaId: string,
    @Body() dto: AtualizarTarefaDto,
    @Req() req: RequestAutenticada,
  ): Promise<TarefaView> {
    return this.atualizar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      tarefaId,
      titulo: dto.titulo,
      tipo: dto.tipo,
      previstaPara:
        dto.previstaPara === undefined
          ? undefined
          : dto.previstaPara === null
            ? null
            : new Date(dto.previstaPara),
      recorrenciaDias: dto.recorrenciaDias,
    });
  }

  /** Concluir gera a próxima ocorrência quando a tarefa é recorrente e o ciclo está ativo. */
  @Post(':tarefaId/concluir')
  concluirTarefa(
    @Param('tarefaId') tarefaId: string,
    @Req() req: RequestAutenticada,
  ): Promise<ConcluirTarefaResult> {
    return this.concluir.executar({ usuarioId: identidadeDe(req).usuarioId, tarefaId });
  }
}
