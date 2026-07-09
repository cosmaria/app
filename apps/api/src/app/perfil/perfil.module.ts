import { Module, type Provider } from '@nestjs/common';
import type { Pool } from 'pg';
import {
  AtualizarPerfilPublicoUseCase,
  AutorizarVinculoDePerfisUseCase,
  EVENT_PUBLISHER,
  FEATURE_FLAGS,
  ID_GENERATOR,
  ListarVinculosDoUsuarioUseCase,
  ObterOuCriarPerfilPublicoUseCase,
  ObterPerfilPublicoUseCase,
  ObterPerfisVinculadosPublicamenteUseCase,
  PERFIL_PUBLICO_REPOSITORY,
  RevogarVinculoDePerfisUseCase,
  VINCULO_DE_PERFIS_REPOSITORY,
  type EventPublisher,
  type FeatureFlags,
  type IdGenerator,
  type PerfilPublicoRepository,
  type VinculoDePerfisRepository,
} from '@cosmaria/core-application';
import {
  CryptoIdGenerator,
  EnvFeatureFlags,
  InMemoryPerfilPublicoRepository,
  InMemoryVinculoDePerfisRepository,
  PostgresPerfilPublicoRepository,
  PostgresVinculoDePerfisRepository,
} from '@cosmaria/core-infrastructure';
import { PERFIL_PUBLIC_API, type PerfilPublicApi } from '@cosmaria/core-public-api';
import { PG_POOL } from '../infra/infra.tokens';
import { AuthModule } from '../auth/auth.module';
import { PerfilController } from './perfil.controller';
import { VinculoPerfisController } from './vinculo-perfis.controller';

/**
 * Composition root da Identidade Social (doc 06 / doc 14 §10).
 *
 * Exporta a PERFIL_PUBLIC_API — terceira interface pública do Core, ao lado de
 * AUTENTICACAO e PRIVACIDADE. É por ela (e só por ela) que Comunidade, Grow e Med
 * resolverão o Perfil Público de uma Conta num contexto, nas épicas seguintes.
 *
 * Reusa PG_POOL e EVENT_PUBLISHER globais; importa AuthModule pelo JwtAuthGuard.
 */
const providers: Provider[] = [
  { provide: ID_GENERATOR, useClass: CryptoIdGenerator },
  { provide: FEATURE_FLAGS, useClass: EnvFeatureFlags },
  {
    provide: PERFIL_PUBLICO_REPOSITORY,
    useFactory: (pool: Pool | null): PerfilPublicoRepository =>
      pool ? new PostgresPerfilPublicoRepository(pool) : new InMemoryPerfilPublicoRepository(),
    inject: [PG_POOL],
  },
  {
    provide: VINCULO_DE_PERFIS_REPOSITORY,
    useFactory: (pool: Pool | null): VinculoDePerfisRepository =>
      pool ? new PostgresVinculoDePerfisRepository(pool) : new InMemoryVinculoDePerfisRepository(),
    inject: [PG_POOL],
  },
  {
    provide: ObterOuCriarPerfilPublicoUseCase,
    useFactory: (repo: PerfilPublicoRepository, idGen: IdGenerator, eventos: EventPublisher) =>
      new ObterOuCriarPerfilPublicoUseCase(repo, idGen, eventos),
    inject: [PERFIL_PUBLICO_REPOSITORY, ID_GENERATOR, EVENT_PUBLISHER],
  },
  {
    provide: AtualizarPerfilPublicoUseCase,
    useFactory: (repo: PerfilPublicoRepository) => new AtualizarPerfilPublicoUseCase(repo),
    inject: [PERFIL_PUBLICO_REPOSITORY],
  },
  {
    provide: ObterPerfilPublicoUseCase,
    useFactory: (repo: PerfilPublicoRepository) => new ObterPerfilPublicoUseCase(repo),
    inject: [PERFIL_PUBLICO_REPOSITORY],
  },
  {
    provide: AutorizarVinculoDePerfisUseCase,
    useFactory: (
      vinculos: VinculoDePerfisRepository,
      perfis: PerfilPublicoRepository,
      idGen: IdGenerator,
      eventos: EventPublisher,
      flags: FeatureFlags,
    ) => new AutorizarVinculoDePerfisUseCase(vinculos, perfis, idGen, eventos, flags),
    inject: [
      VINCULO_DE_PERFIS_REPOSITORY,
      PERFIL_PUBLICO_REPOSITORY,
      ID_GENERATOR,
      EVENT_PUBLISHER,
      FEATURE_FLAGS,
    ],
  },
  {
    provide: RevogarVinculoDePerfisUseCase,
    useFactory: (
      vinculos: VinculoDePerfisRepository,
      eventos: EventPublisher,
      flags: FeatureFlags,
    ) => new RevogarVinculoDePerfisUseCase(vinculos, eventos, flags),
    inject: [VINCULO_DE_PERFIS_REPOSITORY, EVENT_PUBLISHER, FEATURE_FLAGS],
  },
  {
    provide: ListarVinculosDoUsuarioUseCase,
    useFactory: (vinculos: VinculoDePerfisRepository, flags: FeatureFlags) =>
      new ListarVinculosDoUsuarioUseCase(vinculos, flags),
    inject: [VINCULO_DE_PERFIS_REPOSITORY, FEATURE_FLAGS],
  },
  {
    provide: ObterPerfisVinculadosPublicamenteUseCase,
    useFactory: (
      vinculos: VinculoDePerfisRepository,
      perfis: PerfilPublicoRepository,
      flags: FeatureFlags,
    ) => new ObterPerfisVinculadosPublicamenteUseCase(vinculos, perfis, flags),
    inject: [VINCULO_DE_PERFIS_REPOSITORY, PERFIL_PUBLICO_REPOSITORY, FEATURE_FLAGS],
  },
  {
    provide: PERFIL_PUBLIC_API,
    useFactory: (
      obterOuCriar: ObterOuCriarPerfilPublicoUseCase,
      obterPorId: ObterPerfilPublicoUseCase,
      vinculados: ObterPerfisVinculadosPublicamenteUseCase,
    ): PerfilPublicApi => ({
      obterOuCriar: (usuarioId, contexto) => obterOuCriar.executar({ usuarioId, contexto }),
      obterPorId: (perfilId) => obterPorId.executar(perfilId),
      perfisVinculadosPublicamente: (perfilId) => vinculados.executar(perfilId),
    }),
    inject: [
      ObterOuCriarPerfilPublicoUseCase,
      ObterPerfilPublicoUseCase,
      ObterPerfisVinculadosPublicamenteUseCase,
    ],
  },
];

@Module({
  imports: [AuthModule],
  controllers: [PerfilController, VinculoPerfisController],
  providers,
  exports: [PERFIL_PUBLIC_API],
})
export class PerfilModule {}
