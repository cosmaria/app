import {
  calcularCorrelacao,
  CorrelacaoCruzadaNaoHabilitadaError,
  DominioDeDado,
  Fator,
  FatorDesconhecidoError,
  PoliticaDeAgregacao,
  type ResultadoDeCorrelacao,
} from '@cosmaria/ia-domain';
import { JanelaTemporal, PontoDeSerieRepository } from '../ports/ia.repositories';
import type { VinculoGrowMedRepository } from '../ports/vinculo-grow-med.repository';

const FATORES = new Set<string>(Object.values(Fator));

const validarFator = (valor: string): Fator => {
  if (!FATORES.has(valor)) {
    throw new FatorDesconhecidoError(valor);
  }
  return valor as Fator;
};

export interface CalcularCorrelacaoCruzadaInput {
  usuarioId: string;
  fatorGrow: string;
  fatorMed: string;
  de?: Date;
  ate?: Date;
}

/**
 * `GET /v1/ia/correlacoes/cruzada` (doc 05 §6.1, doc 00 — integração Grow↔Med sempre opt-in).
 *
 * O payoff da arquitetura: correlaciona um fator do Grow (ex.: VPD do cultivo) com um fator
 * do Med (ex.: DOR), alinhados por dia, no histórico do PRÓPRIO usuário. Só roda com opt-in
 * explícito — o usuário precisa ter vinculado um produto do Med a um Lote do Grow (senão 403).
 * Abaixo do volume mínimo, não conclui nada (cold-start honesto, doc 05 §14).
 */
export class CalcularCorrelacaoCruzadaUseCase {
  constructor(
    private readonly repo: PontoDeSerieRepository,
    private readonly vinculos: VinculoGrowMedRepository,
    private readonly politica: PoliticaDeAgregacao,
  ) {}

  async executar(input: CalcularCorrelacaoCruzadaInput): Promise<ResultadoDeCorrelacao> {
    if (!(await this.vinculos.temVinculo(input.usuarioId))) {
      throw new CorrelacaoCruzadaNaoHabilitadaError();
    }
    const fatorGrow = validarFator(input.fatorGrow);
    const fatorMed = validarFator(input.fatorMed);
    const janela: JanelaTemporal = { de: input.de, ate: input.ate };

    const [serieGrow, serieMed] = await Promise.all([
      this.repo.listarPorFator(input.usuarioId, DominioDeDado.GROW, fatorGrow, janela),
      this.repo.listarPorFator(input.usuarioId, DominioDeDado.MED, fatorMed, janela),
    ]);

    // Volume mínimo do lado mais sensível (Med) — conservador para dado clínico.
    return calcularCorrelacao(
      fatorGrow,
      serieGrow,
      fatorMed,
      serieMed,
      this.politica.volumeMinimoProprio(DominioDeDado.MED),
    );
  }
}
