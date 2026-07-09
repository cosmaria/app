import {
  BadRequestException,
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
  type ConsentimentoView,
  ListarConsentimentosUseCase,
  RegistrarConsentimentoUseCase,
  RevogarConsentimentoUseCase,
} from '@cosmaria/core-application';
import { ehTipoConsentimentoValido } from '@cosmaria/core-domain';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';
import { RegistrarConsentimentoDto } from './dto/lgpd.dtos';

/**
 * Consentimento do usuário autenticado (doc 04 §21.1 / doc 09 /v1/consentimento).
 * Registrar, listar (direito de acesso) e revogar — sempre sobre o próprio usuário.
 */
@Controller('consentimento')
@UseGuards(JwtAuthGuard)
export class ConsentimentoController {
  constructor(
    private readonly registrar: RegistrarConsentimentoUseCase,
    private readonly revogar: RevogarConsentimentoUseCase,
    private readonly listar: ListarConsentimentosUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  registrarConsentimento(
    @Body() dto: RegistrarConsentimentoDto,
    @Req() req: RequestAutenticada,
  ): Promise<ConsentimentoView> {
    return this.registrar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      tipo: dto.tipo,
      versaoTexto: dto.versaoTexto,
    });
  }

  @Get()
  listarConsentimentos(@Req() req: RequestAutenticada): Promise<ConsentimentoView[]> {
    return this.listar.executar(identidadeDe(req).usuarioId);
  }

  @Delete(':tipo')
  @HttpCode(HttpStatus.NO_CONTENT)
  async revogarConsentimento(
    @Param('tipo') tipo: string,
    @Req() req: RequestAutenticada,
  ): Promise<void> {
    if (!ehTipoConsentimentoValido(tipo)) {
      throw new BadRequestException({
        code: 'CONSENTIMENTO_INVALIDO',
        message: 'Tipo de consentimento desconhecido.',
      });
    }
    await this.revogar.executar({ usuarioId: identidadeDe(req).usuarioId, tipo });
  }
}
