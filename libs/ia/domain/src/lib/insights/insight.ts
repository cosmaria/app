import { DirecaoDaCorrelacao, DominioDeDado, Fator, NivelDeConfianca } from '../catalogos';
import type { CorrelacaoCalculadaData } from '../correlacao/correlacao';

/**
 * Motor de Insights (doc 05 §6.2) + Motor de Explicabilidade (doc 05 §6.5/§7) — puros.
 *
 * O Motor de Insights decide se uma correlação vira insight relevante (filtra ruído). O
 * Motor de Explicabilidade é obrigatório: toda saída carrega dados, período, confiança,
 * limitações e o TEMPLATE DE FRASE do doc 05 §7.1 — nunca "a IA acredita que...", nunca
 * linguagem de certeza absoluta (princípio permanente §4.6).
 */

/** Abaixo desta força, a correlação existe mas é fraca demais para virar insight (evita ruído). */
export const LIMIAR_DE_RELEVANCIA = 0.3;

/**
 * Pares de fatores que o Motor de Insights investiga por domínio (doc 05 §13). Novos pares
 * entram aqui sem tocar no motor. Grow tem poucos fatores no MVP; o Med é o mais rico.
 */
export const PARES_CANDIDATOS: Record<DominioDeDado, [Fator, Fator][]> = {
  [DominioDeDado.GROW]: [[Fator.VPD, Fator.DLI]],
  [DominioDeDado.MED]: [
    [Fator.DOSE, Fator.DOR],
    [Fator.DOSE, Fator.HUMOR],
    [Fator.DOSE, Fator.ANSIEDADE],
    [Fator.DOSE, Fator.SONO],
    [Fator.DOSE, Fator.APETITE],
    [Fator.SESSAO_VARIACAO, Fator.DOR],
  ],
};

/** Rótulos legíveis dos fatores (copy final é do doc 11; aqui, o mínimo para a frase). */
const ROTULO: Record<Fator, string> = {
  [Fator.VPD]: 'VPD',
  [Fator.DLI]: 'DLI',
  [Fator.HUMOR]: 'humor',
  [Fator.ANSIEDADE]: 'ansiedade',
  [Fator.DOR]: 'dor',
  [Fator.SONO]: 'sono',
  [Fator.APETITE]: 'apetite',
  [Fator.DOSE]: 'dose',
  [Fator.SESSAO_VARIACAO]: 'variação por sessão',
  [Fator.EFEITO_INTENSIDADE]: 'intensidade do efeito',
};

export const rotuloDoFator = (fator: Fator): string => ROTULO[fator];

/** O Motor de Insights: relevante = correlação não-neutra e forte o bastante. */
export const ehRelevante = (c: CorrelacaoCalculadaData): boolean =>
  c.direcao !== DirecaoDaCorrelacao.NEUTRA && Math.abs(c.forca) >= LIMIAR_DE_RELEVANCIA;

const rotuloConfianca = (n: NivelDeConfianca): string =>
  n === NivelDeConfianca.ALTA ? 'alto' : n === NivelDeConfianca.MEDIA ? 'médio' : 'baixo';

const dataCurta = (d: Date): string => d.toISOString().slice(0, 10);

/**
 * Motor de Explicabilidade — o template de frase obrigatório (doc 05 §7.1). Nunca certeza
 * absoluta: "aproximadamente", sempre com confiança e limitação explícitas.
 */
export const explicar = (c: CorrelacaoCalculadaData): string => {
  const sentido = c.direcao === DirecaoDaCorrelacao.POSITIVA ? 'positiva' : 'negativa';
  const percentual = Math.round(Math.abs(c.forca) * 100);
  const limitacao =
    c.confianca === NivelDeConfianca.BAIXA
      ? ' Limitação: ainda há poucos dias de dados — a análise pode mudar com mais registros.'
      : '';
  return (
    `Com base em ${c.tamanhoAmostra} dias de registros entre ${dataCurta(c.periodoInicio)} e ` +
    `${dataCurta(c.periodoFim)}, foi observada uma correlação ${sentido} de aproximadamente ` +
    `${percentual}% entre ${rotuloDoFator(c.fatorA)} e ${rotuloDoFator(c.fatorB)}, ` +
    `com nível de confiança ${rotuloConfianca(c.confianca)}.${limitacao}`
  );
};

export interface Insight {
  dominio: DominioDeDado;
  fatorA: Fator;
  fatorB: Fator;
  forca: number;
  direcao: DirecaoDaCorrelacao;
  confianca: NivelDeConfianca;
  tamanhoAmostra: number;
  periodoInicio: string;
  periodoFim: string;
  /** A frase pronta do Motor de Explicabilidade (nunca exibir um insight sem ela). */
  texto: string;
  /** IDs dos registros brutos de origem — rastreabilidade (doc 05 §7.2). */
  origemIds: string[];
}

/** Enriquece uma correlação relevante num Insight pronto para apresentação (passa pela Explicabilidade). */
export const montarInsight = (dominio: DominioDeDado, c: CorrelacaoCalculadaData): Insight => ({
  dominio,
  fatorA: c.fatorA,
  fatorB: c.fatorB,
  forca: c.forca,
  direcao: c.direcao,
  confianca: c.confianca,
  tamanhoAmostra: c.tamanhoAmostra,
  periodoInicio: c.periodoInicio.toISOString(),
  periodoFim: c.periodoFim.toISOString(),
  texto: explicar(c),
  origemIds: c.origemIds,
});
