import { DirecaoDaCorrelacao, type Fator, NivelDeConfianca } from '../catalogos';
import type { PontoDeSerie } from '../ponto-de-serie.entity';

/**
 * Motor de Correlação (doc 05 §6.1) — puro, determinístico.
 *
 * Calcula força, direção e confiança da correlação entre dois fatores no histórico do
 * usuário. Alinha as duas séries **por dia** (média diária), pareia os dias presentes em
 * ambas e aplica Pearson. Abaixo do volume mínimo, não conclui nada (doc 05 §14 — nunca
 * conclusão precipitada). A *interpretação* é do Motor de Insights; aqui só o número.
 */

const arredondar = (v: number, casas = 3): number => {
  const f = 10 ** casas;
  return Math.round(v * f) / f;
};

/** Chave de dia em UTC (yyyy-mm-dd) — o que alinha séries de fatores diferentes. */
const chaveDoDia = (d: Date): string => d.toISOString().slice(0, 10);

interface DiaAgregado {
  media: number;
  origemIds: string[];
  quando: Date;
}

const agruparPorDia = (pontos: PontoDeSerie[]): Map<string, DiaAgregado> => {
  const acc = new Map<string, { soma: number; n: number; origemIds: string[]; quando: Date }>();
  for (const p of pontos) {
    const chave = chaveDoDia(p.ocorridoEm);
    const atual = acc.get(chave);
    if (atual) {
      atual.soma += p.valor;
      atual.n += 1;
      atual.origemIds.push(p.origemId);
    } else {
      acc.set(chave, { soma: p.valor, n: 1, origemIds: [p.origemId], quando: p.ocorridoEm });
    }
  }
  const out = new Map<string, DiaAgregado>();
  for (const [chave, v] of acc) {
    out.set(chave, { media: v.soma / v.n, origemIds: v.origemIds, quando: v.quando });
  }
  return out;
};

/** Coeficiente de Pearson. Retorna 0 quando alguma série não varia (evita divisão por zero). */
export const pearson = (pares: [number, number][]): number => {
  const n = pares.length;
  if (n < 2) return 0;
  const mediaA = pares.reduce((s, [a]) => s + a, 0) / n;
  const mediaB = pares.reduce((s, [, b]) => s + b, 0) / n;
  let cov = 0;
  let varA = 0;
  let varB = 0;
  for (const [a, b] of pares) {
    const da = a - mediaA;
    const db = b - mediaB;
    cov += da * db;
    varA += da * da;
    varB += db * db;
  }
  if (varA === 0 || varB === 0) return 0;
  return cov / Math.sqrt(varA * varB);
};

const classificarDirecao = (forca: number): DirecaoDaCorrelacao => {
  if (forca >= 0.1) return DirecaoDaCorrelacao.POSITIVA;
  if (forca <= -0.1) return DirecaoDaCorrelacao.NEGATIVA;
  return DirecaoDaCorrelacao.NEUTRA;
};

/** Confiança pela quantidade de dias pareados — mais amostra, mais confiança (nunca certeza). */
const classificarConfianca = (n: number): NivelDeConfianca => {
  if (n >= 30) return NivelDeConfianca.ALTA;
  if (n >= 14) return NivelDeConfianca.MEDIA;
  return NivelDeConfianca.BAIXA;
};

export interface CorrelacaoCalculadaData {
  fatorA: Fator;
  fatorB: Fator;
  /** Coeficiente de Pearson, −1..1 (a apresentação formata como %). */
  forca: number;
  direcao: DirecaoDaCorrelacao;
  confianca: NivelDeConfianca;
  tamanhoAmostra: number;
  periodoInicio: Date;
  periodoFim: Date;
  /** IDs dos registros brutos que originaram a conclusão (rastreabilidade, doc 05 §7.2). */
  origemIds: string[];
}

export interface ResultadoDeCorrelacao {
  suficiente: boolean;
  correlacao: CorrelacaoCalculadaData | null;
  /** Motivo quando insuficiente (ex.: "poucos dias com os dois fatores"). */
  limitacao: string | null;
}

/**
 * Calcula a correlação entre dois fatores. `volumeMinimo` = mínimo de dias pareados para
 * concluir (parte da PoliticaDeAgregacao). Séries de fatores diferentes, mesmo usuário.
 */
export const calcularCorrelacao = (
  fatorA: Fator,
  serieA: PontoDeSerie[],
  fatorB: Fator,
  serieB: PontoDeSerie[],
  volumeMinimo: number,
): ResultadoDeCorrelacao => {
  const diasA = agruparPorDia(serieA);
  const diasB = agruparPorDia(serieB);

  const pares: [number, number][] = [];
  const origemIds: string[] = [];
  let inicio: Date | null = null;
  let fim: Date | null = null;

  for (const [chave, a] of diasA) {
    const b = diasB.get(chave);
    if (!b) continue;
    pares.push([a.media, b.media]);
    origemIds.push(...a.origemIds, ...b.origemIds);
    const quando = a.quando;
    if (!inicio || quando < inicio) inicio = quando;
    if (!fim || quando > fim) fim = quando;
  }

  if (pares.length < volumeMinimo) {
    return {
      suficiente: false,
      correlacao: null,
      limitacao: `Poucos dias com os dois fatores registrados (${pares.length} de ${volumeMinimo} necessários).`,
    };
  }

  const forca = arredondar(pearson(pares));
  return {
    suficiente: true,
    correlacao: {
      fatorA,
      fatorB,
      forca,
      direcao: classificarDirecao(forca),
      confianca: classificarConfianca(pares.length),
      tamanhoAmostra: pares.length,
      periodoInicio: inicio as Date,
      periodoFim: fim as Date,
      origemIds,
    },
    limitacao: null,
  };
};
