/**
 * Configuração de infraestrutura lida do ambiente (doc 15 §8).
 * Conexões de banco/cache — nunca commitadas com valores de produção; os defaults
 * abaixo apontam para o docker-compose local.
 */

/** Usa Postgres se AUTH_REPO=postgres; caso contrário, repositórios em memória. */
export function usarPostgres(): boolean {
  return process.env.AUTH_REPO === 'postgres';
}

export function databaseUrl(): string {
  return process.env.DATABASE_URL ?? 'postgresql://cosmaria:cosmaria_dev@localhost:5432/cosmaria';
}

/**
 * Usa Redis se REDIS_URL estiver definida OU CACHE=redis; caso contrário, cache
 * em memória (dev/local/testes unitários sem Redis).
 */
export function usarRedis(): boolean {
  return process.env.CACHE === 'redis' || !!process.env.REDIS_URL;
}

export function redisUrl(): string {
  return process.env.REDIS_URL ?? 'redis://localhost:6379';
}
