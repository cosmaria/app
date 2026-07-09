import { type ContextoDeVisualizacao, MotorDePrivacidade } from '@cosmaria/core-domain';
import { ConfiguracaoDeCompartilhamentoRepository } from '../ports/configuracao-de-compartilhamento.repository';

export interface DimensoesVisiveisInput {
  modulo: string;
  tipoConteudo: string;
  conteudoId: string;
  contexto: ContextoDeVisualizacao;
  /** Dimensões candidatas do conteúdo (ex.: as que o feed/busca considerariam mostrar). */
  dimensoes: string[];
}

/**
 * Diz QUAIS dimensões de um conteúdo o visualizador pode ver, sem expor os dados —
 * usado por feed/busca antes de decidir o que carregar (doc 02 §9.1).
 */
export class DimensoesVisiveisUseCase {
  constructor(private readonly repo: ConfiguracaoDeCompartilhamentoRepository) {}

  async executar(input: DimensoesVisiveisInput): Promise<string[]> {
    const config = await this.repo.buscarPorConteudo(
      input.modulo,
      input.tipoConteudo,
      input.conteudoId,
    );

    if (!config) {
      return input.contexto.ehAutor ? [...input.dimensoes] : [];
    }

    return MotorDePrivacidade.dimensoesVisiveis(config, input.contexto, input.dimensoes);
  }
}
