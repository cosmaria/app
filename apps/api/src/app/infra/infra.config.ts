/**
 * Configuração de infraestrutura lida do ambiente (doc 15 §8).
 * Conexões de banco/cache — nunca commitadas com valores de produção; os defaults
 * abaixo apontam para o docker-compose local.
 */

/**
 * Em teste, o `.env` do desenvolvedor NÃO é carregado.
 *
 * Sem isso, uma suíte que se declara "em memória" acabava usando o Postgres/Redis reais
 * do docker-compose só porque `DATABASE_URL`/`REDIS_URL` existiam no `.env` — e um teste
 * passava ou falhava conforme o estado deixado por execuções anteriores (foi assim que
 * uma chave de idempotência sobrevivente quebrou o e2e do webhook). Os testes que
 * precisam de serviços reais (integração) definem as variáveis explicitamente.
 */
export function ehAmbienteDeTeste(): boolean {
  return process.env.NODE_ENV === 'test';
}

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

/**
 * Segredo compartilhado com o gateway de pagamento, usado para verificar a assinatura
 * HMAC do webhook (doc 09 §7). Deliberadamente **sem valor padrão**: um default
 * silencioso deixaria uma instalação mal configurada aceitando payload forjado. Vazio
 * faz o adaptador rejeitar toda requisição — que é o comportamento seguro.
 */
export function segredoWebhookPagamento(): string {
  return process.env.PAGAMENTO_WEBHOOK_SECRET ?? '';
}
