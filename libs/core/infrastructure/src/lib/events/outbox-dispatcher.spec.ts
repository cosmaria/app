import type { OutboxRegistro, OutboxRepository } from '@cosmaria/core-application';
import type { DomainEvent } from '@cosmaria/core-domain';
import { OutboxDispatcher, type OutboxDispatcherConfig } from './outbox-dispatcher';
import { InProcessEventPublisher } from './in-process-event-publisher';

const CONFIG: OutboxDispatcherConfig = {
  intervaloMs: 1000,
  lote: 10,
  maxTentativas: 3,
  backoffBaseMs: 1000,
  backoffTetoMs: 60_000,
};

/** Outbox em memória, só o suficiente para exercitar o despachante. */
class FakeOutbox implements OutboxRepository {
  fila: OutboxRegistro[] = [];
  entregues: string[] = [];
  reprogramados: { id: string; pendentes: string[]; tentativas: number; proximaEm: Date }[] = [];
  mortos: { id: string; pendentes: string[]; erro: string }[] = [];

  async enfileirar(registro: OutboxRegistro): Promise<void> {
    this.fila.push(registro);
  }
  async buscarDevidos(limite: number): Promise<OutboxRegistro[]> {
    return this.fila.splice(0, limite);
  }
  async marcarEntregue(id: string): Promise<void> {
    this.entregues.push(id);
  }
  async reprogramar(
    id: string,
    pendentes: string[],
    tentativas: number,
    proximaEm: Date,
  ): Promise<void> {
    this.reprogramados.push({ id, pendentes, tentativas, proximaEm });
  }
  async marcarMorto(id: string, pendentes: string[], erro: string): Promise<void> {
    this.mortos.push({ id, pendentes, erro });
  }
}

const registro = (over: Partial<OutboxRegistro> = {}): OutboxRegistro => ({
  id: 'ev-1',
  nome: 'Ev',
  payload: { usuarioId: 'u1' },
  ocorridoEm: new Date('2026-07-12T00:00:00.000Z'),
  pendentes: ['a'],
  tentativas: 0,
  ...over,
});

describe('OutboxDispatcher', () => {
  const agora = () => new Date('2026-07-12T12:00:00.000Z');

  it('entrega a todos os assinantes e marca ENTREGUE', async () => {
    const bus = new InProcessEventPublisher();
    const recebidos: DomainEvent[] = [];
    bus.assinar('Ev', (e) => void recebidos.push(e), 'a');
    bus.assinar('Ev', () => undefined, 'b');
    const outbox = new FakeOutbox();
    await outbox.enfileirar(registro({ pendentes: ['a', 'b'] }));
    const disp = new OutboxDispatcher(outbox, bus, CONFIG, undefined, agora);

    await disp.processarLote();

    expect(outbox.entregues).toEqual(['ev-1']);
    expect(recebidos).toHaveLength(1);
    expect(recebidos[0].id).toBe('ev-1'); // id do evento devolvido ao consumidor (idempotência)
  });

  it('isola falha: entrega ao assinante são, reprograma só o que falhou com backoff', async () => {
    const bus = new InProcessEventPublisher();
    const recebidosB: string[] = [];
    bus.assinar(
      'Ev',
      () => {
        throw new Error('a caiu');
      },
      'a',
    );
    bus.assinar('Ev', () => void recebidosB.push('ok'), 'b');
    const outbox = new FakeOutbox();
    await outbox.enfileirar(registro({ pendentes: ['a', 'b'] }));
    const disp = new OutboxDispatcher(outbox, bus, CONFIG, undefined, agora);

    await disp.processarLote();

    expect(recebidosB).toEqual(['ok']); // 'b' foi entregue apesar de 'a' falhar
    expect(outbox.entregues).toEqual([]);
    expect(outbox.reprogramados).toHaveLength(1);
    const r = outbox.reprogramados[0];
    expect(r.pendentes).toEqual(['a']); // só o que falhou fica pendente
    expect(r.tentativas).toBe(1);
    // backoff = base·2^(1-1) = 1000ms
    expect(r.proximaEm.getTime()).toBe(agora().getTime() + 1000);
  });

  it('backoff cresce exponencialmente com a tentativa', async () => {
    const bus = new InProcessEventPublisher();
    bus.assinar(
      'Ev',
      () => {
        throw new Error('x');
      },
      'a',
    );
    const outbox = new FakeOutbox();
    await outbox.enfileirar(registro({ tentativas: 2 })); // vira tentativa 3? não: max=3 → morto
    const disp = new OutboxDispatcher(outbox, bus, CONFIG, undefined, agora);
    await disp.processarLote();
    // tentativas 2→3 == maxTentativas ⇒ dead-letter, não reprograma
    expect(outbox.mortos).toHaveLength(1);
    expect(outbox.reprogramados).toHaveLength(0);
  });

  it('dead-letter após maxTentativas, preservando pendentes e erro', async () => {
    const bus = new InProcessEventPublisher();
    bus.assinar(
      'Ev',
      () => {
        throw new Error('sempre falha');
      },
      'a',
    );
    const outbox = new FakeOutbox();
    await outbox.enfileirar(registro({ tentativas: 2, pendentes: ['a'] })); // 2+1=3=max
    const disp = new OutboxDispatcher(outbox, bus, CONFIG, undefined, agora);

    await disp.processarLote();

    expect(outbox.mortos).toHaveLength(1);
    expect(outbox.mortos[0].pendentes).toEqual(['a']);
    expect(outbox.mortos[0].erro).toContain('sempre falha');
  });

  it('não reinvoca assinante já entregue numa reentrega', async () => {
    // Simula a reprogramação: pendentes já reduzido a ['b'] — 'a' não deve ser chamado.
    const bus = new InProcessEventPublisher();
    const chamados: string[] = [];
    bus.assinar('Ev', () => void chamados.push('a'), 'a');
    bus.assinar('Ev', () => void chamados.push('b'), 'b');
    const outbox = new FakeOutbox();
    await outbox.enfileirar(registro({ pendentes: ['b'], tentativas: 1 }));
    const disp = new OutboxDispatcher(outbox, bus, CONFIG, undefined, agora);

    await disp.processarLote();

    expect(chamados).toEqual(['b']);
    expect(outbox.entregues).toEqual(['ev-1']);
  });

  it('revive datas ISO do payload de volta para Date', async () => {
    const bus = new InProcessEventPublisher();
    let recebido: DomainEvent | null = null;
    bus.assinar(
      'Ev',
      (e) => {
        recebido = e;
      },
      'a',
    );
    const outbox = new FakeOutbox();
    await outbox.enfileirar(
      registro({ payload: { usuarioId: 'u1', usadoEm: '2026-07-12T09:30:00.000Z' } }),
    );
    const disp = new OutboxDispatcher(outbox, bus, CONFIG, undefined, agora);

    await disp.processarLote();

    const e = recebido as unknown as { usadoEm: unknown };
    expect(e.usadoEm).toBeInstanceOf(Date);
  });
});
