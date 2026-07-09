/**
 * Tokens de injeção da infraestrutura compartilhada (pool Postgres).
 * Ficam num arquivo próprio para que o PersistenceModule (que os provê) e os
 * consumidores (Auth, Health) importem o MESMO símbolo, sem dependência circular.
 */
export const PG_POOL = Symbol('PgPool');
