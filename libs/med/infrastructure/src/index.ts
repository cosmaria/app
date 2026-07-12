// @cosmaria/med-infrastructure — Adaptadores do Med (doc 14).
// Única camada que fala com o mundo externo (driver pg). O composition root escolhe entre
// Postgres e memória conforme o ambiente.

export {
  InMemoryTratamentoRepository,
  InMemoryProdutoRepository,
  InMemoryRegistroDeUsoRepository,
  InMemorySessaoAntesDepoisRepository,
  InMemorySintomaDiarioRepository,
  InMemoryEfeitoRepository,
  InMemoryModeloDeTratamentoRepository,
} from './lib/in-memory-med.repositories';

export {
  PostgresTratamentoRepository,
  PostgresProdutoRepository,
  PostgresRegistroDeUsoRepository,
  PostgresSessaoAntesDepoisRepository,
  PostgresSintomaDiarioRepository,
  PostgresEfeitoRepository,
  PostgresModeloDeTratamentoRepository,
} from './lib/postgres-med.repositories';
