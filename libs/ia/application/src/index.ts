// @cosmaria/ia-application — Casos de uso e portas da IA (doc 05, doc 14).
// Depende do próprio domínio e do shared kernel do Core (IdGenerator, EventPublisher).
// Nunca do interior de Grow/Med — consome os eventos deles por contrato (ver ingestao.service).

export { PONTO_DE_SERIE_REPOSITORY, POLITICA_DE_AGREGACAO } from './lib/ports/ia.repositories';
export {
  VINCULO_GROW_MED_REPOSITORY,
  type VinculoGrowMedRepository,
} from './lib/ports/vinculo-grow-med.repository';
export { RegistrarVinculoGrowMedService } from './lib/use-cases/vinculo-grow-med.service';
export { CalcularCorrelacaoCruzadaUseCase } from './lib/use-cases/correlacao-cruzada.use-cases';
export type { CalcularCorrelacaoCruzadaInput } from './lib/use-cases/correlacao-cruzada.use-cases';
export type { PontoDeSerieRepository, JanelaTemporal } from './lib/ports/ia.repositories';

export { IngerirEventoService } from './lib/use-cases/ingestao.service';

export { CalcularCorrelacaoUseCase } from './lib/use-cases/correlacao.use-cases';
export type { CalcularCorrelacaoInput } from './lib/use-cases/correlacao.use-cases';

export { GerarInsightsUseCase } from './lib/use-cases/insights.use-cases';

export { AvaliarAlertasUseCase } from './lib/use-cases/alertas.use-cases';

export { GerarRecomendacoesUseCase, GerarDigestUseCase } from './lib/use-cases/digest.use-cases';
