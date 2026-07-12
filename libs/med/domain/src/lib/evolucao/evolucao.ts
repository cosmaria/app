import type { Produto } from '../produto.entity';
import type { RegistroDeUso } from '../registro-uso.entity';
import type { SessaoAntesDepois } from '../sessao-antes-depois.entity';
import type { RegistroDeSintomaDiario } from '../sintoma-diario.entity';
import type { RegistroDeEfeito } from '../efeito.entity';

/**
 * Evolução Clínica (doc 03 §5.6) e Relatório básico (doc 03 §5.7).
 *
 * Motor de agregação de **leitura**, sem entidade nem tabela própria: a evolução é derivada
 * on-read do histórico já registrado (mesmo padrão do Motor de Estatísticas do Grow). Aqui
 * o Med **conta e resume** de forma determinística; a *interpretação* clínica (o que melhora,
 * o que piora, previsões) é da IA (doc 03 §8) — nunca desta camada.
 */

/** Média de um campo opcional ignorando ausências — o mesmo que o AVG do SQL faz. */
const media = (valores: (number | null)[]): number | null => {
  const presentes = valores.filter((v): v is number => v !== null);
  if (presentes.length === 0) return null;
  const soma = presentes.reduce((s, v) => s + v, 0);
  return Math.round((soma / presentes.length) * 100) / 100;
};

export interface ResumoDeUso {
  totalDeDoses: number;
  porProduto: { produtoId: string; nome: string; doses: number }[];
}

export interface ResumoDeSessoes {
  total: number;
  finalizadas: number;
  /** Efetividade percebida: média das variações (antes − depois) das sessões finalizadas. */
  variacaoMedia: number | null;
}

export interface ResumoDeSintomas {
  checkins: number;
  humorMedio: number | null;
  ansiedadeMedia: number | null;
  dorMedia: number | null;
  sonoMedio: number | null;
  apetiteMedio: number | null;
}

export interface ResumoDeEfeitos {
  total: number;
  positivos: number;
  adversos: number;
}

export interface EvolucaoClinica {
  tratamentoId: string;
  condicao: string;
  status: string;
  de: string | null;
  ate: string | null;
  uso: ResumoDeUso;
  sessoes: ResumoDeSessoes;
  sintomas: ResumoDeSintomas;
  efeitos: ResumoDeEfeitos;
}

export const resumirUso = (doses: RegistroDeUso[], produtos: Produto[]): ResumoDeUso => {
  const nomePorId = new Map(produtos.map((p) => [p.id, p.nome]));
  const contagem = new Map<string, number>();
  for (const d of doses) {
    contagem.set(d.produtoId, (contagem.get(d.produtoId) ?? 0) + 1);
  }
  return {
    totalDeDoses: doses.length,
    porProduto: [...contagem.entries()]
      .map(([produtoId, dosesDoProduto]) => ({
        produtoId,
        nome: nomePorId.get(produtoId) ?? '',
        doses: dosesDoProduto,
      }))
      .sort((a, b) => b.doses - a.doses),
  };
};

export const resumirSessoes = (sessoes: SessaoAntesDepois[]): ResumoDeSessoes => {
  const finalizadas = sessoes.filter((s) => s.estaFinalizada());
  return {
    total: sessoes.length,
    finalizadas: finalizadas.length,
    variacaoMedia: media(finalizadas.map((s) => s.variacao())),
  };
};

export const resumirSintomas = (sintomas: RegistroDeSintomaDiario[]): ResumoDeSintomas => ({
  checkins: sintomas.length,
  humorMedio: media(sintomas.map((s) => s.humor)),
  ansiedadeMedia: media(sintomas.map((s) => s.ansiedade)),
  dorMedia: media(sintomas.map((s) => s.dor)),
  sonoMedio: media(sintomas.map((s) => s.sono)),
  apetiteMedio: media(sintomas.map((s) => s.apetite)),
});

export const resumirEfeitos = (efeitos: RegistroDeEfeito[]): ResumoDeEfeitos => ({
  total: efeitos.length,
  positivos: efeitos.filter((e) => e.tipo === 'POSITIVO').length,
  adversos: efeitos.filter((e) => e.tipo === 'ADVERSO').length,
});

export interface DadosParaEvolucao {
  tratamentoId: string;
  condicao: string;
  status: string;
  de: Date | null;
  ate: Date | null;
  doses: RegistroDeUso[];
  produtos: Produto[];
  sessoes: SessaoAntesDepois[];
  sintomas: RegistroDeSintomaDiario[];
  efeitos: RegistroDeEfeito[];
}

export const montarEvolucaoClinica = (dados: DadosParaEvolucao): EvolucaoClinica => ({
  tratamentoId: dados.tratamentoId,
  condicao: dados.condicao,
  status: dados.status,
  de: dados.de ? dados.de.toISOString() : null,
  ate: dados.ate ? dados.ate.toISOString() : null,
  uso: resumirUso(dados.doses, dados.produtos),
  sessoes: resumirSessoes(dados.sessoes),
  sintomas: resumirSintomas(dados.sintomas),
  efeitos: resumirEfeitos(dados.efeitos),
});
