import { Redis } from 'ioredis';
import type { CachePort } from '@cosmaria/core-application';

/**
 * Adaptador de cache sobre Redis (ioredis) — implementa a porta CachePort.
 * ÚNICA camada autorizada a importar o SDK do Redis (doc 13 §16.1). Em dev,
 * aponta para o container docker-compose; em prod, para o Memorystore (doc 13 §10).
 */
export class RedisCacheAdapter implements CachePort {
  private readonly client: Redis;

  constructor(redisUrl: string) {
    this.client = new Redis(redisUrl, {
      // Não deixa comandos travarem indefinidamente se o Redis cair.
      maxRetriesPerRequest: 2,
      connectTimeout: 2000,
      // Backoff limitado — não fica tentando reconectar para sempre em silêncio.
      retryStrategy: (tentativas) => (tentativas > 5 ? null : Math.min(tentativas * 200, 1000)),
    });
    // Sem este handler, erros de conexão do ioredis viram unhandled e poluem o log.
    this.client.on('error', () => {
      /* estado real é refletido por verificarConexao(); não derruba a app */
    });
  }

  async get(chave: string): Promise<string | null> {
    return this.client.get(chave);
  }

  async set(chave: string, valor: string, ttlSegundos?: number): Promise<void> {
    if (ttlSegundos && ttlSegundos > 0) {
      await this.client.set(chave, valor, 'EX', ttlSegundos);
    } else {
      await this.client.set(chave, valor);
    }
  }

  /** `SET chave valor NX EX ttl` — retorna 'OK' só quando a chave não existia. */
  async setSeAusente(chave: string, valor: string, ttlSegundos: number): Promise<boolean> {
    const resultado = await this.client.set(chave, valor, 'EX', ttlSegundos, 'NX');
    return resultado === 'OK';
  }

  async del(chave: string): Promise<void> {
    await this.client.del(chave);
  }

  async verificarConexao(): Promise<boolean> {
    // Race contra timeout: garante resposta rápida mesmo se o Redis estiver fora.
    const timeout = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 1500));
    const ping = this.client
      .ping()
      .then((r) => r === 'PONG')
      .catch(() => false);
    return Promise.race([ping, timeout]);
  }

  /** Encerra a conexão — chamado no shutdown da aplicação (doc 09, stateless). */
  async fechar(): Promise<void> {
    try {
      await this.client.quit();
    } catch {
      this.client.disconnect();
    }
  }
}
