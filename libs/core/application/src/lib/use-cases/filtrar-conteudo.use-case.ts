import { type ContextoDeVisualizacao, MotorDePrivacidade } from '@cosmaria/core-domain';
import { ConfiguracaoDeCompartilhamentoRepository } from '../ports/configuracao-de-compartilhamento.repository';

export interface FiltrarConteudoInput {
  modulo: string;
  tipoConteudo: string;
  conteudoId: string;
  contexto: ContextoDeVisualizacao;
  /** Conteúdo por dimensão (código da dimensão → valor). */
  dados: Record<string, unknown>;
}

/**
 * Aplica o Motor de Privacidade a um conteúdo, devolvendo só as dimensões que o
 * visualizador pode ver (doc 04 §12 / doc 02 §9.1). Sem configuração, o conteúdo
 * é privado: apenas o autor vê algo.
 */
export class FiltrarConteudoUseCase {
  constructor(private readonly repo: ConfiguracaoDeCompartilhamentoRepository) {}

  async executar(input: FiltrarConteudoInput): Promise<Record<string, unknown>> {
    const config = await this.repo.buscarPorConteudo(
      input.modulo,
      input.tipoConteudo,
      input.conteudoId,
    );

    if (!config) {
      // Nasce privado: sem configuração, nada é público — só o autor vê.
      return input.contexto.ehAutor ? { ...input.dados } : {};
    }

    return MotorDePrivacidade.filtrar(config, input.contexto, input.dados);
  }
}
