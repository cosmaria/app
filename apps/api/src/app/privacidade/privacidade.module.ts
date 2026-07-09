import { Module, type Provider } from '@nestjs/common';
import type { Pool } from 'pg';
import {
  CONFIGURACAO_COMPARTILHAMENTO_REPOSITORY,
  DefinirCompartilhamentoUseCase,
  DimensoesVisiveisUseCase,
  EVENT_PUBLISHER,
  FiltrarConteudoUseCase,
  ID_GENERATOR,
  type ConfiguracaoDeCompartilhamentoRepository,
  type EventPublisher,
  type IdGenerator,
} from '@cosmaria/core-application';
import {
  CryptoIdGenerator,
  InMemoryConfiguracaoCompartilhamentoRepository,
  PostgresConfiguracaoCompartilhamentoRepository,
} from '@cosmaria/core-infrastructure';
import { PRIVACIDADE_PUBLIC_API, type PrivacidadePublicApi } from '@cosmaria/core-public-api';
import { PG_POOL } from '../infra/infra.tokens';

/**
 * Composition root do Motor de Privacidade (doc 04 §12 / doc 14 §10).
 * Sem controller: a superfície HTTP de privacidade pertence à Comunidade (doc 09
 * — `PUT /comunidade/publicacoes/{id}/privacidade`), que consumirá a
 * PRIVACIDADE_PUBLIC_API exportada aqui. Reusa o PG_POOL e o EVENT_PUBLISHER globais.
 */
const providers: Provider[] = [
  { provide: ID_GENERATOR, useClass: CryptoIdGenerator },
  {
    provide: CONFIGURACAO_COMPARTILHAMENTO_REPOSITORY,
    useFactory: (pool: Pool | null): ConfiguracaoDeCompartilhamentoRepository =>
      pool
        ? new PostgresConfiguracaoCompartilhamentoRepository(pool)
        : new InMemoryConfiguracaoCompartilhamentoRepository(),
    inject: [PG_POOL],
  },
  {
    provide: DefinirCompartilhamentoUseCase,
    useFactory: (
      repo: ConfiguracaoDeCompartilhamentoRepository,
      idGen: IdGenerator,
      eventos: EventPublisher,
    ) => new DefinirCompartilhamentoUseCase(repo, idGen, eventos),
    inject: [CONFIGURACAO_COMPARTILHAMENTO_REPOSITORY, ID_GENERATOR, EVENT_PUBLISHER],
  },
  {
    provide: FiltrarConteudoUseCase,
    useFactory: (repo: ConfiguracaoDeCompartilhamentoRepository) =>
      new FiltrarConteudoUseCase(repo),
    inject: [CONFIGURACAO_COMPARTILHAMENTO_REPOSITORY],
  },
  {
    provide: DimensoesVisiveisUseCase,
    useFactory: (repo: ConfiguracaoDeCompartilhamentoRepository) =>
      new DimensoesVisiveisUseCase(repo),
    inject: [CONFIGURACAO_COMPARTILHAMENTO_REPOSITORY],
  },
  {
    provide: PRIVACIDADE_PUBLIC_API,
    useFactory: (
      definir: DefinirCompartilhamentoUseCase,
      filtrar: FiltrarConteudoUseCase,
      dims: DimensoesVisiveisUseCase,
    ): PrivacidadePublicApi => ({
      definirCompartilhamento: (entrada) => definir.executar(entrada),
      filtrar: (ref, contexto, dados) => filtrar.executar({ ...ref, contexto, dados }),
      dimensoesVisiveis: (ref, contexto, dimensoes) =>
        dims.executar({ ...ref, contexto, dimensoes }),
    }),
    inject: [DefinirCompartilhamentoUseCase, FiltrarConteudoUseCase, DimensoesVisiveisUseCase],
  },
];

@Module({
  providers,
  exports: [PRIVACIDADE_PUBLIC_API],
})
export class PrivacidadeModule {}
