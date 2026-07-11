import type {
  AmbienteRepository,
  CicloRepository,
  ColheitaRepository,
  CuraRepository,
  DadosClimaticosRepository,
  EventoManejoRepository,
  EventoSanidadeRepository,
  FiltroDeTarefas,
  GeneticaRepository,
  LoteRepository,
  PaginaDeRegistros,
  PlantaRepository,
  RegistroAmbientalRepository,
  SecagemRepository,
  TarefaRepository,
} from '@cosmaria/grow-application';
import { arredondar } from '@cosmaria/grow-domain';
import type {
  Ambiente,
  CicloCultivo,
  Colheita,
  Cura,
  DadosClimaticos,
  EventoManejo,
  EventoSanidade,
  Genetica,
  Lote,
  Planta,
  RegistroAmbiental,
  ResumoAmbiental,
  Secagem,
  Tarefa,
} from '@cosmaria/grow-domain';

/** Média de um campo opcional ignorando ausências — o mesmo que o AVG do SQL faz. */
const media = (valores: (number | null)[]): number | null => {
  const presentes = valores.filter((v): v is number => v !== null);
  if (presentes.length === 0) return null;
  return arredondar(presentes.reduce((s, v) => s + v, 0) / presentes.length, 2);
};

/**
 * Repositórios do Grow em memória — mesmas portas do Postgres (LSP, doc 04 §4).
 *
 * `possuiPlantas`/`possuiCiclos` cruzam agregados, então os repositórios precisam
 * enxergar uns aos outros. Em vez de um singleton global, o composition root injeta os
 * "vizinhos" explicitamente — o mesmo que o Postgres faz com um `EXISTS`.
 */
export class InMemoryGeneticaRepository implements GeneticaRepository {
  private readonly porId = new Map<string, Genetica>();
  private plantas: InMemoryPlantaRepository | null = null;

  /** Ligação tardia: o repositório de plantas é criado depois deste. */
  conectarPlantas(plantas: InMemoryPlantaRepository): void {
    this.plantas = plantas;
  }

  salvar(g: Genetica): Promise<void> {
    this.porId.set(g.id, g);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Genetica | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorUsuario(usuarioId: string): Promise<Genetica[]> {
    return Promise.resolve([...this.porId.values()].filter((g) => g.usuarioId === usuarioId));
  }
  remover(id: string): Promise<void> {
    this.porId.delete(id);
    return Promise.resolve();
  }
  possuiPlantas(geneticaId: string): Promise<boolean> {
    return Promise.resolve(this.plantas?.existeComGenetica(geneticaId) ?? false);
  }
}

export class InMemoryAmbienteRepository implements AmbienteRepository {
  private readonly porId = new Map<string, Ambiente>();
  private ciclos: InMemoryCicloRepository | null = null;

  conectarCiclos(ciclos: InMemoryCicloRepository): void {
    this.ciclos = ciclos;
  }

  salvar(a: Ambiente): Promise<void> {
    this.porId.set(a.id, a);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Ambiente | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorUsuario(usuarioId: string): Promise<Ambiente[]> {
    return Promise.resolve([...this.porId.values()].filter((a) => a.usuarioId === usuarioId));
  }
  remover(id: string): Promise<void> {
    this.porId.delete(id);
    return Promise.resolve();
  }
  contarPorUsuario(usuarioId: string): Promise<number> {
    return Promise.resolve(
      [...this.porId.values()].filter((a) => a.usuarioId === usuarioId).length,
    );
  }
  possuiCiclos(ambienteId: string): Promise<boolean> {
    return Promise.resolve(this.ciclos?.existeNoAmbiente(ambienteId) ?? false);
  }
}

export class InMemoryCicloRepository implements CicloRepository {
  private readonly porId = new Map<string, CicloCultivo>();

  salvar(c: CicloCultivo): Promise<void> {
    this.porId.set(c.id, c);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<CicloCultivo | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorUsuario(usuarioId: string, apenasAtivos = false): Promise<CicloCultivo[]> {
    return Promise.resolve(
      [...this.porId.values()]
        .filter((c) => c.usuarioId === usuarioId && (!apenasAtivos || c.estaAtivo()))
        .sort((a, b) => b.iniciadoEm.getTime() - a.iniciadoEm.getTime()),
    );
  }

  /** Consulta interna usada pelo repositório de ambientes. */
  existeNoAmbiente(ambienteId: string): boolean {
    return [...this.porId.values()].some((c) => c.ambienteId === ambienteId);
  }
}

export class InMemoryPlantaRepository implements PlantaRepository {
  private readonly porId = new Map<string, Planta>();

  salvar(p: Planta): Promise<void> {
    this.porId.set(p.id, p);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Planta | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorCiclo(cicloId: string): Promise<Planta[]> {
    return Promise.resolve(
      [...this.porId.values()]
        .filter((p) => p.cicloId === cicloId)
        .sort((a, b) => a.criadoEm.getTime() - b.criadoEm.getTime()),
    );
  }

  /** Consulta interna usada pelo repositório de genéticas. */
  existeComGenetica(geneticaId: string): boolean {
    return [...this.porId.values()].some((p) => p.geneticaId === geneticaId);
  }
}

/** Série temporal em memória. Append-only, como a porta exige. */
export class InMemoryRegistroAmbientalRepository implements RegistroAmbientalRepository {
  private readonly porId = new Map<string, RegistroAmbiental>();

  salvar(registro: RegistroAmbiental): Promise<void> {
    this.porId.set(registro.id, registro);
    return Promise.resolve();
  }

  buscarPorId(id: string): Promise<RegistroAmbiental | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }

  listarPorCiclo(
    cicloId: string,
    parametros: { limite: number; deslocamento: number },
  ): Promise<PaginaDeRegistros> {
    const doCiclo = [...this.porId.values()]
      .filter((r) => r.cicloId === cicloId)
      .sort((a, b) => b.registradoEm.getTime() - a.registradoEm.getTime());

    return Promise.resolve({
      itens: doCiclo.slice(parametros.deslocamento, parametros.deslocamento + parametros.limite),
      total: doCiclo.length,
    });
  }

  resumoAmbientalPorCiclo(cicloId: string): Promise<ResumoAmbiental> {
    const doCiclo = [...this.porId.values()].filter((r) => r.cicloId === cicloId);
    return Promise.resolve({
      totalRegistros: doCiclo.length,
      temperaturaMedia: media(doCiclo.map((r) => r.temperaturaC)),
      umidadeMedia: media(doCiclo.map((r) => r.umidadeRelativa)),
      vpdMedio: media(doCiclo.map((r) => r.vpdKpa)),
      dliMedio: media(doCiclo.map((r) => r.dli)),
      phMedio: media(doCiclo.map((r) => r.ph)),
      ecMedio: media(doCiclo.map((r) => r.ec)),
    });
  }
}

/** Histórico imutável de manejo em memória. */
export class InMemoryEventoManejoRepository implements EventoManejoRepository {
  private readonly porId = new Map<string, EventoManejo>();

  salvar(evento: EventoManejo): Promise<void> {
    this.porId.set(evento.id, evento);
    return Promise.resolve();
  }

  listarPorCiclo(cicloId: string): Promise<EventoManejo[]> {
    return Promise.resolve(
      [...this.porId.values()]
        .filter((e) => e.cicloId === cicloId)
        .sort((a, b) => b.ocorridoEm.getTime() - a.ocorridoEm.getTime()),
    );
  }
}

export class InMemoryEventoSanidadeRepository implements EventoSanidadeRepository {
  private readonly porId = new Map<string, EventoSanidade>();

  salvar(evento: EventoSanidade): Promise<void> {
    this.porId.set(evento.id, evento);
    return Promise.resolve();
  }

  buscarPorId(id: string): Promise<EventoSanidade | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }

  listarPorCiclo(cicloId: string, apenasAbertos = false): Promise<EventoSanidade[]> {
    return Promise.resolve(
      [...this.porId.values()]
        .filter((e) => e.cicloId === cicloId && (!apenasAbertos || !e.estaResolvido()))
        .sort((a, b) => b.ocorridoEm.getTime() - a.ocorridoEm.getTime()),
    );
  }
}

/** Colheita em memória. Histórico imutável, 0—N por ciclo. */
export class InMemoryColheitaRepository implements ColheitaRepository {
  private readonly porId = new Map<string, Colheita>();

  salvar(colheita: Colheita): Promise<void> {
    this.porId.set(colheita.id, colheita);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Colheita | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorCiclo(cicloId: string): Promise<Colheita[]> {
    return Promise.resolve(
      [...this.porId.values()]
        .filter((c) => c.cicloId === cicloId)
        .sort((a, b) => b.colhidoEm.getTime() - a.colhidoEm.getTime()),
    );
  }
}

/** Secagem em memória. 1—1 com a Colheita. */
export class InMemorySecagemRepository implements SecagemRepository {
  private readonly porId = new Map<string, Secagem>();

  salvar(secagem: Secagem): Promise<void> {
    this.porId.set(secagem.id, secagem);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Secagem | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  buscarPorColheita(colheitaId: string): Promise<Secagem | null> {
    return Promise.resolve(
      [...this.porId.values()].find((s) => s.colheitaId === colheitaId) ?? null,
    );
  }
}

/** Cura em memória. 1—1 com a Secagem. */
export class InMemoryCuraRepository implements CuraRepository {
  private readonly porId = new Map<string, Cura>();

  salvar(cura: Cura): Promise<void> {
    this.porId.set(cura.id, cura);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Cura | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  buscarPorSecagem(secagemId: string): Promise<Cura | null> {
    return Promise.resolve([...this.porId.values()].find((c) => c.secagemId === secagemId) ?? null);
  }
}

/** Lote em memória. 1—1 com a Cura. Puro do Grow. */
export class InMemoryLoteRepository implements LoteRepository {
  private readonly porId = new Map<string, Lote>();

  salvar(lote: Lote): Promise<void> {
    this.porId.set(lote.id, lote);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Lote | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  buscarPorCura(curaId: string): Promise<Lote | null> {
    return Promise.resolve([...this.porId.values()].find((l) => l.curaId === curaId) ?? null);
  }
}

/** Tarefa em memória. Operacional, mutável (upsert por id). */
export class InMemoryTarefaRepository implements TarefaRepository {
  private readonly porId = new Map<string, Tarefa>();

  salvar(tarefa: Tarefa): Promise<void> {
    this.porId.set(tarefa.id, tarefa);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Tarefa | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorUsuario(usuarioId: string, filtro?: FiltroDeTarefas): Promise<Tarefa[]> {
    return Promise.resolve(
      [...this.porId.values()].filter(
        (t) =>
          t.pertenceA(usuarioId) &&
          (!filtro?.cicloId || t.cicloId === filtro.cicloId) &&
          (!filtro?.apenasPendentes || !t.estaConcluida()),
      ),
    );
  }
}

/** Dados climáticos em memória (Módulo Outdoor). 0—1 por ambiente. */
export class InMemoryDadosClimaticosRepository implements DadosClimaticosRepository {
  private readonly porAmbiente = new Map<string, DadosClimaticos>();

  salvar(dados: DadosClimaticos): Promise<void> {
    this.porAmbiente.set(dados.ambienteId, dados);
    return Promise.resolve();
  }
  buscarPorAmbiente(ambienteId: string): Promise<DadosClimaticos | null> {
    return Promise.resolve(this.porAmbiente.get(ambienteId) ?? null);
  }
  remover(ambienteId: string): Promise<void> {
    this.porAmbiente.delete(ambienteId);
    return Promise.resolve();
  }
}
