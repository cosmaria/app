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
  AutorizarVinculoDePerfisUseCase,
  ListarVinculosDoUsuarioUseCase,
  RevogarVinculoDePerfisUseCase,
  type VinculoView,
} from '@cosmaria/core-application';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';
import { AutorizarVinculoPerfisDto } from './dto/perfil.dtos';

/**
 * Vínculo opt-in entre Perfis Públicos da mesma Conta
 * (doc 06 §7.4 / doc 09 `POST|DELETE /v1/comunidade/vinculo-perfis`).
 *
 * **Versão 2**: todos os endpoints respondem 404 enquanto a feature flag
 * `FEATURE_VINCULO_DE_PERFIS` estiver desligada — o modelo de dados existe desde o MVP,
 * a funcionalidade não (doc 06, decisão consolidada #1).
 *
 * O `GET` não constava do doc 09 e foi acrescentado aqui: a tela "Configuração de
 * Vínculo de Perfis" (doc 06, Lista de Telas) não teria como renderizar o estado atual
 * depois de um restart do app, já que o `vinculoId` só existia na resposta do `POST`.
 */
@Controller('comunidade/vinculo-perfis')
@UseGuards(JwtAuthGuard)
export class VinculoPerfisController {
  constructor(
    private readonly autorizar: AutorizarVinculoDePerfisUseCase,
    private readonly revogar: RevogarVinculoDePerfisUseCase,
    private readonly listar: ListarVinculosDoUsuarioUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  autorizarVinculo(
    @Body() dto: AutorizarVinculoPerfisDto,
    @Req() req: RequestAutenticada,
  ): Promise<VinculoView> {
    return this.autorizar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      perfilIds: dto.perfilIds,
      visivelEm: dto.visivelEm,
    });
  }

  @Get()
  listarVinculos(@Req() req: RequestAutenticada): Promise<VinculoView[]> {
    return this.listar.executar(identidadeDe(req).usuarioId);
  }

  @Delete(':vinculoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revogarVinculo(
    @Param('vinculoId') vinculoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<void> {
    await this.revogar.executar({ usuarioId: identidadeDe(req).usuarioId, vinculoId });
  }
}
