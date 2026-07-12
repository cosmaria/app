// @cosmaria/ia-domain — Domínio da IA da COSMARIA (doc 05, doc 14).
// Puro: sem framework, sem SDK externo (enforçado pelo eslint, doc 14 §6).
//
// A IA consome eventos de Grow/Med SEM importar suas classes (proibido por lint): assina
// por NOME de evento e lê o payload por contrato (Catálogo de Domínio). Do Core, só o
// shared kernel (DomainEvent, DomainError).

export {
  DominioDeDado,
  ehDominioDeDadoValido,
  Fator,
  DirecaoDaCorrelacao,
  NivelDeConfianca,
} from './lib/catalogos';

export { PontoDeSerie } from './lib/ponto-de-serie.entity';
export type { PontoDeSerieProps } from './lib/ponto-de-serie.entity';

export { PoliticaDeAgregacao } from './lib/politica-de-agregacao';
export type { ConfiguracaoDeAgregacao } from './lib/politica-de-agregacao';

export { calcularCorrelacao, pearson } from './lib/correlacao/correlacao';
export type { CorrelacaoCalculadaData, ResultadoDeCorrelacao } from './lib/correlacao/correlacao';

export {
  ehRelevante,
  explicar,
  montarInsight,
  rotuloDoFator,
  PARES_CANDIDATOS,
  LIMIAR_DE_RELEVANCIA,
} from './lib/insights/insight';
export type { Insight } from './lib/insights/insight';

export { SeveridadeDeAlerta, avaliarAlerta, REGRAS_PADRAO } from './lib/alertas/alerta';
export type { Alerta, RegraDeAlerta } from './lib/alertas/alerta';

export { recomendar } from './lib/recomendacoes/recomendacao';
export type { Recomendacao } from './lib/recomendacoes/recomendacao';

export { montarDigest, DISCLAIMER_IA, MENSAGEM_COLD_START } from './lib/relatorio/digest';
export type { DigestAnalitico } from './lib/relatorio/digest';

export { CorrelacaoCalculada } from './lib/eventos/ia.events';

export { FatorDesconhecidoError, DominioDeDadoInvalidoError } from './lib/errors/ia.errors';
