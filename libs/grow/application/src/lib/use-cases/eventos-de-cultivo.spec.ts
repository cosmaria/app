import type { IdGenerator } from '@cosmaria/core-application';
import {
  CicloCultivo,
  CicloEncerradoError,
  CicloNaoEncontradoError,
  EventoDeCultivoNaoEncontradoError,
  type EventoManejo,
  type EventoSanidade,
  OrigemDoMaterial,
  Planta,
  PlantaNaoEncontradaError,
  Severidade,
  TipoDeManejo,
  TipoDeSanidade,
} from '@cosmaria/grow-domain';
import type {
  CicloRepository,
  EventoManejoRepository,
  EventoSanidadeRepository,
  PlantaRepository,
} from '../ports/grow.repositories';
import {
  ListarManejosDoCicloUseCase,
  ListarSanidadeDoCicloUseCase,
  RegistrarManejoUseCase,
  RegistrarSanidadeUseCase,
  ResolverSanidadeUseCase,
} from './eventos-de-cultivo.use-cases';

class ManejosFake implements EventoManejoRepository {
  readonly porId = new Map<string, EventoManejo>();
  salvar(e: EventoManejo): Promise<void> {
    this.porId.set(e.id, e);
    return Promise.resolve();
  }
  listarPorCiclo(cicloId: string): Promise<EventoManejo[]> {
    return Promise.resolve([...this.porId.values()].filter((e) => e.cicloId === cicloId));
  }
}

class SanidadesFake implements EventoSanidadeRepository {
  readonly porId = new Map<string, EventoSanidade>();
  salvar(e: EventoSanidade): Promise<void> {
    this.porId.set(e.id, e);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<EventoSanidade | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorCiclo(cicloId: string, apenasAbertos = false): Promise<EventoSanidade[]> {
    return Promise.resolve(
      [...this.porId.values()].filter(
        (e) => e.cicloId === cicloId && (!apenasAbertos || !e.estaResolvido()),
      ),
    );
  }
}

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

const ids = (): IdGenerator => {
  let n = 0;
  return { gerar: () => `e-${++n}` };
};

const montar = () => {
  const manejos = new ManejosFake();
  const sanidades = new SanidadesFake();
  const ciclos = new CiclosFake();
  const plantas = new PlantasFake();

  const ciclo = CicloCultivo.iniciar({
    id: 'c-1',
    usuarioId: 'u-1',
    ambienteId: 'a-1',
    nome: 'Ciclo 1',
  });
  ciclos.porId.set(ciclo.id, ciclo);
  plantas.porId.set(
    'p-1',
    Planta.criar({
      id: 'p-1',
      usuarioId: 'u-1',
      cicloId: 'c-1',
      geneticaId: 'g-1',
      nome: 'Planta 1',
      origem: OrigemDoMaterial.SEMENTE,
    }),
  );

  return {
    manejos,
    sanidades,
    ciclos,
    plantas,
    ciclo,
    registrarManejo: new RegistrarManejoUseCase(manejos, ciclos, plantas, ids()),
    listarManejos: new ListarManejosDoCicloUseCase(manejos, ciclos),
    registrarSanidade: new RegistrarSanidadeUseCase(sanidades, ciclos, plantas, ids()),
    resolverSanidade: new ResolverSanidadeUseCase(sanidades),
    listarSanidades: new ListarSanidadeDoCicloUseCase(sanidades, ciclos),
  };
};

describe('EventoManejo — casos de uso (doc 02 §5.7)', () => {
  it('registra manejo do ciclo inteiro (sem planta)', async () => {
    const c = montar();
    const view = await c.registrarManejo.executar({
      usuarioId: 'u-1',
      cicloId: 'c-1',
      tipo: TipoDeManejo.FERTILIZACAO,
    });
    expect(view.tipo).toBe(TipoDeManejo.FERTILIZACAO);
    expect(view.plantaId).toBeNull();
  });

  it('registra manejo de uma planta específica', async () => {
    const c = montar();
    const view = await c.registrarManejo.executar({
      usuarioId: 'u-1',
      cicloId: 'c-1',
      plantaId: 'p-1',
      tipo: TipoDeManejo.TOPPING,
    });
    expect(view.plantaId).toBe('p-1');
  });

  it('recusa manejo em ciclo encerrado', async () => {
    const c = montar();
    c.ciclo.encerrar();
    await expect(
      c.registrarManejo.executar({ usuarioId: 'u-1', cicloId: 'c-1', tipo: TipoDeManejo.PODA }),
    ).rejects.toThrow(CicloEncerradoError);
  });

  it('recusa planta que não é do ciclo', async () => {
    const c = montar();
    await expect(
      c.registrarManejo.executar({
        usuarioId: 'u-1',
        cicloId: 'c-1',
        plantaId: 'inexistente',
        tipo: TipoDeManejo.PODA,
      }),
    ).rejects.toThrow(PlantaNaoEncontradaError);
  });

  it('ciclo de outro usuário responde igual a inexistente', async () => {
    const c = montar();
    await expect(
      c.registrarManejo.executar({ usuarioId: 'intruso', cicloId: 'c-1', tipo: TipoDeManejo.PODA }),
    ).rejects.toThrow(CicloNaoEncontradoError);
  });

  it('lista os manejos, legível mesmo após o ciclo encerrar', async () => {
    const c = montar();
    await c.registrarManejo.executar({ usuarioId: 'u-1', cicloId: 'c-1', tipo: TipoDeManejo.PODA });
    c.ciclo.encerrar();
    const lista = await c.listarManejos.executar({ usuarioId: 'u-1', cicloId: 'c-1' });
    expect(lista).toHaveLength(1);
  });
});

describe('EventoSanidade — casos de uso (doc 02 §5.8)', () => {
  const problema = {
    usuarioId: 'u-1',
    cicloId: 'c-1',
    tipo: TipoDeSanidade.PRAGA,
    severidade: Severidade.MEDIA,
    descricao: 'ácaros',
  };

  it('registra em aberto', async () => {
    const c = montar();
    const view = await c.registrarSanidade.executar(problema);
    expect(view.resolvido).toBe(false);
    expect(view.resolvidoEm).toBeNull();
  });

  it('resolver marca a data e o tratamento', async () => {
    const c = montar();
    const criado = await c.registrarSanidade.executar(problema);
    const resolvido = await c.resolverSanidade.executar({
      usuarioId: 'u-1',
      eventoId: criado.eventoId,
      tratamentoAplicado: 'óleo de neem',
    });
    expect(resolvido.resolvido).toBe(true);
    expect(resolvido.tratamentoAplicado).toBe('óleo de neem');
  });

  it('resolver é idempotente', async () => {
    const c = montar();
    const criado = await c.registrarSanidade.executar(problema);
    const primeira = await c.resolverSanidade.executar({
      usuarioId: 'u-1',
      eventoId: criado.eventoId,
    });
    const segunda = await c.resolverSanidade.executar({
      usuarioId: 'u-1',
      eventoId: criado.eventoId,
    });
    expect(segunda.resolvidoEm).toBe(primeira.resolvidoEm);
  });

  it('resolver evento de outro usuário responde igual a inexistente', async () => {
    const c = montar();
    const criado = await c.registrarSanidade.executar(problema);
    await expect(
      c.resolverSanidade.executar({ usuarioId: 'intruso', eventoId: criado.eventoId }),
    ).rejects.toThrow(EventoDeCultivoNaoEncontradoError);
  });

  it('resolver funciona mesmo com o ciclo já encerrado', async () => {
    const c = montar();
    const criado = await c.registrarSanidade.executar(problema);
    c.ciclo.encerrar();
    const resolvido = await c.resolverSanidade.executar({
      usuarioId: 'u-1',
      eventoId: criado.eventoId,
    });
    expect(resolvido.resolvido).toBe(true);
  });

  it('filtra só os problemas em aberto', async () => {
    const c = montar();
    const a = await c.registrarSanidade.executar(problema);
    await c.registrarSanidade.executar({ ...problema, severidade: Severidade.ALTA });
    await c.resolverSanidade.executar({ usuarioId: 'u-1', eventoId: a.eventoId });

    const todos = await c.listarSanidades.executar({ usuarioId: 'u-1', cicloId: 'c-1' });
    const abertos = await c.listarSanidades.executar({
      usuarioId: 'u-1',
      cicloId: 'c-1',
      apenasAbertos: true,
    });
    expect(todos).toHaveLength(2);
    expect(abertos).toHaveLength(1);
  });
});
