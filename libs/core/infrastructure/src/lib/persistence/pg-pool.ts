import { Pool } from 'pg';

/**
 * Cria o pool de conexões PostgreSQL a partir da DATABASE_URL.
 * Em dev, aponta para o container docker-compose; em prod, para o Cloud SQL
 * (doc 13 §10). É a ÚNICA porta de entrada ao banco — só a infraestrutura o usa.
 */
export function criarPgPool(databaseUrl: string): Pool {
  return new Pool({ connectionString: databaseUrl });
}
