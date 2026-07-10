// @cosmaria/grow-application — Casos de uso e portas do Grow (doc 14).
// Depende do próprio domínio, do shared kernel do Core (IdGenerator, EventPublisher) e
// das INTERFACES PÚBLICAS do Core (Premium). Nunca do interior do Core, nem do Med.

export {
  GENETICA_REPOSITORY,
  AMBIENTE_REPOSITORY,
  CICLO_REPOSITORY,
  PLANTA_REPOSITORY,
  REGISTRO_AMBIENTAL_REPOSITORY,
} from './lib/ports/grow.repositories';
export type {
  GeneticaRepository,
  AmbienteRepository,
  CicloRepository,
  PlantaRepository,
  RegistroAmbientalRepository,
  PaginaDeRegistros,
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
