import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import {
  AvaliarAlertasUseCase,
  CalcularCorrelacaoCruzadaUseCase,
  CalcularCorrelacaoUseCase,
  GerarDigestUseCase,
  GerarInsightsUseCase,
  GerarRecomendacoesUseCase,
} from '@cosmaria/ia-application';
import type {
  Alerta,
  DigestAnalitico,
  Insight,
  Recomendacao,
  ResultadoDeCorrelacao,
} from '@cosmaria/ia-domain';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';

/**
 * IA — correlações (doc 09 `/v1/ia/correlacoes`, doc 05 §6.1).
 *
 * Modelo de leitura sobre a série temporal própria da IA. Sempre histórico do próprio
 * usuário (princípio permanente doc 05 §4). Validação de fator/domínio fica no caso de uso
 * (erros de domínio → 400).
 */
@Controller('ia')
@UseGuards(JwtAuthGuard)
export class IaController {
  constructor(
    private readonly calcular: CalcularCorrelacaoUseCase,
    private readonly calcularCruzada: CalcularCorrelacaoCruzadaUseCase,
    private readonly gerarInsights: GerarInsightsUseCase,
    private readonly avaliarAlertas: AvaliarAlertasUseCase,
    private readonly gerarRecomendacoes: GerarRecomendacoesUseCase,
    private readonly gerarDigest: GerarDigestUseCase,
  ) {}

  @Get('correlacoes')
  correlacoes(
    @Req() req: RequestAutenticada,
    @Query('dominio') dominio: string,
    @Query('fatorA') fatorA: string,
    @Query('fatorB') fatorB: string,
    @Query('de') de?: string,
    @Query('ate') ate?: string,
  ): Promise<ResultadoDeCorrelacao> {
    return this.calcular.executar({
      usuarioId: identidadeDe(req).usuarioId,
      dominio,
      fatorA,
      fatorB,
      de: de ? new Date(de) : undefined,
      ate: ate ? new Date(ate) : undefined,
    });
  }

  /**
   * `GET /v1/ia/correlacoes/cruzada?fatorGrow=&fatorMed=` — o payoff Grow×Med.
   * Só com opt-in (vínculo Produto↔Lote); senão 403 (doc 00).
   */
  @Get('correlacoes/cruzada')
  correlacaoCruzada(
    @Req() req: RequestAutenticada,
    @Query('fatorGrow') fatorGrow: string,
    @Query('fatorMed') fatorMed: string,
    @Query('de') de?: string,
    @Query('ate') ate?: string,
  ): Promise<ResultadoDeCorrelacao> {
    return this.calcularCruzada.executar({
      usuarioId: identidadeDe(req).usuarioId,
      fatorGrow,
      fatorMed,
      de: de ? new Date(de) : undefined,
      ate: ate ? new Date(ate) : undefined,
    });
  }

  @Get('insights')
  insights(@Req() req: RequestAutenticada, @Query('dominio') dominio: string): Promise<Insight[]> {
    return this.gerarInsights.executar({ usuarioId: identidadeDe(req).usuarioId, dominio });
  }

  @Get('alertas')
  alertas(@Req() req: RequestAutenticada, @Query('dominio') dominio: string): Promise<Alerta[]> {
    return this.avaliarAlertas.executar({ usuarioId: identidadeDe(req).usuarioId, dominio });
  }

  @Get('recomendacoes')
  recomendacoes(
    @Req() req: RequestAutenticada,
    @Query('dominio') dominio: string,
  ): Promise<Recomendacao[]> {
    return this.gerarRecomendacoes.executar({ usuarioId: identidadeDe(req).usuarioId, dominio });
  }

  @Get('digest')
  digest(
    @Req() req: RequestAutenticada,
    @Query('dominio') dominio: string,
  ): Promise<DigestAnalitico> {
    return this.gerarDigest.executar({ usuarioId: identidadeDe(req).usuarioId, dominio });
  }
}
