import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import type { DomainEvent } from '@cosmaria/core-domain';
import {
  type CampoDeComplexidade,
  type ComplexidadePublicApi,
  NivelDeComplexidade,
} from '@cosmaria/core-public-api';
import {
  CicloCultivo,
  CicloEncerradoError,
  CicloNaoEncontradoError,
  OrigemDoMaterial,
  OrigemDoRegistro,
  Planta,
  PlantaNaoEncontradaError,
  type RegistroAmbiental,
  RegistroAmbientalCriado,
  RegistroSemMedicaoError,
  type ResumoAmbiental,
} from '@cosmaria/grow-domain';
import type {
  CicloRepository,
  PaginaDeRegistros,
  PlantaRepository,
  RegistroAmbientalRepository,
} from '../ports/grow.repositories';
import {
  CAMPOS_DO_CHECKIN,
  ListarSerieTemporalUseCase,
  ObterCamposDoCheckInUseCase,
  RegistrarCheckInUseCase,
} from './registro-ambiental.use-cases';

class RegistrosFake implements RegistroAmbientalRepository {
  readonly porId = new Map<string, RegistroAmbiental>();

  salvar(r: RegistroAmbiental): Promise<void> {
    this.porId.set(r.id, r);
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
    return Promise.resolve({
      totalRegistros: [...this.porId.values()].filter((r) => r.cicloId === cicloId).length,
      temperaturaMedia: null,
      umidadeMedia: null,
      vpdMedio: null,
      dliMedio: null,
      phMedio: null,
      ecMedio: null,
    });
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

class EventosFake implements EventPublisher {
  readonly publicados: DomainEvent[] = [];
  publicar(e: DomainEvent): Promise<void> {
    this.publicados.push(e);
    return Promise.resolve();
  }
}

/** Dublê da COMPLEXIDADE_PUBLIC_API — o Grow declara os campos, o Core filtra. */
class ComplexidadeFake implements ComplexidadePublicApi {
  nivel = NivelDeComplexidade.ESSENCIAL;

  obterPreferencia() {
    return Promise.resolve({
      nivel: this.nivel,
      modoEspecialista: this.nivel === NivelDeComplexidade.ESPECIALISTA,
      camposHabilitados: [],
    });
  }
  filtrarCampos(usuarioId: string, campos: CampoDeComplexidade[]): Promise<string[]> {
    const ordem = {
      [NivelDeComplexidade.ESSENCIAL]: 0,
      [NivelDeComplexidade.AVANCADO]: 1,
      [NivelDeComplexidade.ESPECIALISTA]: 2,
    };
    return Promise.resolve(
      campos.filter((c) => ordem[c.nivel] <= ordem[this.nivel]).map((c) => c.codigo),
    );
  }
}

const ids = (): IdGenerator => {
  let n = 0;
  return { gerar: () => `r-${++n}` };
};

const montar = () => {
  const registros = new RegistrosFake();
  const ciclos = new CiclosFake();
  const plantas = new PlantasFake();
  const eventos = new EventosFake();
  const complexidade = new ComplexidadeFake();

  const ciclo = CicloCultivo.iniciar({
    id: 'c-1',
    usuarioId: 'u-1',
    ambienteId: 'a-1',
    nome: 'Ciclo 1',
  });
  ciclos.porId.set(ciclo.id, ciclo);

  const planta = Planta.criar({
    id: 'p-1',
    usuarioId: 'u-1',
    cicloId: 'c-1',
    geneticaId: 'g-1',
    nome: 'Planta 1',
    origem: OrigemDoMaterial.SEMENTE,
  });
  plantas.porId.set(planta.id, planta);

  return {
    registros,
    ciclos,
    plantas,
    eventos,
    complexidade,
    ciclo,
    registrar: new RegistrarCheckInUseCase(registros, ciclos, plantas, ids(), eventos),
    listar: new ListarSerieTemporalUseCase(registros, ciclos),
    campos: new ObterCamposDoCheckInUseCase(complexidade),
  };
};

const checkIn = { usuarioId: 'u-1', cicloId: 'c-1', temperaturaC: 25, umidadeRelativa: 60 };

describe('RegistrarCheckInUseCase (doc 02 §4/§5.6)', () => {
  it('o iniciante registra temperatura e umidade e recebe o VPD de graça', async () => {
    const c = montar();
    const view = await c.registrar.executar(checkIn);

    expect(view.vpdKpa).toBeCloseTo(1.267, 2);
    expect(view.dli).toBeNull();
    expect(view.origem).toBe(OrigemDoRegistro.MANUAL);
  });

  it('calcula o DLI quando o especialista informa PPFD e horas de luz', async () => {
    const c = montar();
    const view = await c.registrar.executar({ ...checkIn, ppfd: 600, horasDeLuz: 18 });
    expect(view.dli).toBeCloseTo(38.88, 2);
  });

  it('publica RegistroAmbientalCriado com os derivados já calculados', async () => {
    const c = montar();
    await c.registrar.executar(checkIn);

    const evento = c.eventos.publicados[0];
    expect(evento).toBeInstanceOf(RegistroAmbientalCriado);
    // A IA não reimplementa as fórmulas do Grow — recebe o resultado pronto.
    expect((evento as RegistroAmbientalCriado).vpdKpa).toBeCloseTo(1.267, 2);
  });

  it('recusa check-in sem nenhuma medição', async () => {
    const c = montar();
    await expect(
      c.registrar.executar({ usuarioId: 'u-1', cicloId: 'c-1', observacoes: 'só um texto' }),
    ).rejects.toThrow(RegistroSemMedicaoError);
    expect(c.registros.porId.size).toBe(0);
  });

  it('recusa escrita em ciclo encerrado — o histórico é fechado', async () => {
    const c = montar();
    c.ciclo.encerrar();
    await expect(c.registrar.executar(checkIn)).rejects.toThrow(CicloEncerradoError);
  });

  it('ciclo de outro usuário responde igual a inexistente', async () => {
    const c = montar();
    await expect(c.registrar.executar({ ...checkIn, usuarioId: 'intruso' })).rejects.toThrow(
      CicloNaoEncontradoError,
    );
  });

  it('aceita medição específica de uma planta do próprio ciclo', async () => {
    const c = montar();
    const view = await c.registrar.executar({ ...checkIn, plantaId: 'p-1', ph: 6.2 });
    expect(view.plantaId).toBe('p-1');
    expect(view.ph).toBe(6.2);
  });

  it('recusa planta que não pertence ao ciclo informado', async () => {
    const c = montar();
    const deOutroCiclo = Planta.criar({
      id: 'p-9',
      usuarioId: 'u-1',
      cicloId: 'c-outro',
      geneticaId: 'g-1',
      nome: 'X',
      origem: OrigemDoMaterial.SEMENTE,
    });
    c.plantas.porId.set(deOutroCiclo.id, deOutroCiclo);

    await expect(c.registrar.executar({ ...checkIn, plantaId: 'p-9' })).rejects.toThrow(
      PlantaNaoEncontradaError,
    );
  });

  it('um registro de sensor declara a própria origem, sem migração de schema', async () => {
    const c = montar();
    const view = await c.registrar.executar({ ...checkIn, origem: OrigemDoRegistro.SENSOR });
    expect(view.origem).toBe(OrigemDoRegistro.SENSOR);
  });
});

describe('ListarSerieTemporalUseCase', () => {
  it('devolve do mais recente ao mais antigo, paginado', async () => {
    const c = montar();
    const base = new Date('2026-07-01T12:00:00Z');
    for (let i = 0; i < 3; i++) {
      await c.registrar.executar({
        ...checkIn,
        registradoEm: new Date(base.getTime() + i * 86_400_000),
        temperaturaC: 20 + i,
      });
    }

    const pagina = await c.listar.executar({ usuarioId: 'u-1', cicloId: 'c-1', limite: 2 });
    expect(pagina.total).toBe(3);
    expect(pagina.itens).toHaveLength(2);
    expect(pagina.itens[0].temperaturaC).toBe(22);
  });

  it('a leitura funciona mesmo em ciclo encerrado — só a escrita fecha', async () => {
    const c = montar();
    await c.registrar.executar(checkIn);
    c.ciclo.encerrar();

    const pagina = await c.listar.executar({ usuarioId: 'u-1', cicloId: 'c-1' });
    expect(pagina.total).toBe(1);
  });

  it('série de ciclo alheio responde igual a inexistente', async () => {
    const c = montar();
    await expect(c.listar.executar({ usuarioId: 'intruso', cicloId: 'c-1' })).rejects.toThrow(
      CicloNaoEncontradoError,
    );
  });
});

describe('ObterCamposDoCheckInUseCase (complexidade progressiva, doc 02 §5.0)', () => {
  it('o iniciante vê só temperatura, umidade e observações', async () => {
    const c = montar();
    const campos = await c.campos.executar('u-1');
    expect(campos).toEqual(['grow.temperatura', 'grow.umidade', 'grow.observacoes']);
  });

  it('o avançado passa a ver pH e EC', async () => {
    const c = montar();
    c.complexidade.nivel = NivelDeComplexidade.AVANCADO;
    const campos = await c.campos.executar('u-1');
    expect(campos).toContain('grow.ec');
    expect(campos).not.toContain('grow.ppfd');
  });

  it('o Modo Especialista libera PPFD, horas de luz e delta da folha', async () => {
    const c = montar();
    c.complexidade.nivel = NivelDeComplexidade.ESPECIALISTA;
    const campos = await c.campos.executar('u-1');
    expect(campos).toHaveLength(CAMPOS_DO_CHECKIN.length);
  });

  it('a ESCRITA nunca é filtrada por nível — um sensor não tem nível', async () => {
    const c = montar();
    // Usuário essencial enviando EC: aceito, porque recusar quebraria integração de sensor.
    const view = await c.registrar.executar({ ...checkIn, ec: 1.8 });
    expect(view.ec).toBe(1.8);
  });
});
