import type { SolicitacaoDeExportacao } from '@cosmaria/core-domain';

export interface SolicitacaoExportacaoRepository {
  salvar(solicitacao: SolicitacaoDeExportacao): Promise<void>;
  buscarPorId(id: string): Promise<SolicitacaoDeExportacao | null>;
}

export const SOLICITACAO_EXPORTACAO_REPOSITORY = Symbol('SolicitacaoExportacaoRepository');
