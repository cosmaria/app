import type { IdGenerator } from '@cosmaria/core-application';
import {
  Ambiente,
  AmbienteNaoEncontradoError,
  AmbienteNaoOutdoorError,
  DadosClimaticos,
  DadosClimaticosNaoEncontradosError,
  TipoDeAmbiente,
} from '@cosmaria/grow-domain';
import type { AmbienteRepository, DadosClimaticosRepository } from '../ports/grow.repositories';
import {
  DefinirDadosClimaticosUseCase,
  ObterDadosClimaticosUseCase,
  RemoverDadosClimaticosUseCase,
} from './outdoor.use-cases';

const USUARIO = 'u-1';

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
    return Promise.resolve([...this.porId.values()]);
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

class DadosFake implements DadosClimaticosRepository {
  readonly porAmbiente = new Map<string, DadosClimaticos>();
  salvar(d: DadosClimaticos): Promise<void> {
    this.porAmbiente.set(d.ambienteId, d);
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

const idSeq = (): IdGenerator => {
  let n = 0;
  return { gerar: () => `dc-${++n}` };
};

function ambiente(tipo: TipoDeAmbiente, id = 'amb-1', usuarioId = USUARIO): Ambiente {
  return Ambiente.criar({ id, usuarioId, nome: id, tipo });
}

describe('Módulo Outdoor — casos de uso', () => {
  describe('DefinirDadosClimaticos', () => {
    it('configura o módulo para um ambiente outdoor', async () => {
      const ambientes = new AmbientesFake();
      ambientes.porId.set('amb-1', ambiente(TipoDeAmbiente.OUTDOOR));
      const dados = new DadosFake();
      const uc = new DefinirDadosClimaticosUseCase(dados, ambientes, idSeq());

      const view = await uc.executar({
        usuarioId: USUARIO,
        ambienteId: 'amb-1',
        localizacaoAproximada: 'Curitiba, PR',
      });
      expect(view.localizacaoAproximada).toBe('Curitiba, PR');
      expect(view.fonte).toBe('MANUAL');
    });

    it('recusa ambiente que não é outdoor', async () => {
      const ambientes = new AmbientesFake();
      ambientes.porId.set('amb-1', ambiente(TipoDeAmbiente.INDOOR));
      const uc = new DefinirDadosClimaticosUseCase(new DadosFake(), ambientes, idSeq());
      await expect(uc.executar({ usuarioId: USUARIO, ambienteId: 'amb-1' })).rejects.toThrow(
        AmbienteNaoOutdoorError,
      );
    });

    it('é upsert: reconfigurar o mesmo ambiente atualiza, não duplica', async () => {
      const ambientes = new AmbientesFake();
      ambientes.porId.set('amb-1', ambiente(TipoDeAmbiente.OUTDOOR));
      const dados = new DadosFake();
      const uc = new DefinirDadosClimaticosUseCase(dados, ambientes, idSeq());

      await uc.executar({ usuarioId: USUARIO, ambienteId: 'amb-1', localizacaoAproximada: 'A' });
      await uc.executar({ usuarioId: USUARIO, ambienteId: 'amb-1', localizacaoAproximada: 'B' });

      expect(dados.porAmbiente.size).toBe(1);
      expect(dados.porAmbiente.get('amb-1')?.localizacaoAproximada).toBe('B');
    });

    it('ambiente de outro usuário responde como inexistente', async () => {
      const ambientes = new AmbientesFake();
      ambientes.porId.set('amb-1', ambiente(TipoDeAmbiente.OUTDOOR));
      const uc = new DefinirDadosClimaticosUseCase(new DadosFake(), ambientes, idSeq());
      await expect(uc.executar({ usuarioId: 'intruso', ambienteId: 'amb-1' })).rejects.toThrow(
        AmbienteNaoEncontradoError,
      );
    });
  });

  describe('ObterDadosClimaticos', () => {
    it('ambiente sem o módulo configurado responde 404 (ausência isolada)', async () => {
      const ambientes = new AmbientesFake();
      ambientes.porId.set('amb-1', ambiente(TipoDeAmbiente.OUTDOOR));
      const uc = new ObterDadosClimaticosUseCase(new DadosFake(), ambientes);
      await expect(uc.executar({ usuarioId: USUARIO, ambienteId: 'amb-1' })).rejects.toThrow(
        DadosClimaticosNaoEncontradosError,
      );
    });

    it('devolve os dados configurados', async () => {
      const ambientes = new AmbientesFake();
      ambientes.porId.set('amb-1', ambiente(TipoDeAmbiente.OUTDOOR));
      const dados = new DadosFake();
      await new DefinirDadosClimaticosUseCase(dados, ambientes, idSeq()).executar({
        usuarioId: USUARIO,
        ambienteId: 'amb-1',
        localizacaoAproximada: 'Curitiba, PR',
      });

      const view = await new ObterDadosClimaticosUseCase(dados, ambientes).executar({
        usuarioId: USUARIO,
        ambienteId: 'amb-1',
      });
      expect(view.localizacaoAproximada).toBe('Curitiba, PR');
    });
  });

  describe('RemoverDadosClimaticos', () => {
    it('desativa o módulo e é idempotente', async () => {
      const ambientes = new AmbientesFake();
      ambientes.porId.set('amb-1', ambiente(TipoDeAmbiente.OUTDOOR));
      const dados = new DadosFake();
      await new DefinirDadosClimaticosUseCase(dados, ambientes, idSeq()).executar({
        usuarioId: USUARIO,
        ambienteId: 'amb-1',
      });

      const uc = new RemoverDadosClimaticosUseCase(dados, ambientes);
      await uc.executar({ usuarioId: USUARIO, ambienteId: 'amb-1' });
      await uc.executar({ usuarioId: USUARIO, ambienteId: 'amb-1' }); // idempotente
      expect(dados.porAmbiente.size).toBe(0);
    });
  });
});
