import type { CachePort } from '@cosmaria/core-application';

interface Entrada {
  valor: string;
  expiraEm: number | null;
}

/**
 * Cache em memória — mesma porta CachePort do adaptador Redis (LSP, doc 04 §4).
 * Usado em testes unitários e em dev local sem Redis, sem alterar nenhum caso de uso.
 */
export class InMemoryCacheAdapter implements CachePort {
  private readonly store = new Map<string, Entrada>();

  get(chave: string): Promise<string | null> {
    const entrada = this.store.get(chave);
    if (!entrada) {
      return Promise.resolve(null);
    }
    if (entrada.expiraEm !== null && entrada.expiraEm <= Date.now()) {
      this.store.delete(chave);
      return Promise.resolve(null);
    }
    return Promise.resolve(entrada.valor);
  }

  set(chave: string, valor: string, ttlSegundos?: number): Promise<void> {
    const expiraEm = ttlSegundos && ttlSegundos > 0 ? Date.now() + ttlSegundos * 1000 : null;
    this.store.set(chave, { valor, expiraEm });
    return Promise.resolve();
  }

  del(chave: string): Promise<void> {
    this.store.delete(chave);
    return Promise.resolve();
  }

  verificarConexao(): Promise<boolean> {
    return Promise.resolve(true);
  }

  fechar(): Promise<void> {
    this.store.clear();
    return Promise.resolve();
  }
}
