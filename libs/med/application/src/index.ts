// @cosmaria/med-application — Casos de uso e portas do Med (doc 14).
// Depende do próprio domínio, do shared kernel do Core (IdGenerator, EventPublisher) e
// das INTERFACES PÚBLICAS do Core (Premium). Nunca do interior do Core, nem do Grow.

export {
  TRATAMENTO_REPOSITORY,
  PRODUTO_REPOSITORY,
  REGISTRO_DE_USO_REPOSITORY,
  SESSAO_REPOSITORY,
  SINTOMA_DIARIO_REPOSITORY,
  EFEITO_REPOSITORY,
  MODELO_DE_TRATAMENTO_REPOSITORY,
} from './lib/ports/med.repositories';
export type {
  TratamentoRepository,
  ProdutoRepository,
  RegistroDeUsoRepository,
  SessaoAntesDepoisRepository,
  SintomaDiarioRepository,
  EfeitoRepository,
  ModeloDeTratamentoRepository,
} from './lib/ports/med.repositories';

export {
  CriarTratamentoUseCase,
  ListarTratamentosUseCase,
  ObterTratamentoUseCase,
  AtualizarTratamentoUseCase,
  EncerrarTratamentoUseCase,
  RemoverTratamentoUseCase,
  buscarTratamentoDoDono,
  paraTratamentoView,
} from './lib/use-cases/tratamento.use-cases';
export type {
  TratamentoView,
  CriarTratamentoInput,
  AtualizarTratamentoInput,
} from './lib/use-cases/tratamento.use-cases';

export {
  CriarProdutoUseCase,
  ListarProdutosDoTratamentoUseCase,
  ObterProdutoUseCase,
  AtualizarProdutoUseCase,
  RemoverProdutoUseCase,
  paraProdutoView,
} from './lib/use-cases/produto.use-cases';
export type {
  ProdutoView,
  CriarProdutoInput,
  AtualizarProdutoInput,
} from './lib/use-cases/produto.use-cases';

export {
  RegistrarUsoUseCase,
  ListarUsosDoProdutoUseCase,
  ListarUsosDoTratamentoUseCase,
  ObterUsoUseCase,
  paraRegistroDeUsoView,
} from './lib/use-cases/registro-uso.use-cases';
export type { RegistroDeUsoView, RegistrarUsoInput } from './lib/use-cases/registro-uso.use-cases';

export {
  RegistrarSessaoAntesUseCase,
  RegistrarSessaoDepoisUseCase,
  ObterSessaoUseCase,
  paraSessaoView,
} from './lib/use-cases/sessao.use-cases';
export type { SessaoView, RegistrarSessaoAntesInput } from './lib/use-cases/sessao.use-cases';

export {
  RegistrarSintomaDiarioUseCase,
  ListarSintomasDiariosUseCase,
  paraSintomaDiarioView,
} from './lib/use-cases/sintoma-diario.use-cases';
export type {
  SintomaDiarioView,
  RegistrarSintomaDiarioInput,
} from './lib/use-cases/sintoma-diario.use-cases';

export {
  RegistrarEfeitoUseCase,
  ListarEfeitosDaDoseUseCase,
  paraEfeitoView,
} from './lib/use-cases/efeito.use-cases';
export type { EfeitoView, RegistrarEfeitoInput } from './lib/use-cases/efeito.use-cases';

export { ObterEvolucaoUseCase, GerarRelatorioUseCase } from './lib/use-cases/evolucao.use-cases';
export type { ReposDeEvolucao, RelatorioClinicoView } from './lib/use-cases/evolucao.use-cases';
// Reexportado do domínio: é o tipo de retorno público da evolução.
export type { EvolucaoClinica } from '@cosmaria/med-domain';

export {
  CriarModeloDeTratamentoUseCase,
  ListarModelosDeTratamentoUseCase,
  RemoverModeloDeTratamentoUseCase,
  paraModeloDeTratamentoView,
} from './lib/use-cases/modelo-de-tratamento.use-cases';
export type {
  ModeloDeTratamentoView,
  CriarModeloDeTratamentoInput,
} from './lib/use-cases/modelo-de-tratamento.use-cases';
