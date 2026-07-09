import type { UsuarioRepository } from '@cosmaria/core-application';
import { Email, Usuario } from '@cosmaria/core-domain';

/**
 * Repositório em memória — usado em testes e no desenvolvimento local sem banco.
 * Implementa exatamente a mesma porta do repositório Postgres (LSP, doc 04 §4),
 * o que permite rodar os testes e2e sem depender do PostgreSQL.
 */
export class InMemoryUsuarioRepository implements UsuarioRepository {
  private readonly porId = new Map<string, Usuario>();

  salvar(usuario: Usuario): Promise<void> {
    this.porId.set(usuario.id, usuario);
    return Promise.resolve();
  }

  buscarPorEmail(email: Email): Promise<Usuario | null> {
    for (const u of this.porId.values()) {
      if (u.email.equals(email)) {
        return Promise.resolve(u);
      }
    }
    return Promise.resolve(null);
  }

  buscarPorId(id: string): Promise<Usuario | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }

  async existeComEmail(email: Email): Promise<boolean> {
    return (await this.buscarPorEmail(email)) !== null;
  }
}
