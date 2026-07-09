import { Body, Controller, Get, HttpCode, HttpStatus, Post, Req, UseGuards } from '@nestjs/common';
import {
  AplicarCupomUseCase,
  type AssinaturaView,
  CancelarAssinaturaUseCase,
  ConsultarLimitesUseCase,
  IniciarUpgradeUseCase,
  ObterAssinaturaUseCase,
  type UpgradeIniciadoView,
} from '@cosmaria/core-application';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';
import { AplicarCupomDto, IniciarUpgradeDto } from './dto/billing.dtos';

/**
 * Assinatura única da plataforma (doc 07 §5 / doc 09 `/v1/assinatura/*`).
 * Uma assinatura por Conta desbloqueia Grow, Med e futuros apps de uma vez — por isso
 * nenhum endpoint aqui recebe "de qual app" se trata.
 *
 * `GET` materializa a assinatura gratuita na primeira consulta (criação lazy), do mesmo
 * jeito que o Perfil Público — Identidade não precisa conhecer Billing para criá-la.
 */
@Controller('assinatura')
@UseGuards(JwtAuthGuard)
export class AssinaturaController {
  constructor(
    private readonly obter: ObterAssinaturaUseCase,
    private readonly upgrade: IniciarUpgradeUseCase,
    private readonly cancelar: CancelarAssinaturaUseCase,
    private readonly cupom: AplicarCupomUseCase,
  ) {}

  @Get()
  obterAssinatura(@Req() req: RequestAutenticada): Promise<AssinaturaView> {
    return this.obter.executar(identidadeDe(req).usuarioId);
  }

  /**
   * Inicia o upgrade (API-4). NUNCA concede Premium: devolve o checkout e deixa a
   * assinatura `PENDENTE_PAGAMENTO` até o webhook do gateway confirmar o pagamento.
   */
  @Post('upgrade')
  @HttpCode(HttpStatus.ACCEPTED)
  iniciarUpgrade(
    @Body() dto: IniciarUpgradeDto,
    @Req() req: RequestAutenticada,
  ): Promise<UpgradeIniciadoView> {
    return this.upgrade.executar({
      usuarioId: identidadeDe(req).usuarioId,
      ciclo: dto.ciclo,
      pais: dto.pais.toUpperCase(),
      cupomCodigo: dto.cupomCodigo,
    });
  }

  /** Cancelamento gentil: o Premium segue válido até o fim do período já pago. */
  @Post('cancelar')
  cancelarAssinatura(@Req() req: RequestAutenticada): Promise<AssinaturaView> {
    return this.cancelar.executar(identidadeDe(req).usuarioId);
  }

  @Post('cupom')
  aplicarCupom(
    @Body() dto: AplicarCupomDto,
    @Req() req: RequestAutenticada,
  ): Promise<AssinaturaView> {
    return this.cupom.executar({ usuarioId: identidadeDe(req).usuarioId, codigo: dto.codigo });
  }
}

/**
 * `GET /v1/conta/limites` (doc 09) — consolida o que aparecia duplicado como
 * `/usuario/limites-premium` nos docs 02 e 03. Vive em `conta` porque o limite é da
 * Conta, não de um app; o prefixo é compartilhado com o ContaController da LGPD.
 */
@Controller('conta')
@UseGuards(JwtAuthGuard)
export class LimitesController {
  constructor(private readonly limites: ConsultarLimitesUseCase) {}

  @Get('limites')
  consultarLimites(@Req() req: RequestAutenticada) {
    return this.limites.executar(identidadeDe(req).usuarioId);
  }
}
