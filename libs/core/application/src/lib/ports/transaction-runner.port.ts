/**
 * Executor de transações (unit-of-work) — doc 04 §9 / doc 13 §16.1.
 *
 * Roda `fn` dentro de uma transação de banco: tudo que escrever ali (write de negócio E o
 * `enfileirar` do outbox feito no `publicar()`) se compromete junto (COMMIT) ou é desfeito
 * junto (ROLLBACK). É o que fecha a janela de perda write↔outbox da Fase A: nenhum evento é
 * publicado sem que o fato que o gerou tenha persistido, e vice-versa.
 *
 * A implementação Postgres (`PgUnitOfWork`) usa AsyncLocalStorage para rotear as queries dos
 * repositórios ao client da transação corrente, de forma transparente — repositórios e casos
 * de uso não mudam. Sem Postgres (dev/teste em memória), o `ImmediateTransactionRunner`
 * apenas executa `fn` (não há transação a coordenar).
 */
export interface TransactionRunner {
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}

export const TRANSACTION_RUNNER = Symbol('TransactionRunner');

/** Pass-through: executa `fn` sem transação. Usado quando não há Postgres (repos em memória). */
export class ImmediateTransactionRunner implements TransactionRunner {
  transaction<T>(fn: () => Promise<T>): Promise<T> {
    return fn();
  }
}
