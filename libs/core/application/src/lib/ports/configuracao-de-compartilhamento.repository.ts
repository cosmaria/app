import type { ConfiguracaoDeCompartilhamento } from '@cosmaria/core-domain';

/**
 * Porta de persistência da ConfiguraçãoDeCompartilhamento (Motor de Privacidade).
 * `salvar` faz upsert (cria na primeira configuração, atualiza nas seguintes).
 */
export interface ConfiguracaoDeCompartilhamentoRepository {
  salvar(config: ConfiguracaoDeCompartilhamento): Promise<void>;
  buscarPorConteudo(
    modulo: string,
    tipoConteudo: string,
    conteudoId: string,
  ): Promise<ConfiguracaoDeCompartilhamento | null>;
}

export const CONFIGURACAO_COMPARTILHAMENTO_REPOSITORY = Symbol(
  'ConfiguracaoDeCompartilhamentoRepository',
);
