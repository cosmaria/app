import { DominioDeDado, Fator } from '../catalogos';
import type { PontoDeSerie } from '../ponto-de-serie.entity';

/**
 * Motor de Alertas (doc 05 §6.3) — puro, DETERMINÍSTICO (não depende de correlação).
 *
 * Verifica o valor mais recente de fatores monitorados contra faixas de referência. É mais
 * urgente que um Insight. Para o Grow, aponta ação corretiva (pode virar Tarefa, doc 02 §8).
 * Para o Med, a mensagem é NEUTRA e remete ao profissional de saúde — nunca orientação
 * clínica (doc 03 §16, disclaimer da IA §10). Faixas por fase (VPD) são evolução futura: a
 * série da IA não carrega a fase, então o MVP usa uma faixa geral.
 */

export enum SeveridadeDeAlerta {
  INFO = 'INFO',
  ATENCAO = 'ATENCAO',
  CRITICO = 'CRITICO',
}

export interface RegraDeAlerta {
  dominio: DominioDeDado;
  fator: Fator;
  /** Faixa saudável [min, max]; `null` = sem limite naquele lado. */
  min: number | null;
  max: number | null;
  severidade: SeveridadeDeAlerta;
  /** Mensagem quando abaixo do mínimo. */
  mensagemAbaixo: string;
  /** Mensagem quando acima do máximo. */
  mensagemAcima: string;
  /** Ação sugerida (Grow: acionável; Med: sempre remete ao médico). */
  sugestaoDeAcao: string;
}

export const REGRAS_PADRAO: RegraDeAlerta[] = [
  {
    dominio: DominioDeDado.GROW,
    fator: Fator.VPD,
    min: 0.4,
    max: 1.6,
    severidade: SeveridadeDeAlerta.ATENCAO,
    mensagemAbaixo: 'VPD abaixo da faixa saudável — umidade alta pode favorecer fungos.',
    mensagemAcima: 'VPD acima da faixa saudável — as plantas podem sofrer estresse hídrico.',
    sugestaoDeAcao: 'Ajuste ventilação/umidade para trazer o VPD à faixa recomendada.',
  },
  {
    dominio: DominioDeDado.GROW,
    fator: Fator.DLI,
    min: 12,
    max: 50,
    severidade: SeveridadeDeAlerta.ATENCAO,
    mensagemAbaixo: 'DLI abaixo do recomendado — as plantas podem estar recebendo pouca luz.',
    mensagemAcima: 'DLI acima do recomendado — risco de estresse por excesso de luz.',
    sugestaoDeAcao: 'Reveja a intensidade/fotoperíodo da iluminação.',
  },
  {
    dominio: DominioDeDado.MED,
    fator: Fator.DOR,
    min: null,
    max: 7,
    severidade: SeveridadeDeAlerta.ATENCAO,
    mensagemAbaixo: '',
    mensagemAcima: 'Você registrou um nível de dor alto no seu último check-in.',
    sugestaoDeAcao: 'Se a dor persistir, considere conversar com seu médico.',
  },
];

export interface Alerta {
  dominio: DominioDeDado;
  fator: Fator;
  valor: number;
  severidade: SeveridadeDeAlerta;
  mensagem: string;
  sugestaoDeAcao: string;
  ocorridoEm: string;
  /** ID do registro bruto que disparou o alerta — rastreabilidade (doc 05 §7.2). */
  origemId: string;
}

/**
 * Avalia uma regra contra o ponto mais recente do fator. Fora da faixa → alerta; dentro
 * (ou sem ponto) → `null`.
 */
export const avaliarAlerta = (regra: RegraDeAlerta, ultimo: PontoDeSerie | null): Alerta | null => {
  if (!ultimo) return null;
  const v = ultimo.valor;
  let mensagem: string | null = null;
  if (regra.max !== null && v > regra.max) {
    mensagem = regra.mensagemAcima;
  } else if (regra.min !== null && v < regra.min) {
    mensagem = regra.mensagemAbaixo;
  }
  if (!mensagem) return null;
  return {
    dominio: regra.dominio,
    fator: regra.fator,
    valor: v,
    severidade: regra.severidade,
    mensagem,
    sugestaoDeAcao: regra.sugestaoDeAcao,
    ocorridoEm: ultimo.ocorridoEm.toISOString(),
    origemId: ultimo.origemId,
  };
};
