import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  CriarModeloDeCicloUseCase,
  ListarModelosDeCicloUseCase,
  type ModeloDeCicloView,
  RemoverModeloDeCicloUseCase,
} from '@cosmaria/grow-application';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';
import { CriarModeloDeCicloDto } from './dto/grow.dtos';

/**
 * Modelos de Ciclo (doc 09 `/v1/ciclos/modelos`, API-1 — Premium). Templates nomeados e
 * reutilizáveis. Registrado **antes** do CicloController no módulo: a rota literal
 * `ciclos/modelos` precisa casar antes de `ciclos/:id`, senão "modelos" seria lido como
 * um id de ciclo.
 */
@Controller('ciclos')
@UseGuards(JwtAuthGuard)
export class ModeloDeCicloController {
  constructor(
    private readonly criar: CriarModeloDeCicloUseCase,
    private readonly listar: ListarModelosDeCicloUseCase,
    private readonly remover: RemoverModeloDeCicloUseCase,
  ) {}

  @Post('modelos')
  criarModelo(
    @Body() dto: CriarModeloDeCicloDto,
    @Req() req: RequestAutenticada,
  ): Promise<ModeloDeCicloView> {
    return this.criar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      nome: dto.nome,
      ambienteId: dto.ambienteId,
      geneticaId: dto.geneticaId,
      faseInicial: dto.faseInicial,
      rotinaPadrao: dto.rotinaPadrao,
    });
  }

  @Get('modelos')
  listarModelos(@Req() req: RequestAutenticada): Promise<ModeloDeCicloView[]> {
    return this.listar.executar(identidadeDe(req).usuarioId);
  }

  @Delete('modelos/:modeloId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removerModelo(
    @Param('modeloId') modeloId: string,
    @Req() req: RequestAutenticada,
  ): Promise<void> {
    await this.remover.executar({ usuarioId: identidadeDe(req).usuarioId, modeloId });
  }
}
