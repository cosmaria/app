import type { Midia } from '@cosmaria/core-domain';

export interface MidiaRepository {
  salvar(midia: Midia): Promise<void>;
  buscarPorId(id: string): Promise<Midia | null>;
  /** Mídias anexadas a uma entidade de qualquer módulo (referência polimórfica). */
  listarPorEntidade(modulo: string, tipoEntidade: string, entidadeId: string): Promise<Midia[]>;
  remover(id: string): Promise<void>;
}

export const MIDIA_REPOSITORY = Symbol('MidiaRepository');
