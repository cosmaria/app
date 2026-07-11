import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  type DadosClimaticosView,
  DefinirDadosClimaticosUseCase,
  ObterDadosClimaticosUseCase,
  RemoverDadosClimaticosUseCase,
} from '@cosmaria/grow-application';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';
import { DefinirClimaDto } from './dto/grow.dtos';

/**
 * Módulo Outdoor (doc 09 `/v1/ambientes/{id}/clima`, API-3). Desacoplado: a ausência de
 * dados climáticos é isolada (404), nunca quebra o restante do Grow.
 */
@Controller('ambientes')
@UseGuards(JwtAuthGuard)
export class ClimaController {
  constructor(
    private readonly definir: DefinirDadosClimaticosUseCase,
    private readonly obter: ObterDadosClimaticosUseCase,
    private readonly remover: RemoverDadosClimaticosUseCase,
  ) {}

  @Put(':ambienteId/clima')
  definirClima(
    @Param('ambienteId') ambienteId: string,
    @Body() dto: DefinirClimaDto,
    @Req() req: RequestAutenticada,
  ): Promise<DadosClimaticosView> {
    return this.definir.executar({
      usuarioId: identidadeDe(req).usuarioId,
      ambienteId,
      localizacaoAproximada: dto.localizacaoAproximada,
      latitudeAproximada: dto.latitudeAproximada,
      longitudeAproximada: dto.longitudeAproximada,
      observacoes: dto.observacoes,
    });
  }

  @Get(':ambienteId/clima')
  obterClima(
    @Param('ambienteId') ambienteId: string,
    @Req() req: RequestAutenticada,
  ): Promise<DadosClimaticosView> {
    return this.obter.executar({ usuarioId: identidadeDe(req).usuarioId, ambienteId });
  }

  @Delete(':ambienteId/clima')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removerClima(
    @Param('ambienteId') ambienteId: string,
    @Req() req: RequestAutenticada,
  ): Promise<void> {
    await this.remover.executar({ usuarioId: identidadeDe(req).usuarioId, ambienteId });
  }
}
