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

  /**
   * Checa e grava **sem nenhum `await` no meio**: qualquer `await` cederia o controle e
   * deixaria duas chamadas concorrentes lerem "ausente" antes de qualquer escrita —
   * ambas se achariam a primeira, e a idempotência do webhook cairia por terra.
   * O Redis resolve o mesmo problema com `SET NX`.
   */
  setSeAusente(chave: string, valor: string, ttlSegundos: number): Promise<boolean> {
    const entrada = this.store.get(chave);
    const viva =
      entrada !== undefined && (entrada.expiraEm === null || entrada.expiraEm > Date.now());
    if (viva) {
      return Promise.resolve(false);
    }
    const expiraEm = ttlSegundos > 0 ? Date.now() + ttlSegundos * 1000 : null;
    this.store.set(chave, { valor, expiraEm });
    return Promise.resolve(true);
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
