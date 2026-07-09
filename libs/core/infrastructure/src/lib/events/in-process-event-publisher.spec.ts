import type { DomainEvent } from '@cosmaria/core-domain';
import { InProcessEventPublisher } from './in-process-event-publisher';

const evento = (nome: string): DomainEvent => ({ nome, ocorridoEm: new Date() });

describe('InProcessEventPublisher', () => {
  it('entrega o evento aos assinantes do mesmo nome', async () => {
    const bus = new InProcessEventPublisher();
    const recebidos: DomainEvent[] = [];
    bus.assinar('ConfiguracaoDeCompartilhamentoAlterada', (e) => {
      recebidos.push(e);
    });

    await bus.publicar(evento('ConfiguracaoDeCompartilhamentoAlterada'));

    expect(recebidos).toHaveLength(1);
    expect(recebidos[0].nome).toBe('ConfiguracaoDeCompartilhamentoAlterada');
  });

  it('não entrega a assinantes de outro nome de evento', async () => {
    const bus = new InProcessEventPublisher();
    const recebidos: DomainEvent[] = [];
    bus.assinar('OutroEvento', (e) => {
      recebidos.push(e);
    });

    await bus.publicar(evento('ConfiguracaoDeCompartilhamentoAlterada'));

    expect(recebidos).toHaveLength(0);
  });

  it('publicar sem assinantes não lança', async () => {
    const bus = new InProcessEventPublisher();
    await expect(bus.publicar(evento('SemAssinante'))).resolves.toBeUndefined();
  });
});
