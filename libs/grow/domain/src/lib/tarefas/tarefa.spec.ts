import { AcessoNegadoError } from '@cosmaria/core-domain';
import { OrigemDaTarefa, StatusDaTarefa, TipoDeTarefa } from './catalogos-de-tarefa';
import { Tarefa } from './tarefa.entity';

const AGORA = new Date('2026-07-10T12:00:00Z');
const emDias = (dias: number) => new Date(AGORA.getTime() + dias * 86_400_000);

describe('Tarefa (doc 02 §5.10 — plano de ação mutável)', () => {
  const criar = (over: Partial<Parameters<typeof Tarefa.criar>[0]> = {}) =>
    Tarefa.criar({
      id: 't-1',
      usuarioId: 'u-1',
      cicloId: 'c-1',
      titulo: 'Regar',
      tipo: TipoDeTarefa.REGA,
      criadoEm: AGORA,
      ...over,
    });

  it('nasce pendente, manual e sem conclusão', () => {
    const t = criar();
    expect(t.status).toBe(StatusDaTarefa.PENDENTE);
    expect(t.origem).toBe(OrigemDaTarefa.MANUAL);
    expect(t.concluidaEm).toBeNull();
    expect(t.estaConcluida()).toBe(false);
  });

  it('sem planta, a tarefa vale para o ciclo inteiro', () => {
    expect(criar().plantaId).toBeNull();
    expect(criar({ plantaId: 'p-1' }).plantaId).toBe('p-1');
  });

  it('concluir marca status e data', () => {
    const t = criar();
    t.concluir(emDias(1));
    expect(t.estaConcluida()).toBe(true);
    expect(t.concluidaEm).toEqual(emDias(1));
  });

  it('concluir é idempotente — não move a data original', () => {
    const t = criar();
    t.concluir(emDias(1));
    t.concluir(emDias(5));
    expect(t.concluidaEm).toEqual(emDias(1));
  });

  it('pode ser editada enquanto plano (o oposto do manejo histórico)', () => {
    const t = criar();
    t.atualizar({ titulo: 'Regar bem', previstaPara: emDias(2) }, emDias(1));
    expect(t.titulo).toBe('Regar bem');
    expect(t.previstaPara).toEqual(emDias(2));
  });

  describe('recorrência', () => {
    it('tarefa pontual não gera próxima ocorrência', () => {
      expect(criar().proximaOcorrencia('t-2')).toBeNull();
    });

    it('tarefa recorrente gera a próxima avançando a partir da data prevista', () => {
      const t = criar({ recorrenciaDias: 3, previstaPara: AGORA });
      const proxima = t.proximaOcorrencia('t-2', emDias(1));
      expect(proxima).not.toBeNull();
      expect(proxima?.previstaPara).toEqual(emDias(3));
      expect(proxima?.recorrenciaDias).toBe(3);
      expect(proxima?.status).toBe(StatusDaTarefa.PENDENTE);
      expect(proxima?.id).toBe('t-2');
    });

    it('sem data prevista, a próxima ocorrência parte de agora', () => {
      const t = criar({ recorrenciaDias: 2 });
      const proxima = t.proximaOcorrencia('t-2', AGORA);
      expect(proxima?.previstaPara).toEqual(emDias(2));
    });

    it('é recorrente quando tem recorrência em dias', () => {
      expect(criar({ recorrenciaDias: 7 }).ehRecorrente()).toBe(true);
      expect(criar().ehRecorrente()).toBe(false);
    });
  });

  it('só o dono acessa', () => {
    expect(() => criar().garantirAutoria('intruso')).toThrow(AcessoNegadoError);
  });
});
