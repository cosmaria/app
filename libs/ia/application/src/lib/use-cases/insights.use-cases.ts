import {
  calcularCorrelacao,
  DominioDeDado,
  DominioDeDadoInvalidoError,
  ehDominioDeDadoValido,
  ehRelevante,
  type Insight,
  montarInsight,
  PARES_CANDIDATOS,
  PoliticaDeAgregacao,
} from '@cosmaria/ia-domain';
import { PontoDeSerieRepository } from '../ports/ia.repositories';

/**
 * `GET /v1/ia/insights` (doc 05 §6.2/§6.5) — modelo de leitura.
 *
 * Varre os pares candidatos do domínio, calcula a correlação de cada um (histórico próprio,
 * volume mínimo da PoliticaDeAgregacao), mantém só os relevantes (Motor de Insights) e
 * enriquece cada um com o template de frase obrigatório (Motor de Explicabilidade — nenhuma
 * saída chega à tela sem passar por ele, doc 05 §14). Ordena do mais forte ao mais fraco.
 */
export class GerarInsightsUseCase {
  constructor(
    private readonly repo: PontoDeSerieRepository,
    private readonly politica: PoliticaDeAgregacao,
  ) {}

  async executar(input: { usuarioId: string; dominio: string }): Promise<Insight[]> {
    if (!ehDominioDeDadoValido(input.dominio)) {
      throw new DominioDeDadoInvalidoError();
    }
    const dominio = input.dominio as DominioDeDado;
    const volumeMinimo = this.politica.volumeMinimoProprio(dominio);

    const insights: Insight[] = [];
    for (const [fatorA, fatorB] of PARES_CANDIDATOS[dominio]) {
      const [serieA, serieB] = await Promise.all([
        this.repo.listarPorFator(input.usuarioId, dominio, fatorA),
        this.repo.listarPorFator(input.usuarioId, dominio, fatorB),
      ]);
      const resultado = calcularCorrelacao(fatorA, serieA, fatorB, serieB, volumeMinimo);
      if (resultado.suficiente && resultado.correlacao && ehRelevante(resultado.correlacao)) {
        insights.push(montarInsight(dominio, resultado.correlacao));
      }
    }
    return insights.sort((a, b) => Math.abs(b.forca) - Math.abs(a.forca));
  }
}
