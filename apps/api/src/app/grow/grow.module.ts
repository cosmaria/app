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
  COLHEITA_REPOSITORY,
  type ColheitaRepository,
  CriarAmbienteUseCase,
  CriarGeneticaUseCase,
  CURA_REPOSITORY,
  type CuraRepository,
  EncerrarCicloUseCase,
  FinalizarCuraUseCase,
  FinalizarSecagemUseCase,
  GerarLoteUseCase,
  GENETICA_REPOSITORY,
  type GeneticaRepository,
  IniciarCicloUseCase,
  EVENTO_MANEJO_REPOSITORY,
  EVENTO_SANIDADE_REPOSITORY,
  type EventoManejoRepository,
  type EventoSanidadeRepository,
  ListarAmbientesUseCase,
  ListarCiclosUseCase,
  ListarColheitasDoCicloUseCase,
  ListarGeneticasUseCase,
  ListarManejosDoCicloUseCase,
  ListarPlantasDoCicloUseCase,
  ListarSanidadeDoCicloUseCase,
  ListarSerieTemporalUseCase,
  LOTE_REPOSITORY,
  type LoteRepository,
  ObterCamposDoCheckInUseCase,
  ObterCicloUseCase,
  ObterColheitaUseCase,
  ObterLoteUseCase,
  PLANTA_REPOSITORY,
  type PlantaRepository,
  REGISTRO_AMBIENTAL_REPOSITORY,
  RegistrarCheckInUseCase,
  RegistrarColheitaUseCase,
  RegistrarCuraUseCase,
  RegistrarManejoUseCase,
  RegistrarSanidadeUseCase,
  RegistrarSecagemUseCase,
  type RegistroAmbientalRepository,
  RemoverAmbienteUseCase,
  RemoverGeneticaUseCase,
  RenomearCicloUseCase,
  ResolverSanidadeUseCase,
  SECAGEM_REPOSITORY,
  type SecagemRepository,
  AtualizarTarefaUseCase,
  ConcluirTarefaUseCase,
  CriarTarefaUseCase,
  ListarTarefasUseCase,
  TAREFA_REPOSITORY,
  type TarefaRepository,
  CompararCiclosUseCase,
  ObterRelatorioDoCicloUseCase,
  type ReposDeEstatisticas,
} from '@cosmaria/grow-application';
import {
  InMemoryAmbienteRepository,
  InMemoryCicloRepository,
  InMemoryColheitaRepository,
  InMemoryCuraRepository,
  InMemoryEventoManejoRepository,
  InMemoryEventoSanidadeRepository,
  InMemoryGeneticaRepository,
  InMemoryLoteRepository,
  InMemoryPlantaRepository,
  InMemoryRegistroAmbientalRepository,
  InMemorySecagemRepository,
  InMemoryTarefaRepository,
  PostgresAmbienteRepository,
  PostgresCicloRepository,
  PostgresColheitaRepository,
  PostgresCuraRepository,
  PostgresEventoManejoRepository,
  PostgresEventoSanidadeRepository,
  PostgresGeneticaRepository,
  PostgresLoteRepository,
  PostgresPlantaRepository,
  PostgresRegistroAmbientalRepository,
  PostgresSecagemRepository,
  PostgresTarefaRepository,
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
import {
  ColheitaController,
  ColheitasDoCicloController,
  CuraController,
  LoteController,
  SecagemController,
} from './pos-colheita.controller';
import { TarefaController } from './tarefa.controller';
import {
  ComparacaoDeCiclosController,
  RelatorioDoCicloController,
} from './estatisticas.controller';

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
  const colheitas = new InMemoryColheitaRepository();
  const secagens = new InMemorySecagemRepository();
  const curas = new InMemoryCuraRepository();
  const lotes = new InMemoryLoteRepository();
  const tarefas = new InMemoryTarefaRepository();
  geneticas.conectarPlantas(plantas);
  ambientes.conectarCiclos(ciclos);
  return {
    geneticas,
    ambientes,
    ciclos,
    plantas,
    registros,
    manejos,
    sanidades,
    colheitas,
    secagens,
    curas,
    lotes,
    tarefas,
  };
};

/**
 * Token interno com o conjunto coeso de repositórios em memória. Existe só para que as
 * quatro portas compartilhem as MESMAS instâncias quando não há banco — com fábricas
 * independentes, cada porta receberia um repositório isolado e as consultas cruzadas
 * (`possuiPlantas`) sempre responderiam "não".
 */
const REPOSITORIOS_EM_MEMORIA = Symbol('RepositoriosGrowEmMemoria');

/** Bundle de repositórios que o Motor de Estatísticas lê (cruza quase todos os agregados). */
const REPOS_ESTATISTICAS = Symbol('ReposDeEstatisticas');

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

  // Pós-colheita: Colheita, Secagem, Cura, Lote
  {
    provide: COLHEITA_REPOSITORY,
    useFactory: (pool: Pool | null, memoria: ReturnType<typeof emMemoria>): ColheitaRepository =>
      pool ? new PostgresColheitaRepository(pool) : memoria.colheitas,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },
  {
    provide: SECAGEM_REPOSITORY,
    useFactory: (pool: Pool | null, memoria: ReturnType<typeof emMemoria>): SecagemRepository =>
      pool ? new PostgresSecagemRepository(pool) : memoria.secagens,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },
  {
    provide: CURA_REPOSITORY,
    useFactory: (pool: Pool | null, memoria: ReturnType<typeof emMemoria>): CuraRepository =>
      pool ? new PostgresCuraRepository(pool) : memoria.curas,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },
  {
    provide: LOTE_REPOSITORY,
    useFactory: (pool: Pool | null, memoria: ReturnType<typeof emMemoria>): LoteRepository =>
      pool ? new PostgresLoteRepository(pool) : memoria.lotes,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },
  {
    provide: RegistrarColheitaUseCase,
    useFactory: (
      colheitas: ColheitaRepository,
      ciclos: CicloRepository,
      plantas: PlantaRepository,
      idGen: IdGenerator,
      eventos: EventPublisher,
    ) => new RegistrarColheitaUseCase(colheitas, ciclos, plantas, idGen, eventos),
    inject: [
      COLHEITA_REPOSITORY,
      CICLO_REPOSITORY,
      PLANTA_REPOSITORY,
      ID_GENERATOR,
      EVENT_PUBLISHER,
    ],
  },
  {
    provide: ObterColheitaUseCase,
    useFactory: (colheitas: ColheitaRepository) => new ObterColheitaUseCase(colheitas),
    inject: [COLHEITA_REPOSITORY],
  },
  {
    provide: ListarColheitasDoCicloUseCase,
    useFactory: (colheitas: ColheitaRepository, ciclos: CicloRepository) =>
      new ListarColheitasDoCicloUseCase(colheitas, ciclos),
    inject: [COLHEITA_REPOSITORY, CICLO_REPOSITORY],
  },
  {
    provide: RegistrarSecagemUseCase,
    useFactory: (secagens: SecagemRepository, colheitas: ColheitaRepository, idGen: IdGenerator) =>
      new RegistrarSecagemUseCase(secagens, colheitas, idGen),
    inject: [SECAGEM_REPOSITORY, COLHEITA_REPOSITORY, ID_GENERATOR],
  },
  {
    provide: FinalizarSecagemUseCase,
    useFactory: (secagens: SecagemRepository) => new FinalizarSecagemUseCase(secagens),
    inject: [SECAGEM_REPOSITORY],
  },
  {
    provide: RegistrarCuraUseCase,
    useFactory: (curas: CuraRepository, secagens: SecagemRepository, idGen: IdGenerator) =>
      new RegistrarCuraUseCase(curas, secagens, idGen),
    inject: [CURA_REPOSITORY, SECAGEM_REPOSITORY, ID_GENERATOR],
  },
  {
    provide: FinalizarCuraUseCase,
    useFactory: (curas: CuraRepository) => new FinalizarCuraUseCase(curas),
    inject: [CURA_REPOSITORY],
  },
  {
    provide: GerarLoteUseCase,
    useFactory: (
      lotes: LoteRepository,
      curas: CuraRepository,
      secagens: SecagemRepository,
      colheitas: ColheitaRepository,
      idGen: IdGenerator,
    ) => new GerarLoteUseCase(lotes, curas, secagens, colheitas, idGen),
    inject: [
      LOTE_REPOSITORY,
      CURA_REPOSITORY,
      SECAGEM_REPOSITORY,
      COLHEITA_REPOSITORY,
      ID_GENERATOR,
    ],
  },
  {
    provide: ObterLoteUseCase,
    useFactory: (
      lotes: LoteRepository,
      curas: CuraRepository,
      secagens: SecagemRepository,
      colheitas: ColheitaRepository,
    ) => new ObterLoteUseCase(lotes, curas, secagens, colheitas),
    inject: [LOTE_REPOSITORY, CURA_REPOSITORY, SECAGEM_REPOSITORY, COLHEITA_REPOSITORY],
  },

  // Tarefas
  {
    provide: TAREFA_REPOSITORY,
    useFactory: (pool: Pool | null, memoria: ReturnType<typeof emMemoria>): TarefaRepository =>
      pool ? new PostgresTarefaRepository(pool) : memoria.tarefas,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },
  {
    provide: CriarTarefaUseCase,
    useFactory: (
      tarefas: TarefaRepository,
      ciclos: CicloRepository,
      plantas: PlantaRepository,
      idGen: IdGenerator,
      eventos: EventPublisher,
    ) => new CriarTarefaUseCase(tarefas, ciclos, plantas, idGen, eventos),
    inject: [TAREFA_REPOSITORY, CICLO_REPOSITORY, PLANTA_REPOSITORY, ID_GENERATOR, EVENT_PUBLISHER],
  },
  {
    provide: ListarTarefasUseCase,
    useFactory: (tarefas: TarefaRepository) => new ListarTarefasUseCase(tarefas),
    inject: [TAREFA_REPOSITORY],
  },
  {
    provide: AtualizarTarefaUseCase,
    useFactory: (tarefas: TarefaRepository) => new AtualizarTarefaUseCase(tarefas),
    inject: [TAREFA_REPOSITORY],
  },
  {
    provide: ConcluirTarefaUseCase,
    useFactory: (
      tarefas: TarefaRepository,
      ciclos: CicloRepository,
      idGen: IdGenerator,
      eventos: EventPublisher,
    ) => new ConcluirTarefaUseCase(tarefas, ciclos, idGen, eventos),
    inject: [TAREFA_REPOSITORY, CICLO_REPOSITORY, ID_GENERATOR, EVENT_PUBLISHER],
  },

  // Estatísticas / Comparação entre ciclos — motor de agregação de leitura.
  {
    provide: REPOS_ESTATISTICAS,
    useFactory: (
      ciclos: CicloRepository,
      plantas: PlantaRepository,
      manejos: EventoManejoRepository,
      sanidades: EventoSanidadeRepository,
      registros: RegistroAmbientalRepository,
      colheitas: ColheitaRepository,
      secagens: SecagemRepository,
      curas: CuraRepository,
      lotes: LoteRepository,
    ): ReposDeEstatisticas => ({
      ciclos,
      plantas,
      manejos,
      sanidades,
      registros,
      colheitas,
      secagens,
      curas,
      lotes,
    }),
    inject: [
      CICLO_REPOSITORY,
      PLANTA_REPOSITORY,
      EVENTO_MANEJO_REPOSITORY,
      EVENTO_SANIDADE_REPOSITORY,
      REGISTRO_AMBIENTAL_REPOSITORY,
      COLHEITA_REPOSITORY,
      SECAGEM_REPOSITORY,
      CURA_REPOSITORY,
      LOTE_REPOSITORY,
    ],
  },
  {
    provide: ObterRelatorioDoCicloUseCase,
    useFactory: (repos: ReposDeEstatisticas) => new ObterRelatorioDoCicloUseCase(repos),
    inject: [REPOS_ESTATISTICAS],
  },
  {
    provide: CompararCiclosUseCase,
    useFactory: (repos: ReposDeEstatisticas) => new CompararCiclosUseCase(repos),
    inject: [REPOS_ESTATISTICAS],
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
    ColheitaController,
    ColheitasDoCicloController,
    SecagemController,
    CuraController,
    LoteController,
    TarefaController,
    RelatorioDoCicloController,
    ComparacaoDeCiclosController,
  ],
  providers,
})
export class GrowModule {}
