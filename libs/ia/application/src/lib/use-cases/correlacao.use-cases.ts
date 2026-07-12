import {
  calcularCorrelacao,
  DominioDeDado,
  DominioDeDadoInvalidoError,
  ehDominioDeDadoValido,
  Fator,
  FatorDesconhecidoError,
  PoliticaDeAgregacao,
  type ResultadoDeCorrelacao,
} from '@cosmaria/ia-domain';
import { JanelaTemporal, PontoDeSerieRepository } from '../ports/ia.repositories';

const FATORES = new Set<string>(Object.values(Fator));

const validarFator = (valor: string): Fator => {
  if (!FATORES.has(valor)) {
    throw new FatorDesconhecidoError(valor);
  }
  return valor as Fator;
};

const validarDominio = (valor: string): DominioDeDado => {
  if (!ehDominioDeDadoValido(valor)) {
    throw new DominioDeDadoInvalidoError();
  }
  return valor;
};

export interface CalcularCorrelacaoInput {
  usuarioId: string;
  dominio: string;
  fatorA: string;
  fatorB: string;
  de?: Date;
  ate?: Date;
}

/**
 * `GET /v1/ia/correlacoes` (doc 05 §6.1) — modelo de leitura.
 *
 * Lê as duas séries do histórico próprio do usuário e calcula a correlação, respeitando o
 * volume mínimo da `PoliticaDeAgregacao` (nunca conclui abaixo dele — doc 05 §14). Sempre
 * histórico próprio (princípio permanente §4); o agregado anonimizado de cold-start é épica
 * posterior. O resultado ainda passará pelo Motor de Explicabilidade (IA-2) antes da tela.
 */
export class CalcularCorrelacaoUseCase {
  constructor(
    private readonly repo: PontoDeSerieRepository,
    private readonly politica: PoliticaDeAgregacao,
  ) {}

  async executar(input: CalcularCorrelacaoInput): Promise<ResultadoDeCorrelacao> {
    const dominio = validarDominio(input.dominio);
    const fatorA = validarFator(input.fatorA);
    const fatorB = validarFator(input.fatorB);
    const janela: JanelaTemporal = { de: input.de, ate: input.ate };

    const [serieA, serieB] = await Promise.all([
      this.repo.listarPorFator(input.usuarioId, dominio, fatorA, janela),
      this.repo.listarPorFator(input.usuarioId, dominio, fatorB, janela),
    ]);

    return calcularCorrelacao(
      fatorA,
      serieA,
      fatorB,
      serieB,
      this.politica.volumeMinimoProprio(dominio),
    );
  }
}
