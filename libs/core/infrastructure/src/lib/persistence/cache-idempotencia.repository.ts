import type { CachePort, RegistroDeIdempotenciaRepository } from '@cosmaria/core-application';

/**
 * `RegistroDeIdempotencia` sobre o cache já existente (doc 08 — Arquétipo B com
 * expiração). Reusa o `CachePort`: em produção é o Redis, em teste o adaptador em
 * memória — nenhum dos dois é conhecido por este arquivo.
 *
 * Não é uma tabela por decisão: a entidade é declaradamente de vida curta (doc 09 §9),
 * e uma tabela exigiria um job de expurgo só para não crescer para sempre.
 */
export class CacheRegistroDeIdempotenciaRepository implements RegistroDeIdempotenciaRepository {
  constructor(private readonly cache: CachePort) {}

  registrarSeNova(chave: string, ttlSegundos: number): Promise<boolean> {
    return this.cache.setSeAusente(`idempotencia:${chave}`, '1', ttlSegundos);
  }
}
