// @cosmaria/core-infrastructure — Adaptadores do Core (doc 14).
// ÚNICA camada autorizada a importar SDK externo (pg, bcrypt, jwt) — doc 13 §16.1.

export { CryptoIdGenerator } from './lib/adapters/crypto-id-generator';
export { BcryptPasswordHasher } from './lib/adapters/bcrypt-password-hasher';
export { JwtTokenService } from './lib/adapters/jwt-token-service';
export type { JwtConfig } from './lib/adapters/jwt-token-service';

export { criarPgPool } from './lib/persistence/pg-pool';
export { PostgresUsuarioRepository } from './lib/persistence/postgres-usuario.repository';
export { PostgresSessaoRepository } from './lib/persistence/postgres-sessao.repository';
export { InMemoryUsuarioRepository } from './lib/persistence/in-memory-usuario.repository';
export { InMemorySessaoRepository } from './lib/persistence/in-memory-sessao.repository';
export { PostgresConfiguracaoCompartilhamentoRepository } from './lib/persistence/postgres-configuracao-compartilhamento.repository';
export { InMemoryConfiguracaoCompartilhamentoRepository } from './lib/persistence/in-memory-configuracao-compartilhamento.repository';
export {
  PostgresConsentimentoRepository,
  PostgresTrilhaDeAuditoriaRepository,
  PostgresSolicitacaoExportacaoRepository,
} from './lib/persistence/postgres-lgpd.repositories';
export {
  InMemoryConsentimentoRepository,
  InMemoryTrilhaDeAuditoriaRepository,
  InMemorySolicitacaoExportacaoRepository,
} from './lib/persistence/in-memory-lgpd.repositories';

export { RedisCacheAdapter } from './lib/adapters/redis-cache.adapter';
export { InMemoryCacheAdapter } from './lib/adapters/in-memory-cache.adapter';

export { InProcessEventPublisher } from './lib/events/in-process-event-publisher';
export type { ManipuladorDeEvento } from './lib/events/in-process-event-publisher';
