import { arredondar } from '../clima/calculos-ambientais';
import type { CicloCultivo } from '../ciclo-cultivo.entity';
import type { FaseDeVida } from '../catalogos';
import type { Colheita } from '../pos-colheita/colheita.entity';
import type { Lote } from '../pos-colheita/lote.entity';
import type { EventoSanidade } from '../eventos-de-cultivo/evento-sanidade.entity';

/**
 * Motor de Estatísticas do Grow (doc 02 §5.12/§6).
 *
 * É um **motor de agregação de leitura**, determinístico, sobre os módulos já existentes —
 * nunca uma nova fonte de verdade persistida. Transforma o histórico do ciclo em métricas
 * padronizadas e comparáveis. A camada de IA (doc 05) constrói correlações/previsões por
 * cima disto; aqui não há juízo, só contagem e média.
 */

const UM_DIA_MS = 86_400_000;

/** Médias ambientais do ciclo. Cada média ignora medições ausentes (AVG do SQL). */
export interface ResumoAmbiental {
  totalRegistros: number;
  temperaturaMedia: number | null;
  umidadeMedia: number | null;
  vpdMedio: number | null;
  dliMedio: number | null;
  phMedio: number | null;
  ecMedio: number | null;
}

/** Incidência de problemas sanitários — a "incidência de problemas" do doc 02 §5.12. */
export interface ResumoSanidade {
  total: number;
  abertos: number;
  resolvidos: number;
}

/** Rendimento consolidado do ciclo (todas as colheitas escalonadas somadas). */
export interface ResumoColheita {
  totalColheitas: number;
  totalLotes: number;
  totalPlantasColhidas: number;
  pesoUmidoTotalGramas: number;
  pesoSecoTotalGramas: number;
  /** Rendimento seco por planta colhida — a métrica comparável entre ciclos. */
  gramasPorPlanta: number | null;
}

export interface DuracaoDeFase {
  fase: FaseDeVida;
  dias: number;
}

/** O relatório completo de um ciclo (doc 09 `GET /v1/ciclos/{id}/relatorio`). */
export interface EstatisticasDeCiclo {
  cicloId: string;
  nome: string;
  ativo: boolean;
  iniciadoEm: Date;
  encerradoEm: Date | null;
  duracaoTotalDias: number;
  totalPlantas: number;
  totalManejos: number;
  duracaoDasFasesEmDias: DuracaoDeFase[];
  ambiente: ResumoAmbiental;
  sanidade: ResumoSanidade;
  colheita: ResumoColheita;
}

/** Insumos já buscados pelos repositórios, prontos para agregar. */
export interface DadosParaEstatisticas {
  totalPlantas: number;
  totalManejos: number;
  ambiente: ResumoAmbiental;
  sanidades: EventoSanidade[];
  colheitas: Colheita[];
  lotes: Lote[];
}

export function resumirSanidade(eventos: EventoSanidade[]): ResumoSanidade {
  const abertos = eventos.filter((e) => !e.estaResolvido()).length;
  return { total: eventos.length, abertos, resolvidos: eventos.length - abertos };
}

export function resumirColheitas(colheitas: Colheita[], lotes: Lote[]): ResumoColheita {
  const totalPlantasColhidas = colheitas.reduce((s, c) => s + c.quantidadeDePlantas(), 0);
  const pesoUmidoTotal = colheitas.reduce((s, c) => s + (c.pesoUmidoGramas ?? 0), 0);
  const pesoSecoTotal = lotes.reduce((s, l) => s + l.pesoSecoGramas, 0);
  return {
    totalColheitas: colheitas.length,
    totalLotes: lotes.length,
    totalPlantasColhidas,
    pesoUmidoTotalGramas: arredondar(pesoUmidoTotal, 2),
    pesoSecoTotalGramas: arredondar(pesoSecoTotal, 2),
    gramasPorPlanta:
      totalPlantasColhidas > 0 ? arredondar(pesoSecoTotal / totalPlantasColhidas, 2) : null,
  };
}

/** Duração total do ciclo em dias — até o encerramento, ou até agora se ainda ativo. */
export function duracaoTotalEmDias(
  iniciadoEm: Date,
  encerradoEm: Date | null,
  agora: Date = new Date(),
): number {
  const fim = encerradoEm ?? agora;
  return arredondar((fim.getTime() - iniciadoEm.getTime()) / UM_DIA_MS, 2);
}

/** Monta o relatório completo de um ciclo a partir do agregado e dos dados já buscados. */
export function montarEstatisticasDeCiclo(
  ciclo: CicloCultivo,
  dados: DadosParaEstatisticas,
  agora: Date = new Date(),
): EstatisticasDeCiclo {
  return {
    cicloId: ciclo.id,
    nome: ciclo.nome,
    ativo: ciclo.estaAtivo(),
    iniciadoEm: ciclo.iniciadoEm,
    encerradoEm: ciclo.encerradoEm,
    duracaoTotalDias: duracaoTotalEmDias(ciclo.iniciadoEm, ciclo.encerradoEm, agora),
    totalPlantas: dados.totalPlantas,
    totalManejos: dados.totalManejos,
    duracaoDasFasesEmDias: ciclo.duracaoDasFasesEmDias().map((d) => ({
      fase: d.fase,
      dias: arredondar(d.dias, 2),
    })),
    ambiente: dados.ambiente,
    sanidade: resumirSanidade(dados.sanidades),
    colheita: resumirColheitas(dados.colheitas, dados.lotes),
  };
}

/** Destaques de uma comparação — respondem "qual ciclo foi melhor" sem o cliente recalcular. */
export interface DestaquesDaComparacao {
  maiorRendimentoTotalCicloId: string | null;
  maiorRendimentoPorPlantaCicloId: string | null;
  menorIncidenciaDeProblemasCicloId: string | null;
}

export interface ComparacaoDeCiclos {
  ciclos: EstatisticasDeCiclo[];
  destaques: DestaquesDaComparacao;
}

/**
 * Compara N ciclos lado a lado (doc 02 §5.12). A escolha de "mesma genética / mesmo
 * ambiente / livre" é do chamador (quais ciclos entram); aqui só padronizamos as métricas.
 * Empates resolvem pelo primeiro da lista — a ordem é a que o chamador pediu.
 */
export function compararCiclos(lista: EstatisticasDeCiclo[]): ComparacaoDeCiclos {
  const porMaior = (sel: (e: EstatisticasDeCiclo) => number | null): string | null =>
    lista.reduce<{ id: string; valor: number } | null>((melhor, e) => {
      const valor = sel(e);
      if (valor === null) return melhor;
      if (melhor === null || valor > melhor.valor) return { id: e.cicloId, valor };
      return melhor;
    }, null)?.id ?? null;

  const menorIncidencia =
    lista.reduce<{ id: string; valor: number } | null>((melhor, e) => {
      const valor = e.sanidade.total;
      if (melhor === null || valor < melhor.valor) return { id: e.cicloId, valor };
      return melhor;
    }, null)?.id ?? null;

  return {
    ciclos: lista,
    destaques: {
      maiorRendimentoTotalCicloId: porMaior((e) => e.colheita.pesoSecoTotalGramas || null),
      maiorRendimentoPorPlantaCicloId: porMaior((e) => e.colheita.gramasPorPlanta),
      menorIncidenciaDeProblemasCicloId: menorIncidencia,
    },
  };
}
