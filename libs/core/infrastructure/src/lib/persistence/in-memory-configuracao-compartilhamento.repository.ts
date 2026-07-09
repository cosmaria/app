import type { ConfiguracaoDeCompartilhamentoRepository } from '@cosmaria/core-application';
import type { ConfiguracaoDeCompartilhamento } from '@cosmaria/core-domain';

/**
 * Repositório em memória da ConfiguraçãoDeCompartilhamento — mesma porta do Postgres
 * (LSP, doc 04 §4). Usado em testes e dev local sem banco. Chave = conteúdo único.
 */
export class InMemoryConfiguracaoCompartilhamentoRepository implements ConfiguracaoDeCompartilhamentoRepository {
  private readonly porChave = new Map<string, ConfiguracaoDeCompartilhamento>();

  private chave(modulo: string, tipoConteudo: string, conteudoId: string): string {
    return `${modulo}:${tipoConteudo}:${conteudoId}`;
  }

  salvar(config: ConfiguracaoDeCompartilhamento): Promise<void> {
    this.porChave.set(this.chave(config.modulo, config.tipoConteudo, config.conteudoId), config);
    return Promise.resolve();
  }

  buscarPorConteudo(
    modulo: string,
    tipoConteudo: string,
    conteudoId: string,
  ): Promise<ConfiguracaoDeCompartilhamento | null> {
    return Promise.resolve(this.porChave.get(this.chave(modulo, tipoConteudo, conteudoId)) ?? null);
  }
}
