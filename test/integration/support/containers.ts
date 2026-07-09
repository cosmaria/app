// Suporte aos testes de INTEGRAÇÃO (Sprint de Infraestrutura, 2026-07-09).
// Decisão validada: Testcontainers — Postgres/Redis EFÊMEROS por rodada, com as
// migrations reais aplicadas. Isolamento total, sem depender do compose de dev.
// NÃO é um arquivo de teste (não casa com *.spec.ts) — é helper importado por specs.
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { RedisContainer, type StartedRedisContainer } from '@testcontainers/redis';
import runner from 'node-pg-migrate';
import { resolve } from 'node:path';

/** Sobe um PostgreSQL efêmero (mesma imagem do compose/prod-like). */
export function iniciarPostgres(): Promise<StartedPostgreSqlContainer> {
  return new PostgreSqlContainer('postgres:16-alpine').start();
}

/** Sobe um Redis efêmero (mesma imagem do compose). */
export function iniciarRedis(): Promise<StartedRedisContainer> {
  return new RedisContainer('redis:7-alpine').start();
}

/**
 * Aplica TODAS as migrations reais (as mesmas do `db:migrate`) contra a URL dada.
 * Prova que a migration versionada cria o schema `core` corretamente — não um
 * DDL paralelo só para teste.
 */
export async function aplicarMigrations(databaseUrl: string): Promise<void> {
  await runner({
    databaseUrl,
    dir: resolve(process.cwd(), 'migrations'),
    direction: 'up',
    migrationsTable: 'pgmigrations',
    count: Number.POSITIVE_INFINITY,
    log: () => undefined, // silencia o log verboso das migrations no output do teste
  });
}
