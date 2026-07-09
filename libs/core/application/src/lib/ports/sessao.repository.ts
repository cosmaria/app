import { SessaoDeAutenticacao } from '@cosmaria/core-domain';

/**
 * Porta de persistência de SessaoDeAutenticacao (refresh tokens).
 * `salvar` faz upsert (cria na emissão, atualiza na revogação).
 */
export interface SessaoRepository {
  salvar(sessao: SessaoDeAutenticacao): Promise<void>;
  buscarPorId(id: string): Promise<SessaoDeAutenticacao | null>;
}

export const SESSAO_REPOSITORY = Symbol('SessaoRepository');
