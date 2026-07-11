import {
  CicloNaoEncontradoError,
  type ComparacaoDeCiclos,
  ComparacaoSemCiclosError,
  compararCiclos,
  type DestaquesDaComparacao,
  type EstatisticasDeCiclo,
  type Lote,
  montarEstatisticasDeCiclo,
  type ResumoAmbiental,
  type ResumoColheita,
  type ResumoSanidade,
} from '@cosmaria/grow-domain';
import {
  CicloRepository,
  ColheitaRepository,
  CuraRepository,
  EventoManejoRepository,
  EventoSanidadeRepository,
  LoteRepository,
  PlantaRepository,
  RegistroAmbientalRepository,
  SecagemRepository,
} from '../ports/grow.repositories';

export interface RelatorioDoCicloView {
  cicloId: string;
  nome: string;
  ativo: boolean;
  iniciadoEm: string;
  encerradoEm: string | null;
  duracaoTotalDias: number;
  totalPlantas: number;
  totalManejos: number;
  duracaoDasFasesEmDias: { fase: string; dias: number }[];
  ambiente: ResumoAmbiental;
  sanidade: ResumoSanidade;
  colheita: ResumoColheita;
}

const paraRelatorioView = (e: EstatisticasDeCiclo): RelatorioDoCicloView => ({
  cicloId: e.cicloId,
  nome: e.nome,
  ativo: e.ativo,
  iniciadoEm: e.iniciadoEm.toISOString(),
  encerradoEm: e.encerradoEm ? e.encerradoEm.toISOString() : null,
  duracaoTotalDias: e.duracaoTotalDias,
  totalPlantas: e.totalPlantas,
  totalManejos: e.totalManejos,
  duracaoDasFasesEmDias: e.duracaoDasFasesEmDias,
  ambiente: e.ambiente,
  sanidade: e.sanidade,
  colheita: e.colheita,
});

export interface ComparacaoDeCiclosView {
  ciclos: RelatorioDoCicloView[];
  destaques: DestaquesDaComparacao;
}

const paraComparacaoView = (c: ComparacaoDeCiclos): ComparacaoDeCiclosView => ({
  ciclos: c.ciclos.map(paraRelatorioView),
  destaques: c.destaques,
});

/**
 * Conjunto de repositórios que o Motor de Estatísticas lê. Agrupá-los evita listar nove
 * dependências em cada assinatura — o motor cruza praticamente todos os agregados do Grow.
 */
export interface ReposDeEstatisticas {
  ciclos: CicloRepository;
  plantas: PlantaRepository;
  manejos: EventoManejoRepository;
  sanidades: EventoSanidadeRepository;
  registros: RegistroAmbientalRepository;
  colheitas: ColheitaRepository;
  secagens: SecagemRepository;
  curas: CuraRepository;
  lotes: LoteRepository;
}

/** Resolve os lotes de um ciclo andando Colheita → Secagem → Cura → Lote. */
async function lotesDoCiclo(repos: ReposDeEstatisticas, cicloId: string): Promise<Lote[]> {
  const colheitas = await repos.colheitas.listarPorCiclo(cicloId);
  const lotes: Lote[] = [];
  for (const colheita of colheitas) {
    const secagem = await repos.secagens.buscarPorColheita(colheita.id);
    if (!secagem) continue;
    const cura = await repos.curas.buscarPorSecagem(secagem.id);
    if (!cura) continue;
    const lote = await repos.lotes.buscarPorCura(cura.id);
    if (lote) lotes.push(lote);
  }
  return lotes;
}

/** Coleta e agrega as estatísticas de um único ciclo, conferindo a posse. */
async function estatisticasDeUmCiclo(
  repos: ReposDeEstatisticas,
  usuarioId: string,
  cicloId: string,
): Promise<EstatisticasDeCiclo> {
  const ciclo = await repos.ciclos.buscarPorId(cicloId);
  if (!ciclo || !ciclo.pertenceA(usuarioId)) {
    throw new CicloNaoEncontradoError();
  }
  const [plantas, manejos, ambiente, sanidades, colheitas, lotes] = await Promise.all([
    repos.plantas.listarPorCiclo(cicloId),
    repos.manejos.listarPorCiclo(cicloId),
    repos.registros.resumoAmbientalPorCiclo(cicloId),
    repos.sanidades.listarPorCiclo(cicloId),
    repos.colheitas.listarPorCiclo(cicloId),
    lotesDoCiclo(repos, cicloId),
  ]);
  return montarEstatisticasDeCiclo(ciclo, {
    totalPlantas: plantas.length,
    totalManejos: manejos.length,
    ambiente,
    sanidades,
    colheitas,
    lotes,
  });
}

/** `GET /v1/ciclos/{id}/relatorio` (doc 09, API-3) — o relatório determinístico do ciclo. */
export class ObterRelatorioDoCicloUseCase {
  constructor(private readonly repos: ReposDeEstatisticas) {}

  async executar(input: { usuarioId: string; cicloId: string }): Promise<RelatorioDoCicloView> {
    const estatisticas = await estatisticasDeUmCiclo(this.repos, input.usuarioId, input.cicloId);
    return paraRelatorioView(estatisticas);
  }
}

/**
 * `GET /v1/estatisticas/comparar-ciclos?ids=` (doc 02 §5.12) — comparação lado a lado.
 * A escolha de quais ciclos (mesma genética, mesmo ambiente ou livre) é do cliente; aqui
 * só padronizamos as métricas. Qualquer ciclo que não seja do usuário responde como
 * inexistente — não confirmamos a existência de recurso alheio.
 */
export class CompararCiclosUseCase {
  constructor(private readonly repos: ReposDeEstatisticas) {}

  async executar(input: {
    usuarioId: string;
    cicloIds: string[];
  }): Promise<ComparacaoDeCiclosView> {
    const ids = [...new Set(input.cicloIds)];
    if (ids.length === 0) {
      throw new ComparacaoSemCiclosError();
    }
    const estatisticas = await Promise.all(
      ids.map((cicloId) => estatisticasDeUmCiclo(this.repos, input.usuarioId, cicloId)),
    );
    return paraComparacaoView(compararCiclos(estatisticas));
  }
}
