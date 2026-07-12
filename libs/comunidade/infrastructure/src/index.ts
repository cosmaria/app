// @cosmaria/comunidade-infrastructure — adaptadores da Comunidade (doc 06 / doc 14 §10).

export {
  InMemoryPublicacaoComunidadeRepository,
  InMemorySeguimentoRepository,
  InMemoryCurtidaRepository,
  InMemoryComentarioRepository,
  InMemoryRegistroDeForkRepository,
  InMemoryVisualizacaoDePerfilRepository,
} from './lib/in-memory-comunidade.repositories';
export {
  PostgresPublicacaoComunidadeRepository,
  PostgresSeguimentoRepository,
  PostgresCurtidaRepository,
  PostgresComentarioRepository,
  PostgresRegistroDeForkRepository,
  PostgresVisualizacaoDePerfilRepository,
} from './lib/postgres-comunidade.repositories';
