import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import type { DomainEvent } from '@cosmaria/core-domain';
import {
  CicloCultivo,
  CicloEncerradoError,
  CicloNaoEncontradoError,
  OrigemDoMaterial,
  Planta,
  PlantaNaoEncontradaError,
  StatusDaTarefa,
  Tarefa,
  TarefaConcluida,
  TarefaCriada,
  TarefaNaoEncontradaError,
  TipoDeTarefa,
} from '@cosmaria/grow-domain';
import type {
  CicloRepository,
  FiltroDeTarefas,
  PlantaRepository,
  TarefaRepository,
} from '../ports/grow.repositories';
import {
  AtualizarTarefaUseCase,
  ConcluirTarefaUseCase,
  CriarTarefaUseCase,
  ListarTarefasUseCase,
} from './tarefa.use-cases';

class CiclosFake implements CicloRepository {
  readonly porId = new Map<string, CicloCultivo>();
  salvar(c: CicloCultivo): Promise<void> {
    this.porId.set(c.id, c);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<CicloCultivo | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorUsuario(): Promise<CicloCultivo[]> {
    return Promise.resolve([...this.porId.values()]);
  }
}

class PlantasFake implements PlantaRepository {
  readonly porId = new Map<string, Planta>();
  salvar(p: Planta): Promise<void> {
    this.porId.set(p.id, p);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Planta | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorCiclo(cicloId: string): Promise<Planta[]> {
    return Promise.resolve([...this.porId.values()].filter((p) => p.cicloId === cicloId));
  }
}

class TarefasFake implements TarefaRepository {
  readonly porId = new Map<string, Tarefa>();
  salvar(t: Tarefa): Promise<void> {
    this.porId.set(t.id, t);
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
          (!filtro?.apenasPendentes || t.status === StatusDaTarefa.PENDENTE),
      ),
    );
  }
}

class EventosFake implements EventPublisher {
  readonly publicados: DomainEvent[] = [];
  publicar(e: DomainEvent): Promise<void> {
    this.publicados.push(e);
    return Promise.resolve();
  }
}

const idSeq = (): IdGenerator => {
  let n = 0;
  return { gerar: () => `id-${++n}` };
};

const USUARIO = 'u-1';

function montarCiclo(encerrado = false) {
  const ciclos = new CiclosFake();
  const plantas = new PlantasFake();
  const ciclo = CicloCultivo.iniciar({
    id: 'c-1',
    usuarioId: USUARIO,
    ambienteId: 'a-1',
    nome: 'Ciclo 1',
  });
  if (encerrado) ciclo.encerrar();
  ciclos.porId.set(ciclo.id, ciclo);
  plantas.porId.set(
    'p-1',
    Planta.criar({
      id: 'p-1',
      usuarioId: USUARIO,
      cicloId: 'c-1',
      geneticaId: 'g-1',
      nome: 'P1',
      origem: OrigemDoMaterial.SEMENTE,
    }),
  );
  return { ciclos, plantas };
}

describe('Tarefas — casos de uso', () => {
  describe('CriarTarefa', () => {
    it('cria tarefa e publica TarefaCriada', async () => {
      const { ciclos, plantas } = montarCiclo();
      const tarefas = new TarefasFake();
      const eventos = new EventosFake();
      const uc = new CriarTarefaUseCase(tarefas, ciclos, plantas, idSeq(), eventos);

      const view = await uc.executar({
        usuarioId: USUARIO,
        cicloId: 'c-1',
        titulo: 'Regar',
        tipo: TipoDeTarefa.REGA,
      });

      expect(view.status).toBe(StatusDaTarefa.PENDENTE);
      expect((eventos.publicados[0] as TarefaCriada).nome).toBe('TarefaCriada');
    });

    it('recusa planta que não é do ciclo', async () => {
      const { ciclos, plantas } = montarCiclo();
      const uc = new CriarTarefaUseCase(
        new TarefasFake(),
        ciclos,
        plantas,
        idSeq(),
        new EventosFake(),
      );
      await expect(
        uc.executar({
          usuarioId: USUARIO,
          cicloId: 'c-1',
          plantaId: 'p-99',
          titulo: 'Podar',
          tipo: TipoDeTarefa.PODA,
        }),
      ).rejects.toThrow(PlantaNaoEncontradaError);
    });

    it('recusa criar tarefa em ciclo encerrado', async () => {
      const { ciclos, plantas } = montarCiclo(true);
      const uc = new CriarTarefaUseCase(
        new TarefasFake(),
        ciclos,
        plantas,
        idSeq(),
        new EventosFake(),
      );
      await expect(
        uc.executar({
          usuarioId: USUARIO,
          cicloId: 'c-1',
          titulo: 'Regar',
          tipo: TipoDeTarefa.REGA,
        }),
      ).rejects.toThrow(CicloEncerradoError);
    });

    it('ciclo de outro usuário responde como inexistente', async () => {
      const { ciclos, plantas } = montarCiclo();
      const uc = new CriarTarefaUseCase(
        new TarefasFake(),
        ciclos,
        plantas,
        idSeq(),
        new EventosFake(),
      );
      await expect(
        uc.executar({ usuarioId: 'intruso', cicloId: 'c-1', titulo: 'x', tipo: TipoDeTarefa.REGA }),
      ).rejects.toThrow(CicloNaoEncontradoError);
    });
  });

  describe('Listar / Atualizar', () => {
    it('lista as tarefas do usuário e filtra só pendentes', async () => {
      const { ciclos, plantas } = montarCiclo();
      const tarefas = new TarefasFake();
      const id = idSeq();
      const criar = new CriarTarefaUseCase(tarefas, ciclos, plantas, id, new EventosFake());
      const t1 = await criar.executar({
        usuarioId: USUARIO,
        cicloId: 'c-1',
        titulo: 'Regar',
        tipo: TipoDeTarefa.REGA,
      });
      await criar.executar({
        usuarioId: USUARIO,
        cicloId: 'c-1',
        titulo: 'Podar',
        tipo: TipoDeTarefa.PODA,
      });
      await new ConcluirTarefaUseCase(tarefas, ciclos, id, new EventosFake()).executar({
        usuarioId: USUARIO,
        tarefaId: t1.tarefaId,
      });

      const todas = await new ListarTarefasUseCase(tarefas).executar({ usuarioId: USUARIO });
      const pendentes = await new ListarTarefasUseCase(tarefas).executar({
        usuarioId: USUARIO,
        apenasPendentes: true,
      });
      expect(todas).toHaveLength(2);
      expect(pendentes).toHaveLength(1);
    });

    it('atualiza o plano', async () => {
      const { ciclos, plantas } = montarCiclo();
      const tarefas = new TarefasFake();
      const id = idSeq();
      const t = await new CriarTarefaUseCase(
        tarefas,
        ciclos,
        plantas,
        id,
        new EventosFake(),
      ).executar({ usuarioId: USUARIO, cicloId: 'c-1', titulo: 'Regar', tipo: TipoDeTarefa.REGA });
      const atualizada = await new AtualizarTarefaUseCase(tarefas).executar({
        usuarioId: USUARIO,
        tarefaId: t.tarefaId,
        titulo: 'Regar bem',
      });
      expect(atualizada.titulo).toBe('Regar bem');
    });

    it('tarefa inexistente responde como não encontrada', async () => {
      await expect(
        new AtualizarTarefaUseCase(new TarefasFake()).executar({
          usuarioId: USUARIO,
          tarefaId: 'nao-existe',
          titulo: 'x',
        }),
      ).rejects.toThrow(TarefaNaoEncontradaError);
    });
  });

  describe('ConcluirTarefa', () => {
    it('conclui, publica TarefaConcluida e não reagenda a pontual', async () => {
      const { ciclos, plantas } = montarCiclo();
      const tarefas = new TarefasFake();
      const id = idSeq();
      const eventos = new EventosFake();
      const t = await new CriarTarefaUseCase(
        tarefas,
        ciclos,
        plantas,
        id,
        new EventosFake(),
      ).executar({
        usuarioId: USUARIO,
        cicloId: 'c-1',
        titulo: 'Transplante',
        tipo: TipoDeTarefa.TRANSPLANTE,
      });

      const r = await new ConcluirTarefaUseCase(tarefas, ciclos, id, eventos).executar({
        usuarioId: USUARIO,
        tarefaId: t.tarefaId,
      });

      expect(r.tarefa.status).toBe(StatusDaTarefa.CONCLUIDA);
      expect(r.proximaTarefa).toBeNull();
      expect(eventos.publicados.some((e) => e instanceof TarefaConcluida)).toBe(true);
    });

    it('tarefa recorrente gera a próxima ocorrência ao concluir', async () => {
      const { ciclos, plantas } = montarCiclo();
      const tarefas = new TarefasFake();
      const id = idSeq();
      const t = await new CriarTarefaUseCase(
        tarefas,
        ciclos,
        plantas,
        id,
        new EventosFake(),
      ).executar({
        usuarioId: USUARIO,
        cicloId: 'c-1',
        titulo: 'Regar',
        tipo: TipoDeTarefa.REGA,
        recorrenciaDias: 2,
      });

      const r = await new ConcluirTarefaUseCase(tarefas, ciclos, id, new EventosFake()).executar({
        usuarioId: USUARIO,
        tarefaId: t.tarefaId,
      });

      expect(r.proximaTarefa).not.toBeNull();
      expect(r.proximaTarefa?.status).toBe(StatusDaTarefa.PENDENTE);
      expect(r.proximaTarefa?.recorrenciaDias).toBe(2);
      // A original concluída + a nova pendente.
      const todas = await new ListarTarefasUseCase(tarefas).executar({ usuarioId: USUARIO });
      expect(todas).toHaveLength(2);
    });

    it('não reagenda uma recorrente se o ciclo já foi encerrado', async () => {
      const { ciclos, plantas } = montarCiclo();
      const tarefas = new TarefasFake();
      const id = idSeq();
      const t = await new CriarTarefaUseCase(
        tarefas,
        ciclos,
        plantas,
        id,
        new EventosFake(),
      ).executar({
        usuarioId: USUARIO,
        cicloId: 'c-1',
        titulo: 'Regar',
        tipo: TipoDeTarefa.REGA,
        recorrenciaDias: 2,
      });
      // Encerra o ciclo depois de criar a tarefa.
      const ciclo = await ciclos.buscarPorId('c-1');
      ciclo?.encerrar();
      await ciclos.salvar(ciclo!);

      const r = await new ConcluirTarefaUseCase(tarefas, ciclos, id, new EventosFake()).executar({
        usuarioId: USUARIO,
        tarefaId: t.tarefaId,
      });
      expect(r.proximaTarefa).toBeNull();
    });

    it('concluir é idempotente — não publica nem reagenda de novo', async () => {
      const { ciclos, plantas } = montarCiclo();
      const tarefas = new TarefasFake();
      const id = idSeq();
      const eventos = new EventosFake();
      const t = await new CriarTarefaUseCase(
        tarefas,
        ciclos,
        plantas,
        id,
        new EventosFake(),
      ).executar({
        usuarioId: USUARIO,
        cicloId: 'c-1',
        titulo: 'Regar',
        tipo: TipoDeTarefa.REGA,
        recorrenciaDias: 2,
      });
      const concluir = new ConcluirTarefaUseCase(tarefas, ciclos, id, eventos);
      await concluir.executar({ usuarioId: USUARIO, tarefaId: t.tarefaId });
      const segunda = await concluir.executar({ usuarioId: USUARIO, tarefaId: t.tarefaId });

      expect(segunda.proximaTarefa).toBeNull();
      // Um único TarefaConcluida, uma única próxima ocorrência.
      expect(eventos.publicados.filter((e) => e instanceof TarefaConcluida)).toHaveLength(1);
    });
  });
});
