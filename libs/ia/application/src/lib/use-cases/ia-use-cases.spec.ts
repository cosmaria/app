import type { IdGenerator } from '@cosmaria/core-application';
import type { DomainEvent } from '@cosmaria/core-domain';
import {
  DominioDeDado,
  Fator,
  FatorDesconhecidoError,
  PoliticaDeAgregacao,
  type PontoDeSerie,
} from '@cosmaria/ia-domain';
import type { JanelaTemporal, PontoDeSerieRepository } from '../ports/ia.repositories';
import { IngerirEventoService } from './ingestao.service';
import { CalcularCorrelacaoUseCase } from './correlacao.use-cases';

class RepoFake implements PontoDeSerieRepository {
  readonly pontos: PontoDeSerie[] = [];
  salvarVarios(pontos: PontoDeSerie[]): Promise<void> {
    this.pontos.push(...pontos);
    return Promise.resolve();
  }
  listarPorFator(
    usuarioId: string,
    dominio: DominioDeDado,
    fator: Fator,
    janela?: JanelaTemporal,
  ): Promise<PontoDeSerie[]> {
    return Promise.resolve(
      this.pontos
        .filter((p) => p.usuarioId === usuarioId && p.dominio === dominio && p.fator === fator)
        .filter((p) => !janela?.de || p.ocorridoEm >= janela.de)
        .filter((p) => !janela?.ate || p.ocorridoEm <= janela.ate),
    );
  }
  contarPorFator(usuarioId: string, dominio: DominioDeDado, fator: Fator): Promise<number> {
    return Promise.resolve(
      this.pontos.filter(
        (p) => p.usuarioId === usuarioId && p.dominio === dominio && p.fator === fator,
      ).length,
    );
  }
  ultimoPorFator(
    usuarioId: string,
    dominio: DominioDeDado,
    fator: Fator,
  ): Promise<PontoDeSerie | null> {
    const doFator = this.pontos
      .filter((p) => p.usuarioId === usuarioId && p.dominio === dominio && p.fator === fator)
      .sort((a, b) => a.ocorridoEm.getTime() - b.ocorridoEm.getTime());
    return Promise.resolve(doFator.length > 0 ? doFator[doFator.length - 1] : null);
  }
}

const ids = (): IdGenerator => {
  let n = 0;
  return { gerar: () => `p-${++n}` };
};

// Eventos duck-typed: espelham o payload publicado por Grow/Med, sem importar suas classes.
const evSintoma = (usuarioId: string, dia: string, dor: number | null): DomainEvent =>
  ({
    nome: 'SintomaDiarioRegistrado',
    ocorridoEm: new Date(`2026-07-${dia}T09:00:00Z`),
    usuarioId,
    registroId: `sd-${dia}`,
    humor: null,
    ansiedade: null,
    dor,
    sono: null,
    apetite: null,
  }) as unknown as DomainEvent;

const evDose = (usuarioId: string, dia: string, quantidade: number): DomainEvent =>
  ({
    nome: 'DoseRegistrada',
    ocorridoEm: new Date(`2026-07-${dia}T08:00:00Z`),
    usuarioId,
    registroDeUsoId: `ru-${dia}`,
    produtoId: 'prod',
    usadoEm: new Date(`2026-07-${dia}T08:00:00Z`),
    quantidade,
  }) as unknown as DomainEvent;

describe('IA — casos de uso', () => {
  describe('IngerirEventoService', () => {
    it('mapeia SintomaDiarioRegistrado só nas dimensões preenchidas', async () => {
      const repo = new RepoFake();
      await new IngerirEventoService(repo, ids()).ingerir(evSintoma('u1', '01', 5));
      expect(repo.pontos).toHaveLength(1);
      expect(repo.pontos[0].fator).toBe(Fator.DOR);
      expect(repo.pontos[0].valor).toBe(5);
      expect(repo.pontos[0].dominio).toBe(DominioDeDado.MED);
    });

    it('ignora evento sem manipulador', async () => {
      const repo = new RepoFake();
      await new IngerirEventoService(repo, ids()).ingerir({
        nome: 'EventoDesconhecido',
        ocorridoEm: new Date(),
      } as DomainEvent);
      expect(repo.pontos).toHaveLength(0);
    });

    it('usa usadoEm (horário clínico) na dose, não o momento de publicação', async () => {
      const repo = new RepoFake();
      await new IngerirEventoService(repo, ids()).ingerir(evDose('u1', '03', 2));
      expect(repo.pontos[0].ocorridoEm.toISOString()).toContain('2026-07-03');
    });
  });

  describe('CalcularCorrelacaoUseCase', () => {
    const montar = async () => {
      const repo = new RepoFake();
      const ing = new IngerirEventoService(repo, ids());
      for (const dia of ['01', '02', '03', '04']) {
        await ing.ingerir(evDose('u1', dia, Number(dia)));
        await ing.ingerir(evSintoma('u1', dia, 10 - Number(dia)));
      }
      return { repo, uc: new CalcularCorrelacaoUseCase(repo, PoliticaDeAgregacao.padrao()) };
    };

    it('rejeita fator desconhecido', async () => {
      const { uc } = await montar();
      await expect(
        uc.executar({ usuarioId: 'u1', dominio: 'MED', fatorA: 'DOSE', fatorB: 'MAGIA' }),
      ).rejects.toThrow(FatorDesconhecidoError);
    });

    it('correlaciona dose × dor do histórico próprio', async () => {
      const { uc } = await montar();
      // volumeMinimoProprio padrão = 7; só temos 4 dias → insuficiente.
      const r = await uc.executar({
        usuarioId: 'u1',
        dominio: 'MED',
        fatorA: 'DOSE',
        fatorB: 'DOR',
      });
      expect(r.suficiente).toBe(false);
      expect(r.limitacao).toContain('4 de 7');
    });
  });
});
