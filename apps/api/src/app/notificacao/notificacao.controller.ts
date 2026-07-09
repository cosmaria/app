import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  AtualizarPreferenciaDeNotificacaoUseCase,
  type CentralDeNotificacoesView,
  ListarNotificacoesUseCase,
  MarcarNotificacaoLidaUseCase,
  ObterPreferenciaDeNotificacaoUseCase,
  type PreferenciaView,
} from '@cosmaria/core-application';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';
import { AtualizarPreferenciaNotificacaoDto } from './dto/notificacao.dtos';

/**
 * Preferências de notificação (doc 09 `GET|PUT /v1/preferencia-notificacao`).
 * É a Central de Preferências do doc 10: canais por categoria, horário de silêncio e
 * Modo Discreto — a fonte única do que o Serviço de Notificações pode enviar.
 */
@Controller('preferencia-notificacao')
@UseGuards(JwtAuthGuard)
export class PreferenciaNotificacaoController {
  constructor(
    private readonly obter: ObterPreferenciaDeNotificacaoUseCase,
    private readonly atualizar: AtualizarPreferenciaDeNotificacaoUseCase,
  ) {}

  @Get()
  obterPreferencia(@Req() req: RequestAutenticada): Promise<PreferenciaView> {
    return this.obter.executar(identidadeDe(req).usuarioId);
  }

  @Put()
  atualizarPreferencia(
    @Body() dto: AtualizarPreferenciaNotificacaoDto,
    @Req() req: RequestAutenticada,
  ): Promise<PreferenciaView> {
    return this.atualizar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      modoDiscreto: dto.modoDiscreto,
      fusoHorario: dto.fusoHorario,
      silencioInicioMinutos: dto.silencioInicioMinutos,
      silencioFimMinutos: dto.silencioFimMinutos,
      canaisPorCategoria: dto.canaisPorCategoria,
    });
  }
}

/**
 * Central de Notificações (doc 10). Estes dois endpoints não constavam do doc 09:
 * sem eles, a notificação "registrada sem envio" exigida pelo doc 04 §15 nunca poderia
 * ser lida por ninguém, e a tela da Central não teria como existir.
 */
@Controller('notificacoes')
@UseGuards(JwtAuthGuard)
export class NotificacaoController {
  constructor(
    private readonly listar: ListarNotificacoesUseCase,
    private readonly marcarLida: MarcarNotificacaoLidaUseCase,
  ) {}

  @Get()
  listarNotificacoes(
    @Req() req: RequestAutenticada,
    @Query('limite') limite?: string,
    @Query('deslocamento') deslocamento?: string,
  ): Promise<CentralDeNotificacoesView> {
    return this.listar.executar(identidadeDe(req).usuarioId, {
      limite: numeroOuIndefinido(limite),
      deslocamento: numeroOuIndefinido(deslocamento),
    });
  }

  @Post(':notificacaoId/ler')
  @HttpCode(HttpStatus.NO_CONTENT)
  async lerNotificacao(
    @Param('notificacaoId') notificacaoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<void> {
    await this.marcarLida.executar({ usuarioId: identidadeDe(req).usuarioId, notificacaoId });
  }
}

/** Query string inválida cai no padrão do caso de uso, em vez de virar NaN. */
function numeroOuIndefinido(valor?: string): number | undefined {
  const n = Number(valor);
  return Number.isFinite(n) ? n : undefined;
}
