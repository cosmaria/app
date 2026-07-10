import { Module, type Provider } from '@nestjs/common';
import type { Pool } from 'pg';
import {
  AtualizarPreferenciaDeComplexidadeUseCase,
  FiltrarCamposPorComplexidadeUseCase,
  ID_GENERATOR,
  type IdGenerator,
  ObterPreferenciaDeComplexidadeUseCase,
  PREFERENCIA_DE_COMPLEXIDADE_REPOSITORY,
  type PreferenciaDeComplexidadeRepository,
  ResolverPreferenciaDeComplexidadeService,
} from '@cosmaria/core-application';
import {
  CryptoIdGenerator,
  InMemoryPreferenciaDeComplexidadeRepository,
  PostgresPreferenciaDeComplexidadeRepository,
} from '@cosmaria/core-infrastructure';
import { COMPLEXIDADE_PUBLIC_API, type ComplexidadePublicApi } from '@cosmaria/core-public-api';
import { PG_POOL } from '../infra/infra.tokens';
import { AuthModule } from '../auth/auth.module';
import { ComplexidadeController } from './complexidade.controller';

/**
 * Composition root da Complexidade Progressiva (doc 02 §5.0/§6 / doc 14 §10).
 *
 * Exporta a COMPLEXIDADE_PUBLIC_API — sexta interface pública do Core. Grow e Med
 * declaram o nível de cada campo e perguntam aqui o que exibir; nenhum dos dois guarda
 * a própria preferência nem reimplementa o corte por nível.
 */
const providers: Provider[] = [
  { provide: ID_GENERATOR, useClass: CryptoIdGenerator },
  {
    provide: PREFERENCIA_DE_COMPLEXIDADE_REPOSITORY,
    useFactory: (pool: Pool | null): PreferenciaDeComplexidadeRepository =>
      pool
        ? new PostgresPreferenciaDeComplexidadeRepository(pool)
        : new InMemoryPreferenciaDeComplexidadeRepository(),
    inject: [PG_POOL],
  },
  {
    provide: ResolverPreferenciaDeComplexidadeService,
    useFactory: (repo: PreferenciaDeComplexidadeRepository, idGen: IdGenerator) =>
      new ResolverPreferenciaDeComplexidadeService(repo, idGen),
    inject: [PREFERENCIA_DE_COMPLEXIDADE_REPOSITORY, ID_GENERATOR],
  },
  {
    provide: ObterPreferenciaDeComplexidadeUseCase,
    useFactory: (resolver: ResolverPreferenciaDeComplexidadeService) =>
      new ObterPreferenciaDeComplexidadeUseCase(resolver),
    inject: [ResolverPreferenciaDeComplexidadeService],
  },
  {
    provide: AtualizarPreferenciaDeComplexidadeUseCase,
    useFactory: (
      resolver: ResolverPreferenciaDeComplexidadeService,
      repo: PreferenciaDeComplexidadeRepository,
    ) => new AtualizarPreferenciaDeComplexidadeUseCase(resolver, repo),
    inject: [ResolverPreferenciaDeComplexidadeService, PREFERENCIA_DE_COMPLEXIDADE_REPOSITORY],
  },
  {
    provide: FiltrarCamposPorComplexidadeUseCase,
    useFactory: (resolver: ResolverPreferenciaDeComplexidadeService) =>
      new FiltrarCamposPorComplexidadeUseCase(resolver),
    inject: [ResolverPreferenciaDeComplexidadeService],
  },
  {
    provide: COMPLEXIDADE_PUBLIC_API,
    useFactory: (
      obter: ObterPreferenciaDeComplexidadeUseCase,
      filtrar: FiltrarCamposPorComplexidadeUseCase,
    ): ComplexidadePublicApi => ({
      obterPreferencia: (usuarioId) => obter.executar(usuarioId),
      filtrarCampos: (usuarioId, campos) => filtrar.executar(usuarioId, campos),
    }),
    inject: [ObterPreferenciaDeComplexidadeUseCase, FiltrarCamposPorComplexidadeUseCase],
  },
];

@Module({
  imports: [AuthModule],
  controllers: [ComplexidadeController],
  providers,
  exports: [COMPLEXIDADE_PUBLIC_API],
})
export class ComplexidadeModule {}
