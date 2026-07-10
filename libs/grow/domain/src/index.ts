// @cosmaria/grow-domain — Domínio do COSMARIA Grow (doc 02, doc 08 §12.2, doc 14).
// Puro: sem framework, sem SDK externo (enforçado pelo eslint, doc 14 §6).
//
// Do Core, importa apenas o SHARED KERNEL (DomainEvent, DomainError, AcessoNegadoError):
// contratos técnicos comuns a todos os bounded contexts. Capacidades de negócio do Core
// (privacidade, premium, mídia, complexidade) chegam sempre pelas interfaces públicas.

export {
  FaseDeVida,
  ehFaseDeVidaValida,
  ordemDaFase,
  transicaoDeFasePermitida,
  TipoDeGenetica,
  ehTipoDeGeneticaValido,
  TipoDeAmbiente,
  ehTipoDeAmbienteValido,
  OrigemDoMaterial,
  ehOrigemDoMaterialValida,
} from './lib/catalogos';

export { Genetica } from './lib/genetica.entity';
export type { GeneticaProps } from './lib/genetica.entity';
export { Ambiente } from './lib/ambiente.entity';
export type { AmbienteProps } from './lib/ambiente.entity';
export { CicloCultivo } from './lib/ciclo-cultivo.entity';
export type { CicloCultivoProps, TransicaoDeFase } from './lib/ciclo-cultivo.entity';
export { Planta } from './lib/planta.entity';
export type { PlantaProps } from './lib/planta.entity';

export {
  CicloCriado,
  CicloFinalizado,
  PlantaCriada,
  PlantaFaseAlterada,
} from './lib/eventos/grow.events';

export {
  GeneticaNaoEncontradaError,
  AmbienteNaoEncontradoError,
  CicloNaoEncontradoError,
  PlantaNaoEncontradaError,
  CicloEncerradoError,
  TransicaoDeFaseInvalidaError,
  AmbienteComCiclosError,
  GeneticaEmUsoError,
} from './lib/errors/grow.errors';
