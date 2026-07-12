import type { Pool, PoolClient } from 'pg';
import { PgUnitOfWork } from './pg-unit-of-work';

/** Registra em qual conexão cada query rodou, para provar o roteamento pelo ALS. */
class FakeClient {
  liberado = false;
  constructor(
    private readonly registro: string[],
    private readonly nome: string,
  ) {}
  query(texto: string): Promise<{ rows: unknown[]; rowCount: number }> {
    this.registro.push(`${this.nome}:${texto}`);
    return Promise.resolve({ rows: [], rowCount: 0 });
  }
  release(): void {
    this.liberado = true;
  }
}

class FakePool {
  readonly registro: string[] = [];
  cliente: FakeClient | null = null;
  query(texto: string): Promise<{ rows: unknown[]; rowCount: number }> {
    this.registro.push(`pool:${texto}`);
    return Promise.resolve({ rows: [], rowCount: 0 });
  }
  connect(): Promise<FakeClient> {
    this.cliente = new FakeClient(this.registro, 'client');
    return Promise.resolve(this.cliente);
  }
}

const criar = (): { uow: PgUnitOfWork; fake: FakePool } => {
  const fake = new FakePool();
  const uow = new PgUnitOfWork(fake as unknown as Pool);
  return { uow, fake };
};

describe('PgUnitOfWork', () => {
  it('fora de transação, query vai ao pool (autocommit)', async () => {
    const { uow, fake } = criar();
    await uow.pool.query('SELECT 1');
    expect(fake.registro).toEqual(['pool:SELECT 1']);
  });

  it('dentro de transação, query dos repositórios vai ao client, entre BEGIN e COMMIT', async () => {
    const { uow, fake } = criar();
    await uow.transaction(async () => {
      await uow.pool.query('INSERT negocio');
      await uow.pool.query('INSERT outbox');
    });
    expect(fake.registro).toEqual([
      'client:BEGIN',
      'client:INSERT negocio',
      'client:INSERT outbox',
      'client:COMMIT',
    ]);
    expect(fake.cliente?.liberado).toBe(true);
  });

  it('erro no meio da transação faz ROLLBACK e libera o client (atomicidade)', async () => {
    const { uow, fake } = criar();
    await expect(
      uow.transaction(async () => {
        await uow.pool.query('INSERT negocio');
        throw new Error('falhou depois de escrever');
      }),
    ).rejects.toThrow('falhou depois de escrever');

    expect(fake.registro).toEqual(['client:BEGIN', 'client:INSERT negocio', 'client:ROLLBACK']);
    expect(fake.registro).not.toContain('client:COMMIT');
    expect(fake.cliente?.liberado).toBe(true);
  });

  it('o ALS não vaza: após a transação, query volta ao pool', async () => {
    const { uow, fake } = criar();
    await uow.transaction(async () => {
      await uow.pool.query('dentro');
    });
    await uow.pool.query('depois');
    expect(fake.registro).toContain('client:dentro');
    expect(fake.registro).toContain('pool:depois');
  });
});
