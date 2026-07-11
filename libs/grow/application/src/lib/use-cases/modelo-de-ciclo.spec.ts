import type { IdGenerator } from '@cosmaria/core-application';
import type { PremiumPublicApi } from '@cosmaria/core-public-api';
import {
  Ambiente,
  AmbienteNaoEncontradoError,
  ModeloDeCiclo,
  ModeloDeCicloNaoEncontradoError,
  RecursoExclusivoPremiumError,
  TipoDeAmbiente,
} from '@cosmaria/grow-domain';
import type {
  AmbienteRepository,
  GeneticaRepository,
  ModeloDeCicloRepository,
} from '../ports/grow.repositories';
import {
  CriarModeloDeCicloUseCase,
  ListarModelosDeCicloUseCase,
  RemoverModeloDeCicloUseCase,
} from './modelo-de-ciclo.use-cases';

const USUARIO = 'u-1';

class ModelosFake implements ModeloDeCicloRepository {
  readonly porId = new Map<string, ModeloDeCiclo>();
  salvar(m: ModeloDeCiclo): Promise<void> {
    this.porId.set(m.id, m);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<ModeloDeCiclo | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorUsuario(usuarioId: string): Promise<ModeloDeCiclo[]> {
    return Promise.resolve([...this.porId.values()].filter((m) => m.pertenceA(usuarioId)));
  }
  remover(id: string): Promise<void> {
    this.porId.delete(id);
    return Promise.resolve();
  }
}

class AmbientesFake implements AmbienteRepository {
  readonly porId = new Map<string, Ambiente>();
  salvar(a: Ambiente): Promise<void> {
    this.porId.set(a.id, a);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Ambiente | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorUsuario(): Promise<Ambiente[]> {
    return Promise.resolve([]);
  }
  remover(): Promise<void> {
    return Promise.resolve();
  }
  contarPorUsuario(): Promise<number> {
    return Promise.resolve(0);
  }
  possuiCiclos(): Promise<boolean> {
    return Promise.resolve(false);
  }
}

// A genética não é exercida nos caminhos felizes; um dublê mínimo basta.
const geneticasVazio = {
  salvar: () => Promise.resolve(),
  buscarPorId: () => Promise.resolve(null),
  listarPorUsuario: () => Promise.resolve([]),
  remover: () => Promise.resolve(),
  possuiPlantas: () => Promise.resolve(false),
} as unknown as GeneticaRepository;

const premiumFake = (ehPremium: boolean): PremiumPublicApi => ({
  ehPremium: () => Promise.resolve(ehPremium),
  // Não exercido por Modelos de Ciclo (o gate é de funcionalidade, não de capacidade).
  verificarLimite: () => Promise.reject(new Error('não usado')),
});

const idSeq = (): IdGenerator => {
  let n = 0;
  return { gerar: () => `m-${++n}` };
};

describe('ModeloDeCiclo — casos de uso', () => {
  describe('CriarModeloDeCiclo (gate Premium)', () => {
    it('recusa usuário gratuito com recurso exclusivo Premium', async () => {
      const uc = new CriarModeloDeCicloUseCase(
        new ModelosFake(),
        new AmbientesFake(),
        geneticasVazio,
        premiumFake(false),
        idSeq(),
      );
      await expect(uc.executar({ usuarioId: USUARIO, nome: 'X' })).rejects.toThrow(
        RecursoExclusivoPremiumError,
      );
    });

    it('permite usuário Premium criar o modelo', async () => {
      const modelos = new ModelosFake();
      const uc = new CriarModeloDeCicloUseCase(
        modelos,
        new AmbientesFake(),
        geneticasVazio,
        premiumFake(true),
        idSeq(),
      );
      const view = await uc.executar({ usuarioId: USUARIO, nome: 'Autoflor de verão' });
      expect(view.nome).toBe('Autoflor de verão');
      expect(modelos.porId.size).toBe(1);
    });

    it('valida a posse do ambiente padrão informado', async () => {
      const ambientes = new AmbientesFake();
      ambientes.porId.set(
        'amb-1',
        Ambiente.criar({ id: 'amb-1', usuarioId: 'outro', nome: 'E', tipo: TipoDeAmbiente.INDOOR }),
      );
      const uc = new CriarModeloDeCicloUseCase(
        new ModelosFake(),
        ambientes,
        geneticasVazio,
        premiumFake(true),
        idSeq(),
      );
      await expect(
        uc.executar({ usuarioId: USUARIO, nome: 'X', ambienteId: 'amb-1' }),
      ).rejects.toThrow(AmbienteNaoEncontradoError);
    });
  });

  describe('Listar / Remover (não gated — dado do usuário)', () => {
    it('lista os modelos mesmo sem Premium ativo', async () => {
      const modelos = new ModelosFake();
      await new CriarModeloDeCicloUseCase(
        modelos,
        new AmbientesFake(),
        geneticasVazio,
        premiumFake(true),
        idSeq(),
      ).executar({ usuarioId: USUARIO, nome: 'M1' });

      const lista = await new ListarModelosDeCicloUseCase(modelos).executar(USUARIO);
      expect(lista).toHaveLength(1);
    });

    it('remove o próprio modelo', async () => {
      const modelos = new ModelosFake();
      const criado = await new CriarModeloDeCicloUseCase(
        modelos,
        new AmbientesFake(),
        geneticasVazio,
        premiumFake(true),
        idSeq(),
      ).executar({ usuarioId: USUARIO, nome: 'M1' });

      await new RemoverModeloDeCicloUseCase(modelos).executar({
        usuarioId: USUARIO,
        modeloId: criado.modeloId,
      });
      expect(modelos.porId.size).toBe(0);
    });

    it('remover modelo alheio responde como inexistente', async () => {
      const modelos = new ModelosFake();
      modelos.porId.set(
        'm-1',
        ModeloDeCiclo.criar({ id: 'm-1', usuarioId: 'outro', nome: 'alheio' }),
      );
      await expect(
        new RemoverModeloDeCicloUseCase(modelos).executar({ usuarioId: USUARIO, modeloId: 'm-1' }),
      ).rejects.toThrow(ModeloDeCicloNaoEncontradoError);
    });
  });
});
