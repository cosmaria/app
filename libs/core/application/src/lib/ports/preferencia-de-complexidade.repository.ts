import type { PreferenciaDeComplexidade } from '@cosmaria/core-domain';

/** Uma linha por Usuário (Arquétipo D, doc 08 §12.1). Nunca duplicada por app. */
export interface PreferenciaDeComplexidadeRepository {
  salvar(preferencia: PreferenciaDeComplexidade): Promise<void>;
  buscarPorUsuario(usuarioId: string): Promise<PreferenciaDeComplexidade | null>;
}

export const PREFERENCIA_DE_COMPLEXIDADE_REPOSITORY = Symbol('PreferenciaDeComplexidadeRepository');
