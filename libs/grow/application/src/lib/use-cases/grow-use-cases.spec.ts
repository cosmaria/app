import { AcessoNegadoError } from '@cosmaria/core-domain';
import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import type { DomainEvent } from '@cosmaria/core-domain';
import {
  ChavesDeLimite,
  LimiteDePlanoAtingidoError,
  type PremiumPublicApi,
} from '@cosmaria/core-public-api';
import {
  Ambiente,
  AmbienteComCiclosError,
  AmbienteNaoEncontradoError,
  type CicloCultivo,
  CicloEncerradoError,
  CicloFinalizado,
  CicloNaoEncontradoError,
  FaseDeVida,
  type Genetica,
  GeneticaEmUsoError,
  GeneticaNaoEncontradaError,
  OrigemDoMaterial,
  type Planta,
  PlantaFaseAlterada,
  PlantaNaoEncontradaError,
  TipoDeAmbiente,
  TipoDeGenetica,
  TransicaoDeFaseInvalidaError,
} from '@cosmaria/grow-domain';
import type {
  AmbienteRepository,
  CicloRepository,
  GeneticaRepository,
  PlantaRepository,
} from '../ports/grow.repositories';
import {
  AtualizarGeneticaUseCase,
  CriarGeneticaUseCase,
  ListarGeneticasUseCase,
  RemoverGeneticaUseCase,
} from './genetica.use-cases';
import {
  CriarAmbienteUseCase,
  ListarAmbientesUseCase,
  RemoverAmbienteUseCase,
} from './ambiente.use-cases';
import {
  AvancarFaseDoCicloUseCase,
  EncerrarCicloUseCase,
  IniciarCicloUseCase,
  ListarCiclosUseCase,
  ObterCicloUseCase,
} from './ciclo.use-cases';
import {
  AdicionarPlantaUseCase,
  AvancarFaseDaPlantaUseCase,
  ListarPlantasDoCicloUseCase,
} from './planta.use-cases';

class GeneticasFake implements GeneticaRepository {
  readonly porId = new Map<string, Genetica>();
  plantas: PlantasFake | null = null;

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
    return Promise.resolve(
      [...(this.plantas?.porId.values() ?? [])].some((p) => p.geneticaId === geneticaId),
    );
  }
}

class AmbientesFake implements AmbienteRepository {
  readonly porId = new Map<string, Ambiente>();
  ciclos: CiclosFake | null = null;

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
    return Promise.resolve(
      [...(this.ciclos?.porId.values() ?? [])].some((c) => c.ambienteId === ambienteId),
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
  listarPorUsuario(usuarioId: string, apenasAtivos = false): Promise<CicloCultivo[]> {
    return Promise.resolve(
      [...this.porId.values()].filter(
        (c) => c.usuarioId === usuarioId && (!apenasAtivos || c.estaAtivo()),
      ),
    );
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
  publicar(evento: DomainEvent): Promise<void> {
    this.publicados.push(evento);
    return Promise.resolve();
  }
  nomes(): string[] {
    return this.publicados.map((e) => e.nome);
  }
}

/** Dublê da PREMIUM_PUBLIC_API — o Grow só conhece este contrato, nunca o Billing. */
class PremiumFake implements PremiumPublicApi {
  limite: number | null = 2;
  readonly chamadas: { chave: string; usoAtual: number }[] = [];

  ehPremium(): Promise<boolean> {
    return Promise.resolve(this.limite === null);
  }
  verificarLimite(usuarioId: string, chave: string, usoAtual: number) {
    this.chamadas.push({ chave, usoAtual });
    const permitido = this.limite === null || usoAtual < this.limite;
    return Promise.resolve({
      chave,
      limite: this.limite,
      permitido,
      planoEfetivo: (this.limite === null ? 'PREMIUM' : 'GRATUITO') as never,
    });
  }
}

const ids = (prefixo: string): IdGenerator => {
  let n = 0;
  return { gerar: () => `${prefixo}-${++n}` };
};

const montar = () => {
  const geneticas = new GeneticasFake();
  const ambientes = new AmbientesFake();
  const ciclos = new CiclosFake();
  const plantas = new PlantasFake();
  geneticas.plantas = plantas;
  ambientes.ciclos = ciclos;

  const eventos = new EventosFake();
  const premium = new PremiumFake();

  return {
    geneticas,
    ambientes,
    ciclos,
    plantas,
    eventos,
    premium,
    criarGenetica: new CriarGeneticaUseCase(geneticas, ids('g')),
    listarGeneticas: new ListarGeneticasUseCase(geneticas),
    atualizarGenetica: new AtualizarGeneticaUseCase(geneticas),
    removerGenetica: new RemoverGeneticaUseCase(geneticas),
    criarAmbiente: new CriarAmbienteUseCase(ambientes, premium, ids('a')),
    listarAmbientes: new ListarAmbientesUseCase(ambientes),
    removerAmbiente: new RemoverAmbienteUseCase(ambientes),
    iniciarCiclo: new IniciarCicloUseCase(ciclos, ambientes, ids('c'), eventos),
    listarCiclos: new ListarCiclosUseCase(ciclos),
    obterCiclo: new ObterCicloUseCase(ciclos),
    avancarFaseCiclo: new AvancarFaseDoCicloUseCase(ciclos),
    encerrarCiclo: new EncerrarCicloUseCase(ciclos, eventos),
    adicionarPlanta: new AdicionarPlantaUseCase(plantas, ciclos, geneticas, ids('p'), eventos),
    listarPlantas: new ListarPlantasDoCicloUseCase(plantas, ciclos),
    avancarFasePlanta: new AvancarFaseDaPlantaUseCase(plantas, ciclos, eventos),
  };
};

const genetica = { nome: 'OG Kush', tipo: TipoDeGenetica.FOTOPERIODICA };
const ambiente = { nome: 'Estufa 1', tipo: TipoDeAmbiente.INDOOR };

/** Cenário completo: genética + ambiente + ciclo ativo. */
const cenario = async (c: ReturnType<typeof montar>) => {
  const g = await c.criarGenetica.executar({ usuarioId: 'u-1', ...genetica });
  const a = await c.criarAmbiente.executar({ usuarioId: 'u-1', ...ambiente });
  const ciclo = await c.iniciarCiclo.executar({
    usuarioId: 'u-1',
    ambienteId: a.ambienteId,
    nome: 'Ciclo 1',
  });
  return { g, a, ciclo };
};

describe('Genética (doc 02 §5.1)', () => {
  it('cria e lista as genéticas do próprio usuário', async () => {
    const c = montar();
    await c.criarGenetica.executar({ usuarioId: 'u-1', ...genetica });
    await c.criarGenetica.executar({ usuarioId: 'u-2', ...genetica });

    const doDono = await c.listarGeneticas.executar('u-1');
    expect(doDono).toHaveLength(1);
    expect(doDono[0].nome).toBe('OG Kush');
  });

  it('a projeção nunca expõe o id da Conta', async () => {
    const c = montar();
    const view = await c.criarGenetica.executar({ usuarioId: 'u-1', ...genetica });
    expect(view).not.toHaveProperty('usuarioId');
  });

  it('genética de outro usuário responde igual a inexistente', async () => {
    const c = montar();
    const g = await c.criarGenetica.executar({ usuarioId: 'u-1', ...genetica });
    await expect(
      c.atualizarGenetica.executar({ usuarioId: 'intruso', geneticaId: g.geneticaId, nome: 'x' }),
    ).rejects.toThrow(GeneticaNaoEncontradaError);
  });

  it('recusa excluir genética que já originou plantas', async () => {
    const c = montar();
    const { g, ciclo } = await cenario(c);
    await c.adicionarPlanta.executar({
      usuarioId: 'u-1',
      cicloId: ciclo.cicloId,
      geneticaId: g.geneticaId,
      nome: 'Planta 1',
      origem: OrigemDoMaterial.SEMENTE,
    });

    await expect(
      c.removerGenetica.executar({ usuarioId: 'u-1', geneticaId: g.geneticaId }),
    ).rejects.toThrow(GeneticaEmUsoError);
  });

  it('permite excluir genética sem plantas', async () => {
    const c = montar();
    const g = await c.criarGenetica.executar({ usuarioId: 'u-1', ...genetica });
    await c.removerGenetica.executar({ usuarioId: 'u-1', geneticaId: g.geneticaId });
    expect(c.geneticas.porId.size).toBe(0);
  });
});

describe('Ambiente e o gate de Premium (doc 07 §9)', () => {
  it('pergunta ao Core pelo limite, com a chave e o uso atual', async () => {
    const c = montar();
    await c.criarAmbiente.executar({ usuarioId: 'u-1', ...ambiente });

    expect(c.premium.chamadas).toEqual([
      { chave: ChavesDeLimite.GROW_AMBIENTES_SIMULTANEOS, usoAtual: 0 },
    ]);
  });

  it('barra o terceiro ambiente no plano gratuito', async () => {
    const c = montar();
    await c.criarAmbiente.executar({ usuarioId: 'u-1', ...ambiente });
    await c.criarAmbiente.executar({ usuarioId: 'u-1', ...ambiente });

    await expect(c.criarAmbiente.executar({ usuarioId: 'u-1', ...ambiente })).rejects.toThrow(
      LimiteDePlanoAtingidoError,
    );
    expect(c.ambientes.porId.size).toBe(2);
  });

  it('Premium não tem limite de ambientes', async () => {
    const c = montar();
    c.premium.limite = null;
    for (let i = 0; i < 5; i++) {
      await c.criarAmbiente.executar({ usuarioId: 'u-1', ...ambiente });
    }
    expect(c.ambientes.porId.size).toBe(5);
  });

  it('o limite é por usuário — o ambiente de outro não conta', async () => {
    const c = montar();
    await c.criarAmbiente.executar({ usuarioId: 'u-2', ...ambiente });
    await c.criarAmbiente.executar({ usuarioId: 'u-2', ...ambiente });

    await expect(
      c.criarAmbiente.executar({ usuarioId: 'u-1', ...ambiente }),
    ).resolves.toBeDefined();
  });

  it('só o outdoor aceita enriquecimento climático', async () => {
    const c = montar();
    const outdoor = await c.criarAmbiente.executar({
      usuarioId: 'u-1',
      nome: 'Quintal',
      tipo: TipoDeAmbiente.OUTDOOR,
    });
    expect(outdoor.aceitaDadosClimaticos).toBe(true);
  });

  it('recusa excluir ambiente que já hospedou ciclos — o espaço tem histórico', async () => {
    const c = montar();
    const { a } = await cenario(c);
    await expect(
      c.removerAmbiente.executar({ usuarioId: 'u-1', ambienteId: a.ambienteId }),
    ).rejects.toThrow(AmbienteComCiclosError);
  });
});

describe('Ciclo de cultivo (entidade central)', () => {
  it('publica CicloCriado ao iniciar', async () => {
    const c = montar();
    await cenario(c);
    expect(c.eventos.nomes()).toEqual(['CicloCriado']);
  });

  it('recusa iniciar ciclo em ambiente de outro usuário', async () => {
    const c = montar();
    const a = await c.criarAmbiente.executar({ usuarioId: 'u-1', ...ambiente });
    await expect(
      c.iniciarCiclo.executar({ usuarioId: 'intruso', ambienteId: a.ambienteId, nome: 'x' }),
    ).rejects.toThrow(AmbienteNaoEncontradoError);
  });

  it('a fase inicial já entra no histórico datado', async () => {
    const c = montar();
    const { ciclo } = await cenario(c);
    expect(ciclo.transicoes).toHaveLength(1);
    expect(ciclo.transicoes[0].fase).toBe(FaseDeVida.GERMINACAO);
  });

  it('avançar de fase acrescenta uma transição datada', async () => {
    const c = montar();
    const { ciclo } = await cenario(c);
    const atualizado = await c.avancarFaseCiclo.executar({
      usuarioId: 'u-1',
      cicloId: ciclo.cicloId,
      fase: FaseDeVida.VEGETATIVO,
    });
    expect(atualizado.faseAtual).toBe(FaseDeVida.VEGETATIVO);
    expect(atualizado.transicoes).toHaveLength(2);
  });

  it('recusa retroceder de fase', async () => {
    const c = montar();
    const { ciclo } = await cenario(c);
    await c.avancarFaseCiclo.executar({
      usuarioId: 'u-1',
      cicloId: ciclo.cicloId,
      fase: FaseDeVida.FLORACAO,
    });
    await expect(
      c.avancarFaseCiclo.executar({
        usuarioId: 'u-1',
        cicloId: ciclo.cicloId,
        fase: FaseDeVida.VEGETATIVO,
      }),
    ).rejects.toThrow(TransicaoDeFaseInvalidaError);
  });

  it('encerrar publica CicloFinalizado com a duração já calculada', async () => {
    const c = montar();
    const { ciclo } = await cenario(c);
    await c.encerrarCiclo.executar({ usuarioId: 'u-1', cicloId: ciclo.cicloId });

    expect(c.eventos.nomes()).toEqual(['CicloCriado', 'CicloFinalizado']);
    const finalizado = c.eventos.publicados[1];
    expect(finalizado).toBeInstanceOf(CicloFinalizado);
    expect((finalizado as CicloFinalizado).duracaoEmDias).toBeGreaterThanOrEqual(0);
  });

  it('um ciclo encerrado não aceita mais escrita', async () => {
    const c = montar();
    const { ciclo } = await cenario(c);
    await c.encerrarCiclo.executar({ usuarioId: 'u-1', cicloId: ciclo.cicloId });

    await expect(
      c.avancarFaseCiclo.executar({
        usuarioId: 'u-1',
        cicloId: ciclo.cicloId,
        fase: FaseDeVida.CURA,
      }),
    ).rejects.toThrow(CicloEncerradoError);
  });

  it('lista só os ciclos ativos quando pedido', async () => {
    const c = montar();
    const { a, ciclo } = await cenario(c);
    await c.iniciarCiclo.executar({ usuarioId: 'u-1', ambienteId: a.ambienteId, nome: 'Ciclo 2' });
    await c.encerrarCiclo.executar({ usuarioId: 'u-1', cicloId: ciclo.cicloId });

    expect(await c.listarCiclos.executar('u-1')).toHaveLength(2);
    expect(await c.listarCiclos.executar('u-1', true)).toHaveLength(1);
  });

  it('ciclo de outro usuário responde igual a inexistente', async () => {
    const c = montar();
    const { ciclo } = await cenario(c);
    await expect(
      c.obterCiclo.executar({ usuarioId: 'intruso', cicloId: ciclo.cicloId }),
    ).rejects.toThrow(CicloNaoEncontradoError);
  });
});

describe('Planta (unidade central de registro)', () => {
  it('publica PlantaCriada e vincula ciclo + genética', async () => {
    const c = montar();
    const { g, ciclo } = await cenario(c);
    const planta = await c.adicionarPlanta.executar({
      usuarioId: 'u-1',
      cicloId: ciclo.cicloId,
      geneticaId: g.geneticaId,
      nome: 'Planta 1',
      origem: OrigemDoMaterial.SEMENTE,
    });

    expect(planta.geneticaId).toBe(g.geneticaId);
    expect(c.eventos.nomes()).toEqual(['CicloCriado', 'PlantaCriada']);
  });

  it('recusa adicionar planta a ciclo encerrado', async () => {
    const c = montar();
    const { g, ciclo } = await cenario(c);
    await c.encerrarCiclo.executar({ usuarioId: 'u-1', cicloId: ciclo.cicloId });

    await expect(
      c.adicionarPlanta.executar({
        usuarioId: 'u-1',
        cicloId: ciclo.cicloId,
        geneticaId: g.geneticaId,
        nome: 'Tardia',
        origem: OrigemDoMaterial.SEMENTE,
      }),
    ).rejects.toThrow(CicloEncerradoError);
  });

  it('recusa genética de outro usuário', async () => {
    const c = montar();
    const { ciclo } = await cenario(c);
    const alheia = await c.criarGenetica.executar({ usuarioId: 'u-2', ...genetica });

    await expect(
      c.adicionarPlanta.executar({
        usuarioId: 'u-1',
        cicloId: ciclo.cicloId,
        geneticaId: alheia.geneticaId,
        nome: 'Planta 1',
        origem: OrigemDoMaterial.SEMENTE,
      }),
    ).rejects.toThrow(GeneticaNaoEncontradaError);
  });

  it('cada planta tem fase própria — a base da colheita escalonada (doc 04 §25)', async () => {
    const c = montar();
    const { g, ciclo } = await cenario(c);
    const base = {
      usuarioId: 'u-1',
      cicloId: ciclo.cicloId,
      geneticaId: g.geneticaId,
      origem: OrigemDoMaterial.SEMENTE,
    };
    const cedo = await c.adicionarPlanta.executar({ ...base, nome: 'Cedo' });
    await c.adicionarPlanta.executar({ ...base, nome: 'Tarde' });

    await c.avancarFasePlanta.executar({
      usuarioId: 'u-1',
      plantaId: cedo.plantaId,
      fase: FaseDeVida.COLHEITA,
    });

    const plantas = await c.listarPlantas.executar({ usuarioId: 'u-1', cicloId: ciclo.cicloId });
    const fases = plantas.map((p) => p.faseAtual);
    expect(fases).toContain(FaseDeVida.COLHEITA);
    expect(fases).toContain(FaseDeVida.GERMINACAO);
  });

  it('avançar a fase da planta publica PlantaFaseAlterada com a fase anterior', async () => {
    const c = montar();
    const { g, ciclo } = await cenario(c);
    const planta = await c.adicionarPlanta.executar({
      usuarioId: 'u-1',
      cicloId: ciclo.cicloId,
      geneticaId: g.geneticaId,
      nome: 'Planta 1',
      origem: OrigemDoMaterial.SEMENTE,
    });

    await c.avancarFasePlanta.executar({
      usuarioId: 'u-1',
      plantaId: planta.plantaId,
      fase: FaseDeVida.VEGETATIVO,
    });

    const evento = c.eventos.publicados.at(-1);
    expect(evento).toBeInstanceOf(PlantaFaseAlterada);
    expect((evento as PlantaFaseAlterada).faseAnterior).toBe(FaseDeVida.GERMINACAO);
    expect((evento as PlantaFaseAlterada).faseNova).toBe(FaseDeVida.VEGETATIVO);
  });

  it('planta de outro usuário responde igual a inexistente', async () => {
    const c = montar();
    const { g, ciclo } = await cenario(c);
    const planta = await c.adicionarPlanta.executar({
      usuarioId: 'u-1',
      cicloId: ciclo.cicloId,
      geneticaId: g.geneticaId,
      nome: 'Planta 1',
      origem: OrigemDoMaterial.SEMENTE,
    });

    await expect(
      c.avancarFasePlanta.executar({
        usuarioId: 'intruso',
        plantaId: planta.plantaId,
        fase: FaseDeVida.VEGETATIVO,
      }),
    ).rejects.toThrow(PlantaNaoEncontradaError);
  });

  it('a entidade barra edição por quem não é dono', () => {
    const a = Ambiente.criar({
      id: 'a-1',
      usuarioId: 'u-1',
      nome: 'x',
      tipo: TipoDeAmbiente.INDOOR,
    });
    expect(() => a.garantirAutoria('intruso')).toThrow(AcessoNegadoError);
  });
});
