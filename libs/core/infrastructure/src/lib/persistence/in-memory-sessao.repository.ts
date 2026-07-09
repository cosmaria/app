import type { SessaoRepository } from '@cosmaria/core-application';
import { SessaoDeAutenticacao } from '@cosmaria/core-domain';

/** Repositório de sessões em memória — testes e desenvolvimento local sem banco. */
export class InMemorySessaoRepository implements SessaoRepository {
  private readonly porId = new Map<string, SessaoDeAutenticacao>();

  salvar(sessao: SessaoDeAutenticacao): Promise<void> {
    this.porId.set(sessao.id, sessao);
    return Promise.resolve();
  }

  buscarPorId(id: string): Promise<SessaoDeAutenticacao | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
}
