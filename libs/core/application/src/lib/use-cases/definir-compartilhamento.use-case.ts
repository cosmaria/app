import {
  ConfiguracaoDeCompartilhamento,
  ConfiguracaoDeCompartilhamentoAlterada,
  type Escopo,
} from '@cosmaria/core-domain';
import { IdGenerator } from '../ports/id-generator.port';
import { EventPublisher } from '../ports/event-publisher.port';
import { ConfiguracaoDeCompartilhamentoRepository } from '../ports/configuracao-de-compartilhamento.repository';
import type { CompartilhamentoResumo } from './compartilhamento-resumo';

export interface DefinirCompartilhamentoInput {
  /** Autor autenticado — só ele pode configurar a privacidade do próprio conteúdo. */
  autorId: string;
  modulo: string;
  tipoConteudo: string;
  conteudoId: string;
  escopoPadrao?: Escopo;
  dimensoes?: { codigo: string; escopo: Escopo }[];
}

/**
 * Cria ou atualiza a ConfiguraçãoDeCompartilhamento de um conteúdo (doc 04 §12).
 * O conteúdo nasce privado; este caso de uso é como o autor abre dimensões.
 * Publica `ConfiguracaoDeCompartilhamentoAlterada` (auditoria — doc 08 §7).
 */
export class DefinirCompartilhamentoUseCase {
  constructor(
    private readonly repo: ConfiguracaoDeCompartilhamentoRepository,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: DefinirCompartilhamentoInput): Promise<CompartilhamentoResumo> {
    let config = await this.repo.buscarPorConteudo(
      input.modulo,
      input.tipoConteudo,
      input.conteudoId,
    );

    if (!config) {
      config = ConfiguracaoDeCompartilhamento.criar({
        id: this.idGen.gerar(),
        autorId: input.autorId,
        modulo: input.modulo,
        tipoConteudo: input.tipoConteudo,
        conteudoId: input.conteudoId,
      });
    } else {
      // Só o autor do conteúdo pode alterar sua privacidade.
      config.garantirAutoria(input.autorId);
    }

    if (input.escopoPadrao) {
      config.definirEscopoPadrao(input.escopoPadrao);
    }
    for (const dim of input.dimensoes ?? []) {
      config.definirDimensao(dim.codigo, dim.escopo);
    }

    await this.repo.salvar(config);
    await this.eventos.publicar(
      new ConfiguracaoDeCompartilhamentoAlterada(
        config.id,
        config.autorId,
        config.modulo,
        config.tipoConteudo,
        config.conteudoId,
      ),
    );

    return this.resumir(config);
  }

  private resumir(config: ConfiguracaoDeCompartilhamento): CompartilhamentoResumo {
    return {
      id: config.id,
      modulo: config.modulo,
      tipoConteudo: config.tipoConteudo,
      conteudoId: config.conteudoId,
      escopoPadrao: config.escopoPadrao,
      dimensoes: [...config.dimensoesConfiguradas()].map(([codigo, escopo]) => ({
        codigo,
        escopo,
      })),
    };
  }
}
