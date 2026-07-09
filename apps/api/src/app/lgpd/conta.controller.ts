import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ConsultarExportacaoUseCase,
  type ExportacaoView,
  SolicitarExclusaoContaUseCase,
  SolicitarExportacaoUseCase,
} from '@cosmaria/core-application';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';

/**
 * Direitos LGPD do titular (doc 04 §21.2/§21.3 / doc 09 /v1/conta/*):
 * exclusão de conta (direito ao esquecimento) e exportação/portabilidade.
 */
@Controller('conta')
@UseGuards(JwtAuthGuard)
export class ContaController {
  constructor(
    private readonly excluir: SolicitarExclusaoContaUseCase,
    private readonly exportar: SolicitarExportacaoUseCase,
    private readonly consultarExportacao: ConsultarExportacaoUseCase,
  ) {}

  @Post('excluir')
  @HttpCode(HttpStatus.ACCEPTED)
  async solicitarExclusao(@Req() req: RequestAutenticada): Promise<{ status: string }> {
    await this.excluir.executar(identidadeDe(req).usuarioId);
    return { status: 'EXCLUSAO_SOLICITADA' };
  }

  @Post('exportar')
  @HttpCode(HttpStatus.ACCEPTED)
  solicitarExportacao(@Req() req: RequestAutenticada): Promise<ExportacaoView> {
    return this.exportar.executar(identidadeDe(req).usuarioId);
  }

  @Get('exportacao/:solicitacaoId')
  async statusExportacao(
    @Param('solicitacaoId') solicitacaoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<ExportacaoView> {
    const view = await this.consultarExportacao.executar(
      identidadeDe(req).usuarioId,
      solicitacaoId,
    );
    if (!view) {
      throw new NotFoundException({
        code: 'EXPORTACAO_NAO_ENCONTRADA',
        message: 'Solicitação de exportação não encontrada.',
      });
    }
    return view;
  }
}
