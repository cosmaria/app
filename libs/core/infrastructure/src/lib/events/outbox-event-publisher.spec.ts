import type { OutboxRegistro, OutboxRepository } from '@cosmaria/core-application';
import type { DomainEvent } from '@cosmaria/core-domain';
import { OutboxEventPublisher } from './outbox-event-publisher';
import { InProcessEventPublisher } from './in-process-event-publisher';

class FakeOutbox implements OutboxRepository {
  enfileirados: OutboxRegistro[] = [];
  async enfileirar(r: OutboxRegistro): Promise<void> {
    this.enfileirados.push(r);
  }
  async buscarDevidos(): Promise<OutboxRegistro[]> {
    return [];
  }
  marcarEntregue(): Promise<void> {
    return Promise.resolve();
  }
  reprogramar(): Promise<void> {
    return Promise.resolve();
  }
  marcarMorto(): Promise<void> {
    return Promise.resolve();
  }
}

class IdSequencial {
  private n = 0;
  gerar(): string {
    return `id-${++this.n}`;
  }
}

class EvDose implements DomainEvent {
  readonly nome = 'DoseRegistrada';
  constructor(
    readonly usuarioId: string,
    readonly usadoEm: Date,
    readonly ocorridoEm: Date = new Date('2026-07-12T00:00:00.000Z'),
  ) {}
}

describe('OutboxEventPublisher', () => {
  it('persiste o evento com id gerado, payload de contrato e assinantes pendentes', async () => {
    const bus = new InProcessEventPublisher();
    bus.assinar('DoseRegistrada', () => undefined, 'ia.ingestao');
    bus.assinar('DoseRegistrada', () => undefined, 'core.notificacao');
    const outbox = new FakeOutbox();
    const pub = new OutboxEventPublisher(outbox, bus, new IdSequencial());

    await pub.publicar(new EvDose('u1', new Date('2026-07-12T09:00:00.000Z')));

    expect(outbox.enfileirados).toHaveLength(1);
    const r = outbox.enfileirados[0];
    expect(r.id).toBe('id-1');
    expect(r.nome).toBe('DoseRegistrada');
    expect(r.pendentes).toEqual(['ia.ingestao', 'core.notificacao']);
    // envelope (nome/ocorridoEm/id) não vaza para o payload
    expect(r.payload).toEqual({ usuarioId: 'u1', usadoEm: new Date('2026-07-12T09:00:00.000Z') });
    expect(r.payload).not.toHaveProperty('nome');
    expect(r.payload).not.toHaveProperty('ocorridoEm');
  });

  it('é no-op quando ninguém assina o evento (não polui a tabela)', async () => {
    const bus = new InProcessEventPublisher();
    const outbox = new FakeOutbox();
    const pub = new OutboxEventPublisher(outbox, bus, new IdSequencial());

    await pub.publicar(new EvDose('u1', new Date()));

    expect(outbox.enfileirados).toHaveLength(0);
  });
});
