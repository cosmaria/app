import { Module, type Provider } from '@nestjs/common';
import type { Pool } from 'pg';
import {
  ARMAZENAMENTO_DE_OBJETOS,
  type ArmazenamentoDeObjetos,
  type IdGenerator,
  ID_GENERATOR,
  ListarMidiaDaEntidadeUseCase,
  MIDIA_REPOSITORY,
  type MidiaRepository,
  ObterUrlDeMidiaUseCase,
  RegistrarMidiaUseCase,
  RemoverMidiaUseCase,
  VerificarLimiteUseCase,
} from '@cosmaria/core-application';
import {
  ArmazenamentoLocalDeObjetos,
  CryptoIdGenerator,
  InMemoryMidiaRepository,
  PostgresMidiaRepository,
} from '@cosmaria/core-infrastructure';
import { MIDIA_PUBLIC_API, type MidiaPublicApi } from '@cosmaria/core-public-api';
import { PG_POOL } from '../infra/infra.tokens';
import { diretorioDeMidia, segredoUrlDeMidia, urlBaseDeMidia } from '../infra/infra.config';
import { AuthModule } from '../auth/auth.module';
import { BillingModule } from '../billing/billing.module';
import { ArquivoAssinadoController, MidiaController } from './midia.controller';

/**
 * Composition root do Armazenamento de Mídia (doc 04 §16 / doc 14 §10).
 *
 * Exporta a MIDIA_PUBLIC_API — quinta interface pública do Core. Grow (fotos de Planta)
 * e Med (exames) usarão a MESMA capacidade, sem duplicar lógica de upload nem de limite.
 *
 * Importa o BillingModule para reusar o `VerificarLimiteUseCase`: o tamanho máximo de
 * arquivo é um `LimiteDePlano` configurável como qualquer outro (doc 07 §8), e barrar
 * aqui já publica `LimitePremiumAtingido`, que dispara paywall e notificação.
 */
const providers: Provider[] = [
  { provide: ID_GENERATOR, useClass: CryptoIdGenerator },
  {
    provide: ARMAZENAMENTO_DE_OBJETOS,
    useFactory: (): ArmazenamentoDeObjetos =>
      new ArmazenamentoLocalDeObjetos(diretorioDeMidia(), segredoUrlDeMidia(), urlBaseDeMidia()),
  },
  {
    provide: MIDIA_REPOSITORY,
    useFactory: (pool: Pool | null): MidiaRepository =>
      pool ? new PostgresMidiaRepository(pool) : new InMemoryMidiaRepository(),
    inject: [PG_POOL],
  },
  {
    provide: RegistrarMidiaUseCase,
    useFactory: (
      repo: MidiaRepository,
      armazenamento: ArmazenamentoDeObjetos,
      verificarLimite: VerificarLimiteUseCase,
      idGen: IdGenerator,
    ) => new RegistrarMidiaUseCase(repo, armazenamento, verificarLimite, idGen),
    inject: [MIDIA_REPOSITORY, ARMAZENAMENTO_DE_OBJETOS, VerificarLimiteUseCase, ID_GENERATOR],
  },
  {
    provide: ObterUrlDeMidiaUseCase,
    useFactory: (repo: MidiaRepository, armazenamento: ArmazenamentoDeObjetos) =>
      new ObterUrlDeMidiaUseCase(repo, armazenamento),
    inject: [MIDIA_REPOSITORY, ARMAZENAMENTO_DE_OBJETOS],
  },
  {
    provide: ListarMidiaDaEntidadeUseCase,
    useFactory: (repo: MidiaRepository) => new ListarMidiaDaEntidadeUseCase(repo),
    inject: [MIDIA_REPOSITORY],
  },
  {
    provide: RemoverMidiaUseCase,
    useFactory: (repo: MidiaRepository, armazenamento: ArmazenamentoDeObjetos) =>
      new RemoverMidiaUseCase(repo, armazenamento),
    inject: [MIDIA_REPOSITORY, ARMAZENAMENTO_DE_OBJETOS],
  },
  {
    provide: MIDIA_PUBLIC_API,
    useFactory: (
      listar: ListarMidiaDaEntidadeUseCase,
      obterUrl: ObterUrlDeMidiaUseCase,
    ): MidiaPublicApi => ({
      listarDaEntidade: (usuarioId, modulo, tipoEntidade, entidadeId) =>
        listar.executar({ usuarioId, modulo, tipoEntidade, entidadeId }),
      obterUrl: (usuarioId, midiaId) => obterUrl.executar({ usuarioId, midiaId }),
    }),
    inject: [ListarMidiaDaEntidadeUseCase, ObterUrlDeMidiaUseCase],
  },
];

@Module({
  imports: [AuthModule, BillingModule],
  controllers: [MidiaController, ArquivoAssinadoController],
  providers,
  exports: [MIDIA_PUBLIC_API],
})
export class MidiaModule {}
