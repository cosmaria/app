import type { JanelaTemporal, PontoDeSerieRepository } from '@cosmaria/ia-application';
import type { DominioDeDado, Fator, PontoDeSerie } from '@cosmaria/ia-domain';

/** Série temporal da IA em memória — mesma porta do Postgres (LSP, doc 04 §4). */
export class InMemoryPontoDeSerieRepository implements PontoDeSerieRepository {
  private readonly pontos: PontoDeSerie[] = [];

  salvarVarios(pontos: PontoDeSerie[]): Promise<void> {
    this.pontos.push(...pontos);
    return Promise.resolve();
  }

  listarPorFator(
    usuarioId: string,
    dominio: DominioDeDado,
    fator: Fator,
    janela?: JanelaTemporal,
  ): Promise<PontoDeSerie[]> {
    const itens = this.pontos
      .filter((p) => p.usuarioId === usuarioId && p.dominio === dominio && p.fator === fator)
      .filter((p) => !janela?.de || p.ocorridoEm >= janela.de)
      .filter((p) => !janela?.ate || p.ocorridoEm <= janela.ate)
      .sort((a, b) => a.ocorridoEm.getTime() - b.ocorridoEm.getTime());
    return Promise.resolve(itens);
  }

  contarPorFator(usuarioId: string, dominio: DominioDeDado, fator: Fator): Promise<number> {
    return Promise.resolve(
      this.pontos.filter(
        (p) => p.usuarioId === usuarioId && p.dominio === dominio && p.fator === fator,
      ).length,
    );
  }

  ultimoPorFator(
    usuarioId: string,
    dominio: DominioDeDado,
    fator: Fator,
  ): Promise<PontoDeSerie | null> {
    const doFator = this.pontos
      .filter((p) => p.usuarioId === usuarioId && p.dominio === dominio && p.fator === fator)
      .sort((a, b) => a.ocorridoEm.getTime() - b.ocorridoEm.getTime());
    return Promise.resolve(doFator.length > 0 ? doFator[doFator.length - 1] : null);
  }
}
