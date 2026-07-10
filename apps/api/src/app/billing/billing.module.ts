import { Module, type Provider } from '@nestjs/common';
import type { Pool } from 'pg';
import {
  AplicarCupomUseCase,
  ASSINATURA_REPOSITORY,
  CACHE_PORT,
  CancelarAssinaturaUseCase,
  CATALOGO_DE_COBRANCA_REPOSITORY,
  ConsultarLimitesUseCase,
  CUPOM_REPOSITORY,
  EVENT_PUBLISHER,
  ID_GENERATOR,
  IniciarUpgradeUseCase,
  LIMITE_DE_PLANO_REPOSITORY,
  ObterAssinaturaUseCase,
  PROCESSADOR_DE_PAGAMENTO,
  ProcessarEventoDePagamentoUseCase,
  REGISTRO_DE_IDEMPOTENCIA_REPOSITORY,
  ResolverAssinaturaService,
  VerificarLimiteUseCase,
  type AssinaturaRepository,
  type CachePort,
  type CatalogoDeCobrancaRepository,
  type CupomRepository,
  type EventPublisher,
  type IdGenerator,
  type LimiteDePlanoRepository,
  type ProcessadorDePagamento,
  type RegistroDeIdempotenciaRepository,
} from '@cosmaria/core-application';
import {
  CacheRegistroDeIdempotenciaRepository,
  CryptoIdGenerator,
  InMemoryAssinaturaRepository,
  InMemoryCatalogoDeCobrancaRepository,
  InMemoryCupomRepository,
  InMemoryLimiteDePlanoRepository,
  PostgresAssinaturaRepository,
  PostgresCatalogoDeCobrancaRepository,
  PostgresCupomRepository,
  PostgresLimiteDePlanoRepository,
  ProcessadorDePagamentoHmac,
} from '@cosmaria/core-infrastructure';
import { PREMIUM_PUBLIC_API, type PremiumPublicApi } from '@cosmaria/core-public-api';
import { PG_POOL } from '../infra/infra.tokens';
import { segredoWebhookPagamento } from '../infra/infra.config';
import { AuthModule } from '../auth/auth.module';
import { AssinaturaController, LimitesController } from './assinatura.controller';
import { WebhookPagamentoController } from './webhook-pagamento.controller';

/**
 * Composition root de Billing & Premium (doc 07 / doc 14 §10).
 *
 * Exporta a PREMIUM_PUBLIC_API — quarta interface pública do Core. É por ela que Grow e
 * Med perguntarão "é Premium?" e "cabe mais um?", nunca lendo `LimiteDePlano` direto.
 *
 * O `ProcessadorDePagamento` é injetado pela porta: o gateway concreto ainda é decisão
 * de negócio (doc 13 §16.1), e trocá-lo não toca em nenhum caso de uso.
 */
const providers: Provider[] = [
  { provide: ID_GENERATOR, useClass: CryptoIdGenerator },
  {
    provide: PROCESSADOR_DE_PAGAMENTO,
    useFactory: (): ProcessadorDePagamento =>
      new ProcessadorDePagamentoHmac(segredoWebhookPagamento()),
  },
  {
    provide: REGISTRO_DE_IDEMPOTENCIA_REPOSITORY,
    useFactory: (cache: CachePort): RegistroDeIdempotenciaRepository =>
      new CacheRegistroDeIdempotenciaRepository(cache),
    inject: [CACHE_PORT],
  },
  {
    provide: ASSINATURA_REPOSITORY,
    useFactory: (pool: Pool | null): AssinaturaRepository =>
      pool ? new PostgresAssinaturaRepository(pool) : new InMemoryAssinaturaRepository(),
    inject: [PG_POOL],
  },
  {
    provide: LIMITE_DE_PLANO_REPOSITORY,
    useFactory: (pool: Pool | null): LimiteDePlanoRepository =>
      pool ? new PostgresLimiteDePlanoRepository(pool) : new InMemoryLimiteDePlanoRepository(),
    inject: [PG_POOL],
  },
  {
    provide: CUPOM_REPOSITORY,
    useFactory: (pool: Pool | null): CupomRepository =>
      pool ? new PostgresCupomRepository(pool) : new InMemoryCupomRepository(),
    inject: [PG_POOL],
  },
  {
    provide: CATALOGO_DE_COBRANCA_REPOSITORY,
    useFactory: (pool: Pool | null): CatalogoDeCobrancaRepository =>
      pool
        ? new PostgresCatalogoDeCobrancaRepository(pool)
        : new InMemoryCatalogoDeCobrancaRepository(),
    inject: [PG_POOL],
  },
  {
    provide: ResolverAssinaturaService,
    useFactory: (repo: AssinaturaRepository, idGen: IdGenerator) =>
      new ResolverAssinaturaService(repo, idGen),
    inject: [ASSINATURA_REPOSITORY, ID_GENERATOR],
  },
  {
    provide: ObterAssinaturaUseCase,
    useFactory: (resolver: ResolverAssinaturaService) => new ObterAssinaturaUseCase(resolver),
    inject: [ResolverAssinaturaService],
  },
  {
    provide: IniciarUpgradeUseCase,
    useFactory: (
      resolver: ResolverAssinaturaService,
      assinaturas: AssinaturaRepository,
      catalogo: CatalogoDeCobrancaRepository,
      cupons: CupomRepository,
      pagamento: ProcessadorDePagamento,
      eventos: EventPublisher,
    ) => new IniciarUpgradeUseCase(resolver, assinaturas, catalogo, cupons, pagamento, eventos),
    inject: [
      ResolverAssinaturaService,
      ASSINATURA_REPOSITORY,
      CATALOGO_DE_COBRANCA_REPOSITORY,
      CUPOM_REPOSITORY,
      PROCESSADOR_DE_PAGAMENTO,
      EVENT_PUBLISHER,
    ],
  },
  {
    provide: CancelarAssinaturaUseCase,
    useFactory: (
      resolver: ResolverAssinaturaService,
      assinaturas: AssinaturaRepository,
      eventos: EventPublisher,
    ) => new CancelarAssinaturaUseCase(resolver, assinaturas, eventos),
    inject: [ResolverAssinaturaService, ASSINATURA_REPOSITORY, EVENT_PUBLISHER],
  },
  {
    provide: AplicarCupomUseCase,
    useFactory: (
      resolver: ResolverAssinaturaService,
      assinaturas: AssinaturaRepository,
      cupons: CupomRepository,
    ) => new AplicarCupomUseCase(resolver, assinaturas, cupons),
    inject: [ResolverAssinaturaService, ASSINATURA_REPOSITORY, CUPOM_REPOSITORY],
  },
  {
    provide: ConsultarLimitesUseCase,
    useFactory: (resolver: ResolverAssinaturaService, limites: LimiteDePlanoRepository) =>
      new ConsultarLimitesUseCase(resolver, limites),
    inject: [ResolverAssinaturaService, LIMITE_DE_PLANO_REPOSITORY],
  },
  {
    provide: VerificarLimiteUseCase,
    useFactory: (
      resolver: ResolverAssinaturaService,
      limites: LimiteDePlanoRepository,
      eventos: EventPublisher,
    ) => new VerificarLimiteUseCase(resolver, limites, eventos),
    inject: [ResolverAssinaturaService, LIMITE_DE_PLANO_REPOSITORY, EVENT_PUBLISHER],
  },
  {
    provide: ProcessarEventoDePagamentoUseCase,
    useFactory: (
      pagamento: ProcessadorDePagamento,
      idempotencia: RegistroDeIdempotenciaRepository,
      resolver: ResolverAssinaturaService,
      assinaturas: AssinaturaRepository,
      eventos: EventPublisher,
    ) =>
      new ProcessarEventoDePagamentoUseCase(
        pagamento,
        idempotencia,
        resolver,
        assinaturas,
        eventos,
      ),
    inject: [
      PROCESSADOR_DE_PAGAMENTO,
      REGISTRO_DE_IDEMPOTENCIA_REPOSITORY,
      ResolverAssinaturaService,
      ASSINATURA_REPOSITORY,
      EVENT_PUBLISHER,
    ],
  },
  {
    provide: PREMIUM_PUBLIC_API,
    useFactory: (
      resolver: ResolverAssinaturaService,
      verificar: VerificarLimiteUseCase,
    ): PremiumPublicApi => ({
      ehPremium: async (usuarioId) => (await resolver.executar(usuarioId)).ehPremiumAtivo(),
      verificarLimite: (usuarioId, chave, usoAtual) =>
        verificar.executar({ usuarioId, chave, usoAtual }),
    }),
    inject: [ResolverAssinaturaService, VerificarLimiteUseCase],
  },
];

@Module({
  imports: [AuthModule],
  controllers: [AssinaturaController, LimitesController, WebhookPagamentoController],
  providers,
  // VerificarLimiteUseCase é exportado para que outros módulos do Core (ex.: Mídia)
  // apliquem o MESMO gate de LimiteDePlano, em vez de reimplementar a regra.
  exports: [PREMIUM_PUBLIC_API, VerificarLimiteUseCase],
})
export class BillingModule {}
