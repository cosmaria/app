import { AsyncLocalStorage } from 'node:async_hooks';
import type { Pool, PoolClient } from 'pg';
import type { TransactionRunner } from '@cosmaria/core-application';

/**
 * Unit-of-work Postgres (doc 04 §9 / doc 13 §16.1) — o que fecha a janela de perda write↔outbox.
 *
 * É dono de um `Pool` cujo `query` é roteado por `AsyncLocalStorage`: dentro de uma
 * `transaction(...)` há um `PoolClient` no ALS, e toda query dos repositórios (inclusive o
 * `enfileirar` do outbox feito no `publicar()`) vai para ESSE client — logo, para a mesma
 * transação. Fora de transação (dispatcher, jobs, GETs), cai no pool em autocommit, como antes.
 *
 * O roteamento é um monkey-patch CONTIDO em `pool.query`, com o tipo público preservado
 * (`as typeof pool.query`): repositórios continuam vendo um `Pool` normal e não mudam nada.
 * `connect()`/`end()` permanecem os do pool real (usados aqui e pelo lifecycle).
 */
export class PgUnitOfWork implements TransactionRunner {
  private readonly als = new AsyncLocalStorage<PoolClient>();
  readonly pool: Pool;

  /** Recebe o `Pool` (criado por `criarPgPool`) e o torna transaction-aware in-place. */
  constructor(pool: Pool) {
    const queryOriginal = pool.query.bind(pool);
    // Roteia cada query ao client da transação corrente (ALS) quando houver; senão ao pool.
    pool.query = ((...args: unknown[]) => {
      const client = this.als.getStore();
      return (client ? client.query.bind(client) : queryOriginal)(
        ...(args as Parameters<typeof queryOriginal>),
      );
    }) as typeof pool.query;
    this.pool = pool;
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    return this.als.run(client, async () => {
      try {
        await client.query('BEGIN');
        const resultado = await fn();
        await client.query('COMMIT');
        return resultado;
      } catch (erro) {
        await client.query('ROLLBACK');
        throw erro;
      } finally {
        client.release();
      }
    });
  }

  end(): Promise<void> {
    return this.pool.end();
  }
}
