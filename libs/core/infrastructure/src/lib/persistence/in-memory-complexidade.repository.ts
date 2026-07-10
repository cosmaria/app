import type { PreferenciaDeComplexidadeRepository } from '@cosmaria/core-application';
import type { PreferenciaDeComplexidade } from '@cosmaria/core-domain';

/** Mesma porta do Postgres (LSP, doc 04 §4). Usado em testes e dev sem banco. */
export class InMemoryPreferenciaDeComplexidadeRepository implements PreferenciaDeComplexidadeRepository {
  private readonly porUsuario = new Map<string, PreferenciaDeComplexidade>();

  salvar(preferencia: PreferenciaDeComplexidade): Promise<void> {
    this.porUsuario.set(preferencia.usuarioId, preferencia);
    return Promise.resolve();
  }

  buscarPorUsuario(usuarioId: string): Promise<PreferenciaDeComplexidade | null> {
    return Promise.resolve(this.porUsuario.get(usuarioId) ?? null);
  }
}
