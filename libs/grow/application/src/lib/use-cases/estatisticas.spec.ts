import {
  CicloCultivo,
  CicloNaoEncontradoError,
  Colheita,
  ComparacaoSemCiclosError,
  Cura,
  EventoSanidade,
  Lote,
  OrigemDoMaterial,
  Planta,
  RegistroAmbiental,
  type ResumoAmbiental,
  Secagem,
  Severidade,
  TipoDeSanidade,
} from '@cosmaria/grow-domain';
import type {
  CicloRepository,
  ColheitaRepository,
  CuraRepository,
  EventoManejoRepository,
  EventoSanidadeRepository,
  LoteRepository,
  PaginaDeRegistros,
  PlantaRepository,
  RegistroAmbientalRepository,
  SecagemRepository,
} from '../ports/grow.repositories';
import {
  CompararCiclosUseCase,
  ObterRelatorioDoCicloUseCase,
  type ReposDeEstatisticas,
} from './estatisticas.use-cases';

const AGORA = new Date('2026-07-10T12:00:00Z');
const USUARIO = 'u-1';

const ambienteVazio: ResumoAmbiental = {
  totalRegistros: 0,
  temperaturaMedia: null,
  umidadeMedia: null,
  vpdMedio: null,
  dliMedio: null,
  phMedio: null,
  ecMedio: null,
};

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
  readonly itens: Planta[] = [];
  salvar(): Promise<void> {
    return Promise.resolve();
  }
  buscarPorId(): Promise<Planta | null> {
    return Promise.resolve(null);
  }
  listarPorCiclo(cicloId: string): Promise<Planta[]> {
    return Promise.resolve(this.itens.filter((p) => p.cicloId === cicloId));
  }
}

class ManejosFake implements EventoManejoRepository {
  salvar(): Promise<void> {
    return Promise.resolve();
  }
  listarPorCiclo(): Promise<never[]> {
    return Promise.resolve([]);
  }
}

class SanidadesFake implements EventoSanidadeRepository {
  readonly itens: EventoSanidade[] = [];
  salvar(): Promise<void> {
    return Promise.resolve();
  }
  buscarPorId(): Promise<EventoSanidade | null> {
    return Promise.resolve(null);
  }
  listarPorCiclo(cicloId: string): Promise<EventoSanidade[]> {
    return Promise.resolve(this.itens.filter((e) => e.cicloId === cicloId));
  }
}

class RegistrosFake implements RegistroAmbientalRepository {
  readonly resumos = new Map<string, ResumoAmbiental>();
  salvar(): Promise<void> {
    return Promise.resolve();
  }
  buscarPorId(): Promise<RegistroAmbiental | null> {
    return Promise.resolve(null);
  }
  listarPorCiclo(): Promise<PaginaDeRegistros> {
    return Promise.resolve({ itens: [], total: 0 });
  }
  resumoAmbientalPorCiclo(cicloId: string): Promise<ResumoAmbiental> {
    return Promise.resolve(this.resumos.get(cicloId) ?? ambienteVazio);
  }
}

class ColheitasFake implements ColheitaRepository {
  readonly itens: Colheita[] = [];
  salvar(): Promise<void> {
    return Promise.resolve();
  }
  buscarPorId(): Promise<Colheita | null> {
    return Promise.resolve(null);
  }
  listarPorCiclo(cicloId: string): Promise<Colheita[]> {
    return Promise.resolve(this.itens.filter((c) => c.cicloId === cicloId));
  }
}

class SecagensFake implements SecagemRepository {
  readonly itens: Secagem[] = [];
  salvar(): Promise<void> {
    return Promise.resolve();
  }
  buscarPorId(): Promise<Secagem | null> {
    return Promise.resolve(null);
  }
  buscarPorColheita(colheitaId: string): Promise<Secagem | null> {
    return Promise.resolve(this.itens.find((s) => s.colheitaId === colheitaId) ?? null);
  }
}

class CurasFake implements CuraRepository {
  readonly itens: Cura[] = [];
  salvar(): Promise<void> {
    return Promise.resolve();
  }
  buscarPorId(): Promise<Cura | null> {
    return Promise.resolve(null);
  }
  buscarPorSecagem(secagemId: string): Promise<Cura | null> {
    return Promise.resolve(this.itens.find((c) => c.secagemId === secagemId) ?? null);
  }
}

class LotesFake implements LoteRepository {
  readonly itens: Lote[] = [];
  salvar(): Promise<void> {
    return Promise.resolve();
  }
  buscarPorId(): Promise<Lote | null> {
    return Promise.resolve(null);
  }
  buscarPorCura(curaId: string): Promise<Lote | null> {
    return Promise.resolve(this.itens.find((l) => l.curaId === curaId) ?? null);
  }
}

function montarRepos() {
  const repos: ReposDeEstatisticas = {
    ciclos: new CiclosFake(),
    plantas: new PlantasFake(),
    manejos: new ManejosFake(),
    sanidades: new SanidadesFake(),
    registros: new RegistrosFake(),
    colheitas: new ColheitasFake(),
    secagens: new SecagensFake(),
    curas: new CurasFake(),
    lotes: new LotesFake(),
  };
  return repos as ReposDeEstatisticas & {
    ciclos: CiclosFake;
    plantas: PlantasFake;
    sanidades: SanidadesFake;
    registros: RegistrosFake;
    colheitas: ColheitasFake;
    secagens: SecagensFake;
    curas: CurasFake;
    lotes: LotesFake;
  };
}

function comCicloCompleto(
  repos: ReturnType<typeof montarRepos>,
  cicloId: string,
  pesoSeco: number,
) {
  const ciclo = CicloCultivo.iniciar({
    id: cicloId,
    usuarioId: USUARIO,
    ambienteId: 'a-1',
    nome: cicloId,
    iniciadoEm: AGORA,
  });
  repos.ciclos.porId.set(cicloId, ciclo);
  repos.plantas.itens.push(
    Planta.criar({
      id: `${cicloId}-p1`,
      usuarioId: USUARIO,
      cicloId,
      geneticaId: 'g-1',
      nome: 'P1',
      origem: OrigemDoMaterial.SEMENTE,
    }),
  );
  repos.sanidades.itens.push(
    EventoSanidade.registrar({
      id: `${cicloId}-s1`,
      usuarioId: USUARIO,
      cicloId,
      tipo: TipoDeSanidade.PRAGA,
      severidade: Severidade.MEDIA,
    }),
  );
  const colheita = Colheita.registrar({
    id: `${cicloId}-col`,
    usuarioId: USUARIO,
    cicloId,
    plantaIds: [`${cicloId}-p1`],
    pesoUmidoGramas: 400,
  });
  const secagem = Secagem.registrar({
    id: `${cicloId}-sec`,
    usuarioId: USUARIO,
    colheitaId: colheita.id,
  });
  const cura = Cura.registrar({ id: `${cicloId}-cur`, usuarioId: USUARIO, secagemId: secagem.id });
  const lote = Lote.gerar({
    id: `${cicloId}-lot`,
    usuarioId: USUARIO,
    curaId: cura.id,
    codigo: cicloId,
    pesoSecoGramas: pesoSeco,
  });
  repos.colheitas.itens.push(colheita);
  repos.secagens.itens.push(secagem);
  repos.curas.itens.push(cura);
  repos.lotes.itens.push(lote);
}

describe('Estatísticas — casos de uso', () => {
  describe('ObterRelatorioDoCiclo', () => {
    it('agrega plantas, sanidade e rendimento do ciclo', async () => {
      const repos = montarRepos();
      comCicloCompleto(repos, 'c-1', 90);
      repos.registros.resumos.set('c-1', {
        ...ambienteVazio,
        totalRegistros: 5,
        temperaturaMedia: 25,
      });

      const view = await new ObterRelatorioDoCicloUseCase(repos).executar({
        usuarioId: USUARIO,
        cicloId: 'c-1',
      });

      expect(view.totalPlantas).toBe(1);
      expect(view.sanidade.total).toBe(1);
      expect(view.sanidade.abertos).toBe(1);
      expect(view.colheita.pesoSecoTotalGramas).toBe(90);
      expect(view.colheita.gramasPorPlanta).toBe(90);
      expect(view.ambiente.temperaturaMedia).toBe(25);
    });

    it('ciclo de outro usuário responde como inexistente', async () => {
      const repos = montarRepos();
      comCicloCompleto(repos, 'c-1', 90);
      await expect(
        new ObterRelatorioDoCicloUseCase(repos).executar({ usuarioId: 'intruso', cicloId: 'c-1' }),
      ).rejects.toThrow(CicloNaoEncontradoError);
    });
  });

  describe('CompararCiclos', () => {
    it('compara N ciclos e aponta os destaques', async () => {
      const repos = montarRepos();
      comCicloCompleto(repos, 'c-A', 100);
      comCicloCompleto(repos, 'c-B', 150);

      const view = await new CompararCiclosUseCase(repos).executar({
        usuarioId: USUARIO,
        cicloIds: ['c-A', 'c-B'],
      });

      expect(view.ciclos).toHaveLength(2);
      expect(view.destaques.maiorRendimentoTotalCicloId).toBe('c-B');
    });

    it('deduplica ids repetidos', async () => {
      const repos = montarRepos();
      comCicloCompleto(repos, 'c-A', 100);
      const view = await new CompararCiclosUseCase(repos).executar({
        usuarioId: USUARIO,
        cicloIds: ['c-A', 'c-A'],
      });
      expect(view.ciclos).toHaveLength(1);
    });

    it('lista vazia é recusada', async () => {
      const repos = montarRepos();
      await expect(
        new CompararCiclosUseCase(repos).executar({ usuarioId: USUARIO, cicloIds: [] }),
      ).rejects.toThrow(ComparacaoSemCiclosError);
    });

    it('se algum ciclo não é do usuário, a comparação inteira falha', async () => {
      const repos = montarRepos();
      comCicloCompleto(repos, 'c-A', 100);
      await expect(
        new CompararCiclosUseCase(repos).executar({
          usuarioId: USUARIO,
          cicloIds: ['c-A', 'c-desconhecido'],
        }),
      ).rejects.toThrow(CicloNaoEncontradoError);
    });
  });
});
