import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import {
  CicloNaoEncontradoError,
  type OrigemDaTarefa,
  PlantaNaoEncontradaError,
  type StatusDaTarefa,
  Tarefa,
  TarefaConcluida,
  TarefaCriada,
  TarefaNaoEncontradaError,
  type TipoDeTarefa,
} from '@cosmaria/grow-domain';
import {
  CicloRepository,
  type FiltroDeTarefas,
  PlantaRepository,
  TarefaRepository,
} from '../ports/grow.repositories';

export interface TarefaView {
  tarefaId: string;
  cicloId: string;
  plantaId: string | null;
  titulo: string;
  tipo: TipoDeTarefa;
  origem: OrigemDaTarefa;
  status: StatusDaTarefa;
  previstaPara: string | null;
  recorrenciaDias: number | null;
  recorrente: boolean;
  concluidaEm: string | null;
  criadoEm: string;
}

export const paraTarefaView = (t: Tarefa): TarefaView => ({
  tarefaId: t.id,
  cicloId: t.cicloId,
  plantaId: t.plantaId,
  titulo: t.titulo,
  tipo: t.tipo,
  origem: t.origem,
  status: t.status,
  previstaPara: t.previstaPara ? t.previstaPara.toISOString() : null,
  recorrenciaDias: t.recorrenciaDias,
  recorrente: t.ehRecorrente(),
  concluidaEm: t.concluidaEm ? t.concluidaEm.toISOString() : null,
  criadoEm: t.criadoEm.toISOString(),
});

/**
 * Valida que o ciclo é do usuário, está ativo, e que a planta (se informada) pertence a
 * ele. Mesma guarda do manejo/colheita: criar uma tarefa é uma ação de cultivo.
 */
async function garantirCicloAtivoEPlanta(
  ciclos: CicloRepository,
  plantas: PlantaRepository,
  input: { usuarioId: string; cicloId: string; plantaId?: string | null },
): Promise<void> {
  const ciclo = await ciclos.buscarPorId(input.cicloId);
  if (!ciclo || !ciclo.pertenceA(input.usuarioId)) {
    throw new CicloNaoEncontradoError();
  }
  ciclo.garantirAtivo();

  if (input.plantaId) {
    const planta = await plantas.buscarPorId(input.plantaId);
    if (!planta || !planta.pertenceA(input.usuarioId) || planta.cicloId !== input.cicloId) {
      throw new PlantaNaoEncontradaError();
    }
  }
}

export interface CriarTarefaInput {
  usuarioId: string;
  cicloId: string;
  plantaId?: string | null;
  titulo: string;
  tipo: TipoDeTarefa;
  previstaPara?: Date;
  recorrenciaDias?: number | null;
}

/**
 * `POST /v1/tarefas` (doc 09, API-1). Nasce pendente e manual. Exige ciclo ativo — a
 * origem `IA` (a partir de um `AlertaGerado`) só existe quando a IA existir. Publica
 * `TarefaCriada` (Notificações agenda o lembrete).
 */
export class CriarTarefaUseCase {
  constructor(
    private readonly tarefas: TarefaRepository,
    private readonly ciclos: CicloRepository,
    private readonly plantas: PlantaRepository,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: CriarTarefaInput): Promise<TarefaView> {
    await garantirCicloAtivoEPlanta(this.ciclos, this.plantas, input);
    const tarefa = Tarefa.criar({ id: this.idGen.gerar(), ...input });
    await this.tarefas.salvar(tarefa);
    await this.eventos.publicar(
      new TarefaCriada(
        tarefa.id,
        tarefa.usuarioId,
        tarefa.cicloId,
        tarefa.titulo,
        tarefa.previstaPara,
      ),
    );
    return paraTarefaView(tarefa);
  }
}

/** `GET /v1/tarefas` — do usuário, com filtros opcionais por ciclo e só pendentes. */
export class ListarTarefasUseCase {
  constructor(private readonly tarefas: TarefaRepository) {}

  async executar(input: { usuarioId: string } & FiltroDeTarefas): Promise<TarefaView[]> {
    const lista = await this.tarefas.listarPorUsuario(input.usuarioId, {
      cicloId: input.cicloId,
      apenasPendentes: input.apenasPendentes,
    });
    return lista.map(paraTarefaView);
  }
}

async function buscarDoDono(
  tarefas: TarefaRepository,
  usuarioId: string,
  tarefaId: string,
): Promise<Tarefa> {
  const tarefa = await tarefas.buscarPorId(tarefaId);
  if (!tarefa || !tarefa.pertenceA(usuarioId)) {
    throw new TarefaNaoEncontradaError();
  }
  return tarefa;
}

export interface AtualizarTarefaInput {
  usuarioId: string;
  tarefaId: string;
  titulo?: string;
  tipo?: TipoDeTarefa;
  previstaPara?: Date | null;
  recorrenciaDias?: number | null;
}

/** `PUT /v1/tarefas/{id}` — edita o plano (título, tipo, data, recorrência). */
export class AtualizarTarefaUseCase {
  constructor(private readonly tarefas: TarefaRepository) {}

  async executar(input: AtualizarTarefaInput): Promise<TarefaView> {
    const tarefa = await buscarDoDono(this.tarefas, input.usuarioId, input.tarefaId);
    tarefa.atualizar({
      titulo: input.titulo,
      tipo: input.tipo,
      previstaPara: input.previstaPara,
      recorrenciaDias: input.recorrenciaDias,
    });
    await this.tarefas.salvar(tarefa);
    return paraTarefaView(tarefa);
  }
}

export interface ConcluirTarefaResult {
  tarefa: TarefaView;
  /** Próxima ocorrência, quando a tarefa é recorrente e o ciclo ainda está ativo. */
  proximaTarefa: TarefaView | null;
}

/**
 * `POST /v1/tarefas/{id}/concluir`. Idempotente (concluir de novo não muda nada). Publica
 * `TarefaConcluida` (IA). Se a tarefa é recorrente e o ciclo ainda está ativo, gera a
 * próxima ocorrência — não faz sentido reagendar numa jornada de cultivo já encerrada.
 */
export class ConcluirTarefaUseCase {
  constructor(
    private readonly tarefas: TarefaRepository,
    private readonly ciclos: CicloRepository,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: { usuarioId: string; tarefaId: string }): Promise<ConcluirTarefaResult> {
    const tarefa = await buscarDoDono(this.tarefas, input.usuarioId, input.tarefaId);
    const jaEstavaConcluida = tarefa.estaConcluida();

    tarefa.concluir();
    await this.tarefas.salvar(tarefa);

    // Só publica e reagenda na transição real de pendente → concluída (idempotência).
    if (jaEstavaConcluida) {
      return { tarefa: paraTarefaView(tarefa), proximaTarefa: null };
    }
    await this.eventos.publicar(new TarefaConcluida(tarefa.id, tarefa.usuarioId, tarefa.cicloId));

    let proximaTarefa: TarefaView | null = null;
    if (tarefa.ehRecorrente()) {
      const ciclo = await this.ciclos.buscarPorId(tarefa.cicloId);
      if (ciclo && ciclo.estaAtivo()) {
        const proxima = tarefa.proximaOcorrencia(this.idGen.gerar());
        if (proxima) {
          await this.tarefas.salvar(proxima);
          await this.eventos.publicar(
            new TarefaCriada(
              proxima.id,
              proxima.usuarioId,
              proxima.cicloId,
              proxima.titulo,
              proxima.previstaPara,
            ),
          );
          proximaTarefa = paraTarefaView(proxima);
        }
      }
    }
    return { tarefa: paraTarefaView(tarefa), proximaTarefa };
  }
}
