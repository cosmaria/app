import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import type { DomainEvent } from '@cosmaria/core-domain';
import {
  CicloCultivo,
  CicloEncerradoError,
  CicloNaoEncontradoError,
  Colheita,
  ColheitaRegistrada,
  Cura,
  CuraJaRegistradaError,
  Lote,
  LoteJaGeradoError,
  LoteNaoEncontradoError,
  OrigemDoMaterial,
  Planta,
  PlantaNaoEncontradaError,
  Secagem,
  SecagemJaRegistradaError,
} from '@cosmaria/grow-domain';
import type {
  CicloRepository,
  ColheitaRepository,
  CuraRepository,
  LoteRepository,
  PlantaRepository,
  SecagemRepository,
} from '../ports/grow.repositories';
import {
  FinalizarSecagemUseCase,
  GerarLoteUseCase,
  ListarColheitasDoCicloUseCase,
  ObterLoteUseCase,
  RegistrarColheitaUseCase,
  RegistrarCuraUseCase,
  RegistrarSecagemUseCase,
} from './pos-colheita.use-cases';

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

class ColheitasFake implements ColheitaRepository {
  readonly porId = new Map<string, Colheita>();
  salvar(c: Colheita): Promise<void> {
    this.porId.set(c.id, c);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Colheita | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorCiclo(cicloId: string): Promise<Colheita[]> {
    return Promise.resolve([...this.porId.values()].filter((c) => c.cicloId === cicloId));
  }
}

class SecagensFake implements SecagemRepository {
  readonly porId = new Map<string, Secagem>();
  salvar(s: Secagem): Promise<void> {
    this.porId.set(s.id, s);
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

class CurasFake implements CuraRepository {
  readonly porId = new Map<string, Cura>();
  salvar(c: Cura): Promise<void> {
    this.porId.set(c.id, c);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Cura | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  buscarPorSecagem(secagemId: string): Promise<Cura | null> {
    return Promise.resolve([...this.porId.values()].find((c) => c.secagemId === secagemId) ?? null);
  }
}

class LotesFake implements LoteRepository {
  readonly porId = new Map<string, Lote>();
  salvar(l: Lote): Promise<void> {
    this.porId.set(l.id, l);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Lote | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  buscarPorCura(curaId: string): Promise<Lote | null> {
    return Promise.resolve([...this.porId.values()].find((l) => l.curaId === curaId) ?? null);
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

function montarCicloComPlantas() {
  const ciclos = new CiclosFake();
  const plantas = new PlantasFake();
  const ciclo = CicloCultivo.iniciar({
    id: 'c-1',
    usuarioId: USUARIO,
    ambienteId: 'a-1',
    nome: 'Ciclo 1',
  });
  ciclos.porId.set(ciclo.id, ciclo);
  for (const id of ['p-1', 'p-2']) {
    plantas.porId.set(
      id,
      Planta.criar({
        id,
        usuarioId: USUARIO,
        cicloId: 'c-1',
        geneticaId: 'g-1',
        nome: id,
        origem: OrigemDoMaterial.SEMENTE,
      }),
    );
  }
  return { ciclos, plantas, ciclo };
}

describe('Pós-colheita — casos de uso', () => {
  describe('RegistrarColheita', () => {
    it('registra a colheita de um subconjunto de plantas e publica ColheitaRegistrada', async () => {
      const { ciclos, plantas } = montarCicloComPlantas();
      const colheitas = new ColheitasFake();
      const eventos = new EventosFake();
      const uc = new RegistrarColheitaUseCase(colheitas, ciclos, plantas, idSeq(), eventos);

      const view = await uc.executar({
        usuarioId: USUARIO,
        cicloId: 'c-1',
        plantaIds: ['p-1'],
        pesoUmidoGramas: 500,
      });

      expect(view.quantidadeDePlantas).toBe(1);
      expect(view.pesoUmidoGramas).toBe(500);
      const evt = eventos.publicados[0] as ColheitaRegistrada;
      expect(evt.nome).toBe('ColheitaRegistrada');
      expect(evt.quantidadeDePlantas).toBe(1);
    });

    it('recusa planta que não é do ciclo', async () => {
      const { ciclos, plantas } = montarCicloComPlantas();
      const uc = new RegistrarColheitaUseCase(
        new ColheitasFake(),
        ciclos,
        plantas,
        idSeq(),
        new EventosFake(),
      );
      await expect(
        uc.executar({ usuarioId: USUARIO, cicloId: 'c-1', plantaIds: ['p-99'] }),
      ).rejects.toThrow(PlantaNaoEncontradaError);
    });

    it('recusa colher em ciclo encerrado', async () => {
      const { ciclos, plantas, ciclo } = montarCicloComPlantas();
      ciclo.encerrar();
      const uc = new RegistrarColheitaUseCase(
        new ColheitasFake(),
        ciclos,
        plantas,
        idSeq(),
        new EventosFake(),
      );
      await expect(
        uc.executar({ usuarioId: USUARIO, cicloId: 'c-1', plantaIds: ['p-1'] }),
      ).rejects.toThrow(CicloEncerradoError);
    });

    it('ciclo de outro usuário responde como inexistente', async () => {
      const { ciclos, plantas } = montarCicloComPlantas();
      const uc = new RegistrarColheitaUseCase(
        new ColheitasFake(),
        ciclos,
        plantas,
        idSeq(),
        new EventosFake(),
      );
      await expect(
        uc.executar({ usuarioId: 'intruso', cicloId: 'c-1', plantaIds: ['p-1'] }),
      ).rejects.toThrow(CicloNaoEncontradoError);
    });
  });

  describe('fluxo completo até o Lote', () => {
    it('colheita → secagem → cura → lote calcula rendimento por planta', async () => {
      const { ciclos, plantas } = montarCicloComPlantas();
      const colheitas = new ColheitasFake();
      const secagens = new SecagensFake();
      const curas = new CurasFake();
      const lotes = new LotesFake();
      const id = idSeq();
      const eventos = new EventosFake();

      const colheita = await new RegistrarColheitaUseCase(
        colheitas,
        ciclos,
        plantas,
        id,
        eventos,
      ).executar({ usuarioId: USUARIO, cicloId: 'c-1', plantaIds: ['p-1', 'p-2'] });

      const secagem = await new RegistrarSecagemUseCase(secagens, colheitas, id).executar({
        usuarioId: USUARIO,
        colheitaId: colheita.colheitaId,
      });

      const cura = await new RegistrarCuraUseCase(curas, secagens, id).executar({
        usuarioId: USUARIO,
        secagemId: secagem.secagemId,
      });

      const lote = await new GerarLoteUseCase(lotes, curas, secagens, colheitas, id).executar({
        usuarioId: USUARIO,
        curaId: cura.curaId,
        codigo: 'OG-2026-01',
        pesoSecoGramas: 120,
      });

      expect(lote.quantidadeDePlantas).toBe(2);
      expect(lote.gramasPorPlanta).toBe(60);

      // Reler pelo dono devolve o mesmo rendimento derivado.
      const relido = await new ObterLoteUseCase(lotes, curas, secagens, colheitas).executar({
        usuarioId: USUARIO,
        loteId: lote.loteId,
      });
      expect(relido.gramasPorPlanta).toBe(60);
    });

    it('recusa segunda secagem para a mesma colheita (1—1)', async () => {
      const { ciclos, plantas } = montarCicloComPlantas();
      const colheitas = new ColheitasFake();
      const secagens = new SecagensFake();
      const id = idSeq();
      const colheita = await new RegistrarColheitaUseCase(
        colheitas,
        ciclos,
        plantas,
        id,
        new EventosFake(),
      ).executar({ usuarioId: USUARIO, cicloId: 'c-1', plantaIds: ['p-1'] });

      const registrar = new RegistrarSecagemUseCase(secagens, colheitas, id);
      await registrar.executar({ usuarioId: USUARIO, colheitaId: colheita.colheitaId });
      await expect(
        registrar.executar({ usuarioId: USUARIO, colheitaId: colheita.colheitaId }),
      ).rejects.toThrow(SecagemJaRegistradaError);
    });

    it('recusa segunda cura para a mesma secagem (1—1)', async () => {
      const secagens = new SecagensFake();
      const curas = new CurasFake();
      const id = idSeq();
      const secagem = Secagem.registrar({ id: 's-1', usuarioId: USUARIO, colheitaId: 'col-1' });
      secagens.porId.set(secagem.id, secagem);

      const registrar = new RegistrarCuraUseCase(curas, secagens, id);
      await registrar.executar({ usuarioId: USUARIO, secagemId: 's-1' });
      await expect(registrar.executar({ usuarioId: USUARIO, secagemId: 's-1' })).rejects.toThrow(
        CuraJaRegistradaError,
      );
    });

    it('recusa gerar um segundo lote para a mesma cura (1—1)', async () => {
      const curas = new CurasFake();
      const secagens = new SecagensFake();
      const colheitas = new ColheitasFake();
      const lotes = new LotesFake();
      const id = idSeq();
      const cura = Cura.registrar({ id: 'cur-1', usuarioId: USUARIO, secagemId: 's-1' });
      curas.porId.set(cura.id, cura);

      const gerar = new GerarLoteUseCase(lotes, curas, secagens, colheitas, id);
      await gerar.executar({
        usuarioId: USUARIO,
        curaId: 'cur-1',
        codigo: 'L1',
        pesoSecoGramas: 50,
      });
      await expect(
        gerar.executar({ usuarioId: USUARIO, curaId: 'cur-1', codigo: 'L2', pesoSecoGramas: 40 }),
      ).rejects.toThrow(LoteJaGeradoError);
    });

    it('secagem finaliza monotonicamente', async () => {
      const secagens = new SecagensFake();
      const secagem = Secagem.registrar({
        id: 's-1',
        usuarioId: USUARIO,
        colheitaId: 'col-1',
        iniciadaEm: new Date('2026-07-01T00:00:00Z'),
      });
      secagens.porId.set(secagem.id, secagem);

      const uc = new FinalizarSecagemUseCase(secagens);
      const view = await uc.executar({ usuarioId: USUARIO, secagemId: 's-1' });
      expect(view.finalizada).toBe(true);
    });
  });

  describe('ObterColheita / Listar', () => {
    it('lista as colheitas do ciclo e não vaza para outra Conta', async () => {
      const { ciclos, plantas } = montarCicloComPlantas();
      const colheitas = new ColheitasFake();
      const id = idSeq();
      await new RegistrarColheitaUseCase(
        colheitas,
        ciclos,
        plantas,
        id,
        new EventosFake(),
      ).executar({ usuarioId: USUARIO, cicloId: 'c-1', plantaIds: ['p-1'] });

      const lista = await new ListarColheitasDoCicloUseCase(colheitas, ciclos).executar({
        usuarioId: USUARIO,
        cicloId: 'c-1',
      });
      expect(lista).toHaveLength(1);

      await expect(
        new ListarColheitasDoCicloUseCase(colheitas, ciclos).executar({
          usuarioId: 'intruso',
          cicloId: 'c-1',
        }),
      ).rejects.toThrow(CicloNaoEncontradoError);
    });

    it('lote inexistente responde como não encontrado', async () => {
      const uc = new ObterLoteUseCase(
        new LotesFake(),
        new CurasFake(),
        new SecagensFake(),
        new ColheitasFake(),
      );
      await expect(uc.executar({ usuarioId: USUARIO, loteId: 'nao-existe' })).rejects.toThrow(
        LoteNaoEncontradoError,
      );
    });
  });
});
