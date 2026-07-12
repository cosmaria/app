// @cosmaria/ia-infrastructure — Adaptadores da IA (doc 14). Única camada que fala com o
// mundo externo (driver pg). O composition root escolhe entre Postgres e memória.

export { InMemoryPontoDeSerieRepository } from './lib/in-memory-ia.repositories';
export { PostgresPontoDeSerieRepository } from './lib/postgres-ia.repositories';
