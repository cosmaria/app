import { Inject, Module, type OnModuleInit, type Provider } from '@nestjs/common';
import type { Pool } from 'pg';
import { ID_GENERATOR, type IdGenerator } from '@cosmaria/core-application';
import { CryptoIdGenerator, InProcessEventPublisher } from '@cosmaria/core-infrastructure';
import {
  AvaliarAlertasUseCase,
  CalcularCorrelacaoCruzadaUseCase,
  CalcularCorrelacaoUseCase,
  GerarDigestUseCase,
  GerarInsightsUseCase,
  GerarRecomendacoesUseCase,
  IngerirEventoService,
  POLITICA_DE_AGREGACAO,
  PONTO_DE_SERIE_REPOSITORY,
  RegistrarVinculoGrowMedService,
  VINCULO_GROW_MED_REPOSITORY,
  type PontoDeSerieRepository,
  type VinculoGrowMedRepository,
} from '@cosmaria/ia-application';
import { PoliticaDeAgregacao } from '@cosmaria/ia-domain';
import {
  InMemoryPontoDeSerieRepository,
  InMemoryVinculoGrowMedRepository,
  PostgresPontoDeSerieRepository,
  PostgresVinculoGrowMedRepository,
} from '@cosmaria/ia-infrastructure';
import { PG_POOL } from '../infra/infra.tokens';
import { AuthModule } from '../auth/auth.module';
import { IaController } from './ia.controller';

/**
 * Composition root da IA (doc 05 / doc 14 §10).
 *
 * A IA é consumidora do barramento: no boot, o Adaptador de Ingestão assina os eventos de
 * Grow/Med (mesmo padrão da Auditoria no LgpdModule). Não importa módulo de Grow/Med — só
 * ouve seus eventos por NOME (doc 04 §24). `PoliticaDeAgregacao` nasce dos padrões do doc
 * 05 (Grow=30/Med=50), substituível por ambiente sem tocar no domínio.
 */
const providers: Provider[] = [
  { provide: ID_GENERATOR, useClass: CryptoIdGenerator },
  { provide: POLITICA_DE_AGREGACAO, useFactory: () => PoliticaDeAgregacao.padrao() },
  {
    provide: PONTO_DE_SERIE_REPOSITORY,
    useFactory: (pool: Pool | null): PontoDeSerieRepository =>
      pool ? new PostgresPontoDeSerieRepository(pool) : new InMemoryPontoDeSerieRepository(),
    inject: [PG_POOL],
  },
  {
    provide: IngerirEventoService,
    useFactory: (repo: PontoDeSerieRepository, idGen: IdGenerator) =>
      new IngerirEventoService(repo, idGen),
    inject: [PONTO_DE_SERIE_REPOSITORY, ID_GENERATOR],
  },
  {
    provide: VINCULO_GROW_MED_REPOSITORY,
    useFactory: (pool: Pool | null): VinculoGrowMedRepository =>
      pool ? new PostgresVinculoGrowMedRepository(pool) : new InMemoryVinculoGrowMedRepository(),
    inject: [PG_POOL],
  },
  {
    provide: RegistrarVinculoGrowMedService,
    useFactory: (repo: VinculoGrowMedRepository) => new RegistrarVinculoGrowMedService(repo),
    inject: [VINCULO_GROW_MED_REPOSITORY],
  },
  {
    provide: CalcularCorrelacaoCruzadaUseCase,
    useFactory: (
      repo: PontoDeSerieRepository,
      vinculos: VinculoGrowMedRepository,
      politica: PoliticaDeAgregacao,
    ) => new CalcularCorrelacaoCruzadaUseCase(repo, vinculos, politica),
    inject: [PONTO_DE_SERIE_REPOSITORY, VINCULO_GROW_MED_REPOSITORY, POLITICA_DE_AGREGACAO],
  },
  {
    provide: CalcularCorrelacaoUseCase,
    useFactory: (repo: PontoDeSerieRepository, politica: PoliticaDeAgregacao) =>
      new CalcularCorrelacaoUseCase(repo, politica),
    inject: [PONTO_DE_SERIE_REPOSITORY, POLITICA_DE_AGREGACAO],
  },
  {
    provide: GerarInsightsUseCase,
    useFactory: (repo: PontoDeSerieRepository, politica: PoliticaDeAgregacao) =>
      new GerarInsightsUseCase(repo, politica),
    inject: [PONTO_DE_SERIE_REPOSITORY, POLITICA_DE_AGREGACAO],
  },
  {
    provide: AvaliarAlertasUseCase,
    useFactory: (repo: PontoDeSerieRepository) => new AvaliarAlertasUseCase(repo),
    inject: [PONTO_DE_SERIE_REPOSITORY],
  },
  {
    provide: GerarRecomendacoesUseCase,
    useFactory: (insights: GerarInsightsUseCase) => new GerarRecomendacoesUseCase(insights),
    inject: [GerarInsightsUseCase],
  },
  {
    provide: GerarDigestUseCase,
    useFactory: (
      repo: PontoDeSerieRepository,
      politica: PoliticaDeAgregacao,
      insights: GerarInsightsUseCase,
      alertas: AvaliarAlertasUseCase,
    ) => new GerarDigestUseCase(repo, politica, insights, alertas),
    inject: [
      PONTO_DE_SERIE_REPOSITORY,
      POLITICA_DE_AGREGACAO,
      GerarInsightsUseCase,
      AvaliarAlertasUseCase,
    ],
  },
];

@Module({
  imports: [AuthModule],
  controllers: [IaController],
  providers,
})
export class IaModule implements OnModuleInit {
  constructor(
    @Inject(InProcessEventPublisher) private readonly bus: InProcessEventPublisher,
    private readonly ingestao: IngerirEventoService,
    private readonly vinculos: RegistrarVinculoGrowMedService,
  ) {}

  onModuleInit(): void {
    // A IA passa a ouvir os eventos de série temporal de Grow e Med (doc 05 §6).
    for (const nome of IngerirEventoService.EVENTOS_INGERIDOS) {
      this.bus.assinar(nome, (evento) => this.ingestao.ingerir(evento));
    }
    // E os eventos de opt-in Grow↔Med, que habilitam a correlação cruzada (doc 00).
    for (const nome of RegistrarVinculoGrowMedService.EVENTOS) {
      this.bus.assinar(nome, (evento) => this.vinculos.processar(evento));
    }
  }
}
