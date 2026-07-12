// @cosmaria/comunidade-application — casos de uso e portas da Comunidade (doc 06 / doc 14 §10).

export {
  PUBLICACAO_COMUNIDADE_REPOSITORY,
  type PublicacaoComunidadeRepository,
  type FiltroDeFeed,
  type FiltroDeBusca,
  SEGUIMENTO_REPOSITORY,
  type SeguimentoRepository,
  CURTIDA_REPOSITORY,
  type CurtidaRepository,
  COMENTARIO_REPOSITORY,
  type ComentarioRepository,
  REGISTRO_DE_FORK_REPOSITORY,
  type RegistroDeForkRepository,
  VISUALIZACAO_DE_PERFIL_REPOSITORY,
  type VisualizacaoDePerfilRepository,
  type ContagemDiaria,
} from './lib/ports/comunidade.repositories';
export { ProjetarPublicacaoService } from './lib/projecao/projetar-publicacao.service';
export {
  ObterFeedUseCase,
  ObterPublicacaoUseCase,
  paraPublicacaoView,
  normalizarLimite,
  type PublicacaoView,
} from './lib/use-cases/feed.use-cases';
export { BuscarPublicacoesUseCase } from './lib/use-cases/busca.use-cases';
export {
  SeguirPerfilUseCase,
  DeixarDeSeguirUseCase,
  CurtirPublicacaoUseCase,
  DescurtirPublicacaoUseCase,
  ComentarPublicacaoUseCase,
  ListarComentariosUseCase,
  type ComentarioView,
} from './lib/use-cases/interacao.use-cases';
export {
  ForkarPublicacaoUseCase,
  type ConfiguracaoDeForkView,
} from './lib/use-cases/fork.use-cases';
export { ObterReputacaoUseCase, type ReputacaoView } from './lib/use-cases/reputacao.use-cases';
export {
  RegistrarVisualizacaoDePerfilUseCase,
  ObterEstatisticasDePerfilUseCase,
  type EstatisticasDePerfilView,
} from './lib/use-cases/estatisticas-de-perfil.use-cases';
