import type { Alerta } from '../alertas/alerta';
import type { DominioDeDado } from '../catalogos';
import type { Insight } from '../insights/insight';
import type { Recomendacao } from '../recomendacoes/recomendacao';

/**
 * Motor de Relatórios da IA (doc 05 §6.6) — o CONTEÚDO analítico (`DigestAnalitico`), não o
 * documento final. Reúne insights, alertas e recomendações do período. O Motor de Relatórios
 * do Core (doc 04) renderiza/exporta — os dois motores de mesmo nome são complementares.
 *
 * Inclui o estado de cold-start (doc 05 §8): quando o histórico próprio é insuficiente, o
 * digest sinaliza isso explicitamente em vez de silêncio — nunca apresenta agregado como
 * pessoal (agregados anonimizados são Versão 2).
 */

/**
 * Disclaimer legal da IA (doc 05 §10). Rascunho aprovado como direção de conteúdo,
 * **Pendente de Revisão Jurídica** antes do lançamento. Anexado a todo digest.
 */
export const DISCLAIMER_IA =
  'As análises, correlações e sugestões da COSMARIA são geradas a partir do seu próprio ' +
  'histórico de registros e ajudam a interpretar padrões já existentes nele. Não constituem ' +
  'diagnóstico, prescrição ou orientação profissional, e não substituem a avaliação de um ' +
  'médico, agrônomo ou outro profissional habilitado. Toda análise indica seu nível de ' +
  'confiança e suas limitações — nenhuma conclusão é uma certeza absoluta.';

export const MENSAGEM_COLD_START =
  'Você ainda tem poucos registros para este domínio. As análises ficam mais ricas e ' +
  'confiáveis conforme você continua registrando — por enquanto, elas podem estar incompletas.';

export interface DigestAnalitico {
  dominio: DominioDeDado;
  geradoEm: string;
  /** Histórico próprio insuficiente — o digest está incompleto de propósito (doc 05 §8). */
  coldStart: boolean;
  mensagemColdStart: string | null;
  insights: Insight[];
  alertas: Alerta[];
  recomendacoes: Recomendacao[];
  disclaimer: string;
}

export const montarDigest = (params: {
  dominio: DominioDeDado;
  coldStart: boolean;
  insights: Insight[];
  alertas: Alerta[];
  recomendacoes: Recomendacao[];
}): DigestAnalitico => ({
  dominio: params.dominio,
  geradoEm: new Date().toISOString(),
  coldStart: params.coldStart,
  mensagemColdStart: params.coldStart ? MENSAGEM_COLD_START : null,
  insights: params.insights,
  alertas: params.alertas,
  recomendacoes: params.recomendacoes,
  disclaimer: DISCLAIMER_IA,
});
