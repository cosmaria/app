import type { DomainEvent } from '@cosmaria/core-domain';
import { InProcessEventPublisher } from './in-process-event-publisher';

const evento = (nome: string): DomainEvent => ({ nome, ocorridoEm: new Date() });

describe('InProcessEventPublisher', () => {
  it('entrega o evento aos assinantes do mesmo nome', async () => {
    const bus = new InProcessEventPublisher();
    const recebidos: DomainEvent[] = [];
    bus.assinar(
      'ConfiguracaoDeCompartilhamentoAlterada',
      (e) => {
        recebidos.push(e);
      },
      'teste',
    );

    await bus.publicar(evento('ConfiguracaoDeCompartilhamentoAlterada'));

    expect(recebidos).toHaveLength(1);
    expect(recebidos[0].nome).toBe('ConfiguracaoDeCompartilhamentoAlterada');
  });

  it('não entrega a assinantes de outro nome de evento', async () => {
    const bus = new InProcessEventPublisher();
    const recebidos: DomainEvent[] = [];
    bus.assinar(
      'OutroEvento',
      (e) => {
        recebidos.push(e);
      },
      'teste',
    );

    await bus.publicar(evento('ConfiguracaoDeCompartilhamentoAlterada'));

    expect(recebidos).toHaveLength(0);
  });

  it('publicar sem assinantes não lança', async () => {
    const bus = new InProcessEventPublisher();
    await expect(bus.publicar(evento('SemAssinante'))).resolves.toBeUndefined();
  });

  it('isola falhas: um assinante que lança não impede os demais, e é reportado', async () => {
    const bus = new InProcessEventPublisher();
    const recebidos: string[] = [];
    bus.assinar(
      'Ev',
      () => {
        throw new Error('falhou');
      },
      'assinante-a',
    );
    bus.assinar(
      'Ev',
      () => {
        recebidos.push('b');
      },
      'assinante-b',
    );

    const falhados = await bus.publicarLocal(evento('Ev'));

    expect(recebidos).toEqual(['b']);
    expect(falhados).toEqual(['assinante-a']);
  });

  it('assinantesDe lista os ids registrados; entregarPara invoca só um', async () => {
    const bus = new InProcessEventPublisher();
    const recebidos: string[] = [];
    bus.assinar('Ev', () => void recebidos.push('a'), 'a');
    bus.assinar('Ev', () => void recebidos.push('b'), 'b');

    expect(bus.assinantesDe('Ev')).toEqual(['a', 'b']);

    await bus.entregarPara('b', evento('Ev'));
    expect(recebidos).toEqual(['b']);
  });
});
