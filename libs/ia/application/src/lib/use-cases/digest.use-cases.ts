import {
  type DigestAnalitico,
  DominioDeDado,
  DominioDeDadoInvalidoError,
  ehDominioDeDadoValido,
  montarDigest,
  PARES_CANDIDATOS,
  PoliticaDeAgregacao,
  recomendar,
  type Recomendacao,
} from '@cosmaria/ia-domain';
import { PontoDeSerieRepository } from '../ports/ia.repositories';
import { AvaliarAlertasUseCase } from './alertas.use-cases';
import { GerarInsightsUseCase } from './insights.use-cases';

const validarDominio = (valor: string): DominioDeDado => {
  if (!ehDominioDeDadoValido(valor)) {
    throw new DominioDeDadoInvalidoError();
  }
  return valor;
};

/** `GET /v1/ia/recomendacoes` (doc 05 §6.4) — deriva recomendações dos insights relevantes. */
export class GerarRecomendacoesUseCase {
  constructor(private readonly insights: GerarInsightsUseCase) {}

  async executar(input: { usuarioId: string; dominio: string }): Promise<Recomendacao[]> {
    validarDominio(input.dominio);
    const insights = await this.insights.executar(input);
    return insights.map(recomendar);
  }
}

/**
 * `GET /v1/ia/digest` (doc 05 §6.6) — o conteúdo analítico do período: insights + alertas +
 * recomendações + disclaimer, com o estado de cold-start (doc 05 §8) sinalizado quando o
 * histórico próprio é insuficiente. Reúne as saídas dos outros motores num único documento.
 */
export class GerarDigestUseCase {
  constructor(
    private readonly repo: PontoDeSerieRepository,
    private readonly politica: PoliticaDeAgregacao,
    private readonly insightsUC: GerarInsightsUseCase,
    private readonly alertasUC: AvaliarAlertasUseCase,
  ) {}

  async executar(input: { usuarioId: string; dominio: string }): Promise<DigestAnalitico> {
    const dominio = validarDominio(input.dominio);

    const [insights, alertas, coldStart] = await Promise.all([
      this.insightsUC.executar(input),
      this.alertasUC.executar(input),
      this.avaliarColdStart(input.usuarioId, dominio),
    ]);

    return montarDigest({
      dominio,
      coldStart,
      insights,
      alertas,
      recomendacoes: insights.map(recomendar),
    });
  }

  /**
   * Cold-start: nenhum fator do domínio tem pontos suficientes para uma análise sequer
   * atingir o volume mínimo (doc 05 §8). Sinaliza "poucos dados ainda" em vez de silêncio.
   */
  private async avaliarColdStart(usuarioId: string, dominio: DominioDeDado): Promise<boolean> {
    const fatores = new Set(PARES_CANDIDATOS[dominio].flat());
    const volumeMinimo = this.politica.volumeMinimoProprio(dominio);
    const contagens = await Promise.all(
      [...fatores].map((f) => this.repo.contarPorFator(usuarioId, dominio, f)),
    );
    return Math.max(0, ...contagens) < volumeMinimo;
  }
}
