import { Module, type Provider } from '@nestjs/common';
import type { Pool } from 'pg';
import {
  EVENT_PUBLISHER,
  ID_GENERATOR,
  type EventPublisher,
  type IdGenerator,
} from '@cosmaria/core-application';
import { CryptoIdGenerator } from '@cosmaria/core-infrastructure';
import {
  COMPLEXIDADE_PUBLIC_API,
  type ComplexidadePublicApi,
  PREMIUM_PUBLIC_API,
  type PremiumPublicApi,
} from '@cosmaria/core-public-api';
import {
  AdicionarPlantaUseCase,
  AMBIENTE_REPOSITORY,
  type AmbienteRepository,
  AtualizarAmbienteUseCase,
  AtualizarGeneticaUseCase,
  AtualizarPlantaUseCase,
  AvancarFaseDaPlantaUseCase,
  AvancarFaseDoCicloUseCase,
  CICLO_REPOSITORY,
  type CicloRepository,
  CriarAmbienteUseCase,
  CriarGeneticaUseCase,
  EncerrarCicloUseCase,
  GENETICA_REPOSITORY,
  type GeneticaRepository,
  IniciarCicloUseCase,
  EVENTO_MANEJO_REPOSITORY,
  EVENTO_SANIDADE_REPOSITORY,
  type EventoManejoRepository,
  type EventoSanidadeRepository,
  ListarAmbientesUseCase,
  ListarCiclosUseCase,
  ListarGeneticasUseCase,
  ListarManejosDoCicloUseCase,
  ListarPlantasDoCicloUseCase,
  ListarSanidadeDoCicloUseCase,
  ListarSerieTemporalUseCase,
  ObterCamposDoCheckInUseCase,
  ObterCicloUseCase,
  PLANTA_REPOSITORY,
  type PlantaRepository,
  REGISTRO_AMBIENTAL_REPOSITORY,
  RegistrarCheckInUseCase,
  RegistrarManejoUseCase,
  RegistrarSanidadeUseCase,
  type RegistroAmbientalRepository,
  RemoverAmbienteUseCase,
  RemoverGeneticaUseCase,
  RenomearCicloUseCase,
  ResolverSanidadeUseCase,
} from '@cosmaria/grow-application';
import {
  InMemoryAmbienteRepository,
  InMemoryCicloRepository,
  InMemoryEventoManejoRepository,
  InMemoryEventoSanidadeRepository,
  InMemoryGeneticaRepository,
  InMemoryPlantaRepository,
  InMemoryRegistroAmbientalRepository,
  PostgresAmbienteRepository,
  PostgresCicloRepository,
  PostgresEventoManejoRepository,
  PostgresEventoSanidadeRepository,
  PostgresGeneticaRepository,
  PostgresPlantaRepository,
  PostgresRegistroAmbientalRepository,
} from '@cosmaria/grow-infrastructure';
import { PG_POOL } from '../infra/infra.tokens';
import { AuthModule } from '../auth/auth.module';
import { BillingModule } from '../billing/billing.module';
import { ComplexidadeModule } from '../complexidade/complexidade.module';
import {
  AmbienteController,
  CicloController,
  GeneticaController,
  PlantaController,
} from './grow.controller';
import {
  RegistroAmbientalController,
  SerieTemporalController,
} from './registro-ambiental.controller';
import {
  EventoManejoController,
  EventoSanidadeController,
  EventosDoCicloController,
} from './eventos-de-cultivo.controller';

/**
 * Composition root do COSMARIA Grow (doc 02 / doc 14 §10).
 *
 * Importa o BillingModule apenas pela PREMIUM_PUBLIC_API: o Grow pergunta "cabe mais um
 * ambiente?" e nunca reimplementa regra de cobrança. Não importa, e não pode importar,
 * nenhum módulo do Med (doc 04 §24, enforçado por lint).
 *
 * Os repositórios em memória precisam enxergar uns aos outros (`possuiPlantas`,
 * `possuiCiclos` cruzam agregados). Em vez de um singleton global, o wiring acontece
 * aqui — é o análogo do `EXISTS` que o Postgres faz numa consulta só.
 */
const emMemoria = () => {
  const geneticas = new InMemoryGeneticaRepository();
  const ambientes = new InMemoryAmbienteRepository();
  const ciclos = new InMemoryCicloRepository();
  const plantas = new InMemoryPlantaRepository();
  const registros = new InMemoryRegistroAmbientalRepository();
  const manejos = new InMemoryEventoManejoRepository();
  const sanidades = new InMemoryEventoSanidadeRepository();
  geneticas.conectarPlantas(plantas);
  ambientes.conectarCiclos(ciclos);
  return { geneticas, ambientes, ciclos, plantas, registros, manejos, sanidades };
};

/**
 * Token interno com o conjunto coeso de repositórios em memória. Existe só para que as
 * quatro portas compartilhem as MESMAS instâncias quando não há banco — com fábricas
 * independentes, cada porta receberia um repositório isolado e as consultas cruzadas
 * (`possuiPlantas`) sempre responderiam "não".
 */
const REPOSITORIOS_EM_MEMORIA = Symbol('RepositoriosGrowEmMemoria');

const providers: Provider[] = [
  { provide: ID_GENERATOR, useClass: CryptoIdGenerator },
  { provide: REPOSITORIOS_EM_MEMORIA, useFactory: emMemoria },
  {
    provide: GENETICA_REPOSITORY,
    useFactory: (pool: Pool | null, memoria: ReturnType<typeof emMemoria>): GeneticaRepository =>
      pool ? new PostgresGeneticaRepository(pool) : memoria.geneticas,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },
  {
    provide: AMBIENTE_REPOSITORY,
    useFactory: (pool: Pool | null, memoria: ReturnType<typeof emMemoria>): AmbienteRepository =>
      pool ? new PostgresAmbienteRepository(pool) : memoria.ambientes,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },
  {
    provide: CICLO_REPOSITORY,
    useFactory: (pool: Pool | null, memoria: ReturnType<typeof emMemoria>): CicloRepository =>
      pool ? new PostgresCicloRepository(pool) : memoria.ciclos,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },
  {
    provide: PLANTA_REPOSITORY,
    useFactory: (pool: Pool | null, memoria: ReturnType<typeof emMemoria>): PlantaRepository =>
      pool ? new PostgresPlantaRepository(pool) : memoria.plantas,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },
  {
    provide: REGISTRO_AMBIENTAL_REPOSITORY,
    useFactory: (
      pool: Pool | null,
      memoria: ReturnType<typeof emMemoria>,
    ): RegistroAmbientalRepository =>
      pool ? new PostgresRegistroAmbientalRepository(pool) : memoria.registros,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },

  // Genética
  {
    provide: CriarGeneticaUseCase,
    useFactory: (repo: GeneticaRepository, idGen: IdGenerator) =>
      new CriarGeneticaUseCase(repo, idGen),
    inject: [GENETICA_REPOSITORY, ID_GENERATOR],
  },
  {
    provide: ListarGeneticasUseCase,
    useFactory: (repo: GeneticaRepository) => new ListarGeneticasUseCase(repo),
    inject: [GENETICA_REPOSITORY],
  },
  {
    provide: AtualizarGeneticaUseCase,
    useFactory: (repo: GeneticaRepository) => new AtualizarGeneticaUseCase(repo),
    inject: [GENETICA_REPOSITORY],
  },
  {
    provide: RemoverGeneticaUseCase,
    useFactory: (repo: GeneticaRepository) => new RemoverGeneticaUseCase(repo),
    inject: [GENETICA_REPOSITORY],
  },

  // Ambiente
  {
    provide: CriarAmbienteUseCase,
    useFactory: (repo: AmbienteRepository, premium: PremiumPublicApi, idGen: IdGenerator) =>
      new CriarAmbienteUseCase(repo, premium, idGen),
    inject: [AMBIENTE_REPOSITORY, PREMIUM_PUBLIC_API, ID_GENERATOR],
  },
  {
    provide: ListarAmbientesUseCase,
    useFactory: (repo: AmbienteRepository) => new ListarAmbientesUseCase(repo),
    inject: [AMBIENTE_REPOSITORY],
  },
  {
    provide: AtualizarAmbienteUseCase,
    useFactory: (repo: AmbienteRepository) => new AtualizarAmbienteUseCase(repo),
    inject: [AMBIENTE_REPOSITORY],
  },
  {
    provide: RemoverAmbienteUseCase,
    useFactory: (repo: AmbienteRepository) => new RemoverAmbienteUseCase(repo),
    inject: [AMBIENTE_REPOSITORY],
  },

  // Ciclo
  {
    provide: IniciarCicloUseCase,
    useFactory: (
      ciclos: CicloRepository,
      ambientes: AmbienteRepository,
      idGen: IdGenerator,
      eventos: EventPublisher,
    ) => new IniciarCicloUseCase(ciclos, ambientes, idGen, eventos),
    inject: [CICLO_REPOSITORY, AMBIENTE_REPOSITORY, ID_GENERATOR, EVENT_PUBLISHER],
  },
  {
    provide: ListarCiclosUseCase,
    useFactory: (repo: CicloRepository) => new ListarCiclosUseCase(repo),
    inject: [CICLO_REPOSITORY],
  },
  {
    provide: ObterCicloUseCase,
    useFactory: (repo: CicloRepository) => new ObterCicloUseCase(repo),
    inject: [CICLO_REPOSITORY],
  },
  {
    provide: AvancarFaseDoCicloUseCase,
    useFactory: (repo: CicloRepository) => new AvancarFaseDoCicloUseCase(repo),
    inject: [CICLO_REPOSITORY],
  },
  {
    provide: RenomearCicloUseCase,
    useFactory: (repo: CicloRepository) => new RenomearCicloUseCase(repo),
    inject: [CICLO_REPOSITORY],
  },
  {
    provide: EncerrarCicloUseCase,
    useFactory: (repo: CicloRepository, eventos: EventPublisher) =>
      new EncerrarCicloUseCase(repo, eventos),
    inject: [CICLO_REPOSITORY, EVENT_PUBLISHER],
  },

  // Planta
  {
    provide: AdicionarPlantaUseCase,
    useFactory: (
      plantas: PlantaRepository,
      ciclos: CicloRepository,
      geneticas: GeneticaRepository,
      idGen: IdGenerator,
      eventos: EventPublisher,
    ) => new AdicionarPlantaUseCase(plantas, ciclos, geneticas, idGen, eventos),
    inject: [
      PLANTA_REPOSITORY,
      CICLO_REPOSITORY,
      GENETICA_REPOSITORY,
      ID_GENERATOR,
      EVENT_PUBLISHER,
    ],
  },
  {
    provide: ListarPlantasDoCicloUseCase,
    useFactory: (plantas: PlantaRepository, ciclos: CicloRepository) =>
      new ListarPlantasDoCicloUseCase(plantas, ciclos),
    inject: [PLANTA_REPOSITORY, CICLO_REPOSITORY],
  },
  {
    provide: AvancarFaseDaPlantaUseCase,
    useFactory: (plantas: PlantaRepository, ciclos: CicloRepository, eventos: EventPublisher) =>
      new AvancarFaseDaPlantaUseCase(plantas, ciclos, eventos),
    inject: [PLANTA_REPOSITORY, CICLO_REPOSITORY, EVENT_PUBLISHER],
  },
  {
    provide: AtualizarPlantaUseCase,
    useFactory: (repo: PlantaRepository) => new AtualizarPlantaUseCase(repo),
    inject: [PLANTA_REPOSITORY],
  },

  // Registro Ambiental (série temporal)
  {
    provide: RegistrarCheckInUseCase,
    useFactory: (
      registros: RegistroAmbientalRepository,
      ciclos: CicloRepository,
      plantas: PlantaRepository,
      idGen: IdGenerator,
      eventos: EventPublisher,
    ) => new RegistrarCheckInUseCase(registros, ciclos, plantas, idGen, eventos),
    inject: [
      REGISTRO_AMBIENTAL_REPOSITORY,
      CICLO_REPOSITORY,
      PLANTA_REPOSITORY,
      ID_GENERATOR,
      EVENT_PUBLISHER,
    ],
  },
  {
    provide: ListarSerieTemporalUseCase,
    useFactory: (registros: RegistroAmbientalRepository, ciclos: CicloRepository) =>
      new ListarSerieTemporalUseCase(registros, ciclos),
    inject: [REGISTRO_AMBIENTAL_REPOSITORY, CICLO_REPOSITORY],
  },
  {
    provide: ObterCamposDoCheckInUseCase,
    useFactory: (complexidade: ComplexidadePublicApi) =>
      new ObterCamposDoCheckInUseCase(complexidade),
    inject: [COMPLEXIDADE_PUBLIC_API],
  },

  // Manejo e Sanidade
  {
    provide: EVENTO_MANEJO_REPOSITORY,
    useFactory: (
      pool: Pool | null,
      memoria: ReturnType<typeof emMemoria>,
    ): EventoManejoRepository =>
      pool ? new PostgresEventoManejoRepository(pool) : memoria.manejos,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },
  {
    provide: EVENTO_SANIDADE_REPOSITORY,
    useFactory: (
      pool: Pool | null,
      memoria: ReturnType<typeof emMemoria>,
    ): EventoSanidadeRepository =>
      pool ? new PostgresEventoSanidadeRepository(pool) : memoria.sanidades,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },
  {
    provide: RegistrarManejoUseCase,
    useFactory: (
      eventos: EventoManejoRepository,
      ciclos: CicloRepository,
      plantas: PlantaRepository,
      idGen: IdGenerator,
    ) => new RegistrarManejoUseCase(eventos, ciclos, plantas, idGen),
    inject: [EVENTO_MANEJO_REPOSITORY, CICLO_REPOSITORY, PLANTA_REPOSITORY, ID_GENERATOR],
  },
  {
    provide: ListarManejosDoCicloUseCase,
    useFactory: (eventos: EventoManejoRepository, ciclos: CicloRepository) =>
      new ListarManejosDoCicloUseCase(eventos, ciclos),
    inject: [EVENTO_MANEJO_REPOSITORY, CICLO_REPOSITORY],
  },
  {
    provide: RegistrarSanidadeUseCase,
    useFactory: (
      eventos: EventoSanidadeRepository,
      ciclos: CicloRepository,
      plantas: PlantaRepository,
      idGen: IdGenerator,
    ) => new RegistrarSanidadeUseCase(eventos, ciclos, plantas, idGen),
    inject: [EVENTO_SANIDADE_REPOSITORY, CICLO_REPOSITORY, PLANTA_REPOSITORY, ID_GENERATOR],
  },
  {
    provide: ResolverSanidadeUseCase,
    useFactory: (eventos: EventoSanidadeRepository) => new ResolverSanidadeUseCase(eventos),
    inject: [EVENTO_SANIDADE_REPOSITORY],
  },
  {
    provide: ListarSanidadeDoCicloUseCase,
    useFactory: (eventos: EventoSanidadeRepository, ciclos: CicloRepository) =>
      new ListarSanidadeDoCicloUseCase(eventos, ciclos),
    inject: [EVENTO_SANIDADE_REPOSITORY, CICLO_REPOSITORY],
  },
];

@Module({
  imports: [AuthModule, BillingModule, ComplexidadeModule],
  controllers: [
    GeneticaController,
    AmbienteController,
    CicloController,
    PlantaController,
    RegistroAmbientalController,
    SerieTemporalController,
    EventoManejoController,
    EventoSanidadeController,
    EventosDoCicloController,
  ],
  providers,
})
export class GrowModule {}
