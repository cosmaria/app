import type { StartedRedisContainer } from '@testcontainers/redis';
import { RedisCacheAdapter } from '@cosmaria/core-infrastructure';
import { iniciarRedis } from './support/containers';

/**
 * Integração REAL do RedisCacheAdapter (porta CachePort) contra um Redis efêmero
 * (Testcontainers). Prova get/set/TTL/del e o liveness usado pelo health readiness.
 */
describe('RedisCacheAdapter (integração)', () => {
  let container: StartedRedisContainer;
  let cache: RedisCacheAdapter;

  beforeAll(async () => {
    container = await iniciarRedis();
    cache = new RedisCacheAdapter(container.getConnectionUrl());
  }, 180_000);

  afterAll(async () => {
    await cache?.fechar();
    await container?.stop();
  });

  it('verificarConexao() é true com o Redis de pé (liveness do readiness)', async () => {
    expect(await cache.verificarConexao()).toBe(true);
  });

  it('grava e lê um valor', async () => {
    await cache.set('chave:a', 'valor-a');
    expect(await cache.get('chave:a')).toBe('valor-a');
  });

  it('retorna null para chave inexistente', async () => {
    expect(await cache.get('chave:inexistente')).toBeNull();
  });

  it('respeita o TTL (expira após o tempo definido)', async () => {
    await cache.set('chave:ttl', 'efêmero', 1);
    expect(await cache.get('chave:ttl')).toBe('efêmero');
    await new Promise((r) => setTimeout(r, 1200));
    expect(await cache.get('chave:ttl')).toBeNull();
  });

  it('remove uma chave com del()', async () => {
    await cache.set('chave:del', 'x');
    await cache.del('chave:del');
    expect(await cache.get('chave:del')).toBeNull();
  });
});
