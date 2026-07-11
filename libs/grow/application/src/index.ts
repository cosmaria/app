// @cosmaria/grow-application — Casos de uso e portas do Grow (doc 14).
// Depende do próprio domínio, do shared kernel do Core (IdGenerator, EventPublisher) e
// das INTERFACES PÚBLICAS do Core (Premium). Nunca do interior do Core, nem do Med.

export {
  GENETICA_REPOSITORY,
  AMBIENTE_REPOSITORY,
  CICLO_REPOSITORY,
  PLANTA_REPOSITORY,
  REGISTRO_AMBIENTAL_REPOSITORY,
  EVENTO_MANEJO_REPOSITORY,
  EVENTO_SANIDADE_REPOSITORY,
  COLHEITA_REPOSITORY,
  SECAGEM_REPOSITORY,
  CURA_REPOSITORY,
  LOTE_REPOSITORY,
  TAREFA_REPOSITORY,
} from './lib/ports/grow.repositories';
export type {
  GeneticaRepository,
  AmbienteRepository,
  CicloRepository,
  PlantaRepository,
  RegistroAmbientalRepository,
  PaginaDeRegistros,
  EventoManejoRepository,
  EventoSanidadeRepository,
  ColheitaRepository,
  SecagemRepository,
  CuraRepository,
  LoteRepository,
  TarefaRepository,
  FiltroDeTarefas,
} from './lib/ports/grow.repositories';

export {
  CriarGeneticaUseCase,
  ListarGeneticasUseCase,
  AtualizarGeneticaUseCase,
  RemoverGeneticaUseCase,
  paraGeneticaView,
} from './lib/use-cases/genetica.use-cases';
export type {
  GeneticaView,
  CriarGeneticaInput,
  AtualizarGeneticaInput,
} from './lib/use-cases/genetica.use-cases';

export {
  CriarAmbienteUseCase,
  ListarAmbientesUseCase,
  AtualizarAmbienteUseCase,
  RemoverAmbienteUseCase,
  paraAmbienteView,
} from './lib/use-cases/ambiente.use-cases';
export type {
  AmbienteView,
  CriarAmbienteInput,
  AtualizarAmbienteInput,
} from './lib/use-cases/ambiente.use-cases';

export {
  IniciarCicloUseCase,
  ListarCiclosUseCase,
  ObterCicloUseCase,
  AvancarFaseDoCicloUseCase,
  RenomearCicloUseCase,
  EncerrarCicloUseCase,
  paraCicloView,
} from './lib/use-cases/ciclo.use-cases';
export type { CicloView, IniciarCicloInput } from './lib/use-cases/ciclo.use-cases';

export {
  AdicionarPlantaUseCase,
  ListarPlantasDoCicloUseCase,
  AvancarFaseDaPlantaUseCase,
  AtualizarPlantaUseCase,
  paraPlantaView,
} from './lib/use-cases/planta.use-cases';
export type { PlantaView, AdicionarPlantaInput } from './lib/use-cases/planta.use-cases';

export {
  RegistrarCheckInUseCase,
  ListarSerieTemporalUseCase,
  ObterCamposDoCheckInUseCase,
  CAMPOS_DO_CHECKIN,
  paraRegistroView,
} from './lib/use-cases/registro-ambiental.use-cases';
export type {
  RegistroAmbientalView,
  RegistrarCheckInInput,
  SerieTemporalView,
} from './lib/use-cases/registro-ambiental.use-cases';

export {
  RegistrarManejoUseCase,
  ListarManejosDoCicloUseCase,
  RegistrarSanidadeUseCase,
  ResolverSanidadeUseCase,
  ListarSanidadeDoCicloUseCase,
  paraManejoView,
  paraSanidadeView,
} from './lib/use-cases/eventos-de-cultivo.use-cases';
export type {
  EventoManejoView,
  EventoSanidadeView,
  RegistrarManejoInput,
  RegistrarSanidadeInput,
} from './lib/use-cases/eventos-de-cultivo.use-cases';

export {
  RegistrarColheitaUseCase,
  ObterColheitaUseCase,
  ListarColheitasDoCicloUseCase,
  RegistrarSecagemUseCase,
  FinalizarSecagemUseCase,
  RegistrarCuraUseCase,
  FinalizarCuraUseCase,
  GerarLoteUseCase,
  ObterLoteUseCase,
  paraColheitaView,
  paraSecagemView,
  paraCuraView,
  paraLoteView,
} from './lib/use-cases/pos-colheita.use-cases';
export type {
  ColheitaView,
  SecagemView,
  CuraView,
  LoteView,
  RegistrarColheitaInput,
  RegistrarSecagemInput,
  RegistrarCuraInput,
  GerarLoteInput,
} from './lib/use-cases/pos-colheita.use-cases';

export {
  CriarTarefaUseCase,
  ListarTarefasUseCase,
  AtualizarTarefaUseCase,
  ConcluirTarefaUseCase,
  paraTarefaView,
} from './lib/use-cases/tarefa.use-cases';
export type {
  TarefaView,
  CriarTarefaInput,
  AtualizarTarefaInput,
  ConcluirTarefaResult,
} from './lib/use-cases/tarefa.use-cases';

export {
  ObterRelatorioDoCicloUseCase,
  CompararCiclosUseCase,
} from './lib/use-cases/estatisticas.use-cases';
export type {
  RelatorioDoCicloView,
  ComparacaoDeCiclosView,
  ReposDeEstatisticas,
} from './lib/use-cases/estatisticas.use-cases';
