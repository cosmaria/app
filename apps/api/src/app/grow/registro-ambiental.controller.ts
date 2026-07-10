import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import {
  ListarSerieTemporalUseCase,
  ObterCamposDoCheckInUseCase,
  RegistrarCheckInUseCase,
  type RegistroAmbientalView,
  type SerieTemporalView,
} from '@cosmaria/grow-application';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';
import { RegistrarCheckInDto } from './dto/grow.dtos';

/** Query string inválida cai no padrão do caso de uso, em vez de virar NaN. */
function numeroOuIndefinido(valor?: string): number | undefined {
  const n = Number(valor);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Registro Ambiental (doc 09 `/v1/registros-ambientais`) — o check-in diário único do
 * doc 02 §4. Série temporal append-only: não existe `PUT` nem `DELETE`, por decisão.
 */
@Controller('registros-ambientais')
@UseGuards(JwtAuthGuard)
export class RegistroAmbientalController {
  constructor(
    private readonly registrar: RegistrarCheckInUseCase,
    private readonly campos: ObterCamposDoCheckInUseCase,
  ) {}

  @Post()
  registrarCheckIn(
    @Body() dto: RegistrarCheckInDto,
    @Req() req: RequestAutenticada,
  ): Promise<RegistroAmbientalView> {
    return this.registrar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      cicloId: dto.cicloId,
      plantaId: dto.plantaId,
      registradoEm: dto.registradoEm ? new Date(dto.registradoEm) : undefined,
      origem: dto.origem,
      temperaturaC: dto.temperaturaC,
      umidadeRelativa: dto.umidadeRelativa,
      ph: dto.ph,
      ec: dto.ec,
      ppfd: dto.ppfd,
      horasDeLuz: dto.horasDeLuz,
      deltaFolhaC: dto.deltaFolhaC,
      observacoes: dto.observacoes,
    });
  }

  /**
   * Quais campos do check-in este usuário deve ver (doc 02 §5.0). O Grow declara o nível
   * de cada campo; quem decide é a Complexidade Progressiva do Core.
   */
  @Get('campos')
  camposVisiveis(@Req() req: RequestAutenticada): Promise<string[]> {
    return this.campos.executar(identidadeDe(req).usuarioId);
  }
}

/** Série temporal de um ciclo. Legível mesmo depois de encerrado — só a escrita fecha. */
@Controller('ciclos')
@UseGuards(JwtAuthGuard)
export class SerieTemporalController {
  constructor(private readonly listar: ListarSerieTemporalUseCase) {}

  @Get(':cicloId/registros-ambientais')
  serieDoCiclo(
    @Param('cicloId') cicloId: string,
    @Req() req: RequestAutenticada,
    @Query('limite') limite?: string,
    @Query('deslocamento') deslocamento?: string,
  ): Promise<SerieTemporalView> {
    return this.listar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      cicloId,
      limite: numeroOuIndefinido(limite),
      deslocamento: numeroOuIndefinido(deslocamento),
    });
  }
}
