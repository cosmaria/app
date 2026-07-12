import type { EventPublisher } from '@cosmaria/core-application';
import {
  DISCLAIMER_RELATORIO_CLINICO,
  type EvolucaoClinica,
  montarEvolucaoClinica,
  RelatorioGerado,
  type Tratamento,
} from '@cosmaria/med-domain';
import {
  EfeitoRepository,
  ProdutoRepository,
  RegistroDeUsoRepository,
  SessaoAntesDepoisRepository,
  SintomaDiarioRepository,
  TratamentoRepository,
} from '../ports/med.repositories';
import { buscarTratamentoDoDono } from './tratamento.use-cases';

/**
 * Bundle de repositórios que a Evolução Clínica lê (cruza quase todo o histórico do Med).
 * Espelha o `ReposDeEstatisticas` do Grow — o composition root o monta uma vez.
 */
export interface ReposDeEvolucao {
  tratamentos: TratamentoRepository;
  produtos: ProdutoRepository;
  registros: RegistroDeUsoRepository;
  sessoes: SessaoAntesDepoisRepository;
  sintomas: SintomaDiarioRepository;
  efeitos: EfeitoRepository;
}

/** Janela de agregação: [de, ate]. Sem valores = período inteiro do tratamento. */
interface Janela {
  de?: Date;
  ate?: Date;
}

async function montar(
  repos: ReposDeEvolucao,
  tratamento: Tratamento,
  janela: Janela,
): Promise<EvolucaoClinica> {
  // Sem janela explícita, a linha de base cobre o período do próprio tratamento.
  const de = janela.de ?? tratamento.iniciadoEm;
  const ate = janela.ate ?? tratamento.encerradoEm ?? undefined;

  const dentroDaJanela = (d: Date): boolean => (!de || d >= de) && (!ate || d <= ate);

  const [produtos, dosesTodas, sessoesTodas, sintomas, efeitosTodos] = await Promise.all([
    repos.produtos.listarPorTratamento(tratamento.id),
    repos.registros.listarPorTratamento(tratamento.id),
    repos.sessoes.listarPorTratamento(tratamento.id),
    repos.sintomas.listarPorUsuario(tratamento.usuarioId, { de, ate }),
    repos.efeitos.listarPorTratamento(tratamento.id),
  ]);

  // Doses/sessões/efeitos são filtrados pela janela na aplicação (o repo agrega por
  // tratamento; recortar por data aqui evita novas variações de query por período).
  const doses = dosesTodas.filter((d) => dentroDaJanela(d.usadoEm));
  const idsDose = new Set(doses.map((d) => d.id));
  const sessoes = sessoesTodas.filter((s) => idsDose.has(s.registroDeUsoId));
  const efeitos = efeitosTodos.filter((e) => idsDose.has(e.registroDeUsoId));

  return montarEvolucaoClinica({
    tratamentoId: tratamento.id,
    condicao: tratamento.condicao,
    status: tratamento.status,
    de: de ?? null,
    ate: ate ?? null,
    doses,
    produtos,
    sessoes,
    sintomas,
    efeitos,
  });
}

/** `GET /v1/tratamentos/{id}/evolucao` — timeline consolidada do tratamento (doc 03 §5.6). */
export class ObterEvolucaoUseCase {
  constructor(private readonly repos: ReposDeEvolucao) {}

  async executar(input: { usuarioId: string; tratamentoId: string }): Promise<EvolucaoClinica> {
    const tratamento = await buscarTratamentoDoDono(
      this.repos.tratamentos,
      input.usuarioId,
      input.tratamentoId,
    );
    return montar(this.repos, tratamento, {});
  }
}

export interface RelatorioClinicoView extends EvolucaoClinica {
  geradoEm: string;
  disclaimer: string;
}

/**
 * `GET /v1/tratamentos/{id}/relatorio?de=&ate=` — relatório clínico básico exportável
 * (doc 03 §5.7). MVP: agregação estruturada + disclaimer legal; a exportação em PDF e os
 * formatos customizáveis são Premium/Versão 2 (doc 03 §10/§18). Publica `RelatorioGerado`.
 */
export class GerarRelatorioUseCase {
  constructor(
    private readonly repos: ReposDeEvolucao,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: {
    usuarioId: string;
    tratamentoId: string;
    de?: Date;
    ate?: Date;
  }): Promise<RelatorioClinicoView> {
    const tratamento = await buscarTratamentoDoDono(
      this.repos.tratamentos,
      input.usuarioId,
      input.tratamentoId,
    );
    const evolucao = await montar(this.repos, tratamento, { de: input.de, ate: input.ate });
    await this.eventos.publicar(new RelatorioGerado(tratamento.id, tratamento.usuarioId));
    return {
      ...evolucao,
      geradoEm: new Date().toISOString(),
      disclaimer: DISCLAIMER_RELATORIO_CLINICO,
    };
  }
}
