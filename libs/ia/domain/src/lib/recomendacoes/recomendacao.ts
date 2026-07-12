import { DominioDeDado, type Fator } from '../catalogos';
import type { Insight } from '../insights/insight';

/**
 * Motor de Recomendações (doc 05 §6.4) — versão básica, sobre o histórico PRÓPRIO.
 *
 * Sugere uma ação a partir de um insight relevante (não só aponta o padrão). Para o Grow, a
 * ação é acionável; para o Med, é sempre NEUTRA e remete ao médico — nunca prescrição (doc
 * 03 §16, disclaimer da IA §10). Agregados anonimizados entre usuários são Versão 2 (doc
 * 05 §20) — aqui, só o que está no próprio histórico.
 */

export interface Recomendacao {
  dominio: DominioDeDado;
  fatorA: Fator;
  fatorB: Fator;
  /** Texto pronto: a explicação do insight + a ação sugerida. */
  texto: string;
  origemIds: string[];
}

export const recomendar = (insight: Insight): Recomendacao => {
  const acao =
    insight.dominio === DominioDeDado.GROW
      ? 'Considere ajustar o manejo para reforçar esse padrão no próximo ciclo.'
      : 'Converse com seu médico antes de mudar qualquer aspecto do seu tratamento com base nisso.';
  return {
    dominio: insight.dominio,
    fatorA: insight.fatorA,
    fatorB: insight.fatorB,
    texto: `${insight.texto} ${acao}`,
    origemIds: insight.origemIds,
  };
};
