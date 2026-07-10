import { AcessoNegadoError } from '@cosmaria/core-domain';
import { Severidade, TipoDeManejo, TipoDeSanidade } from './catalogos-de-evento';
import { EventoManejo } from './evento-manejo.entity';
import { EventoSanidade } from './evento-sanidade.entity';

const AGORA = new Date('2026-07-09T12:00:00Z');
const emDias = (dias: number) => new Date(AGORA.getTime() + dias * 86_400_000);

describe('EventoManejo (doc 02 §5.7 — histórico imutável)', () => {
  const registrar = (over: Partial<Parameters<typeof EventoManejo.registrar>[0]> = {}) =>
    EventoManejo.registrar({
      id: 'm-1',
      usuarioId: 'u-1',
      cicloId: 'c-1',
      tipo: TipoDeManejo.TOPPING,
      criadoEm: AGORA,
      ...over,
    });

  it('sem planta, o manejo vale para o ciclo inteiro', () => {
    expect(registrar({ tipo: TipoDeManejo.FERTILIZACAO }).plantaId).toBeNull();
  });

  it('com planta, o manejo é daquela planta', () => {
    expect(registrar({ plantaId: 'p-1' }).plantaId).toBe('p-1');
  });

  it('sem data informada, o manejo ocorreu agora', () => {
    expect(registrar().ocorridoEm).toEqual(AGORA);
  });

  it('o manejo pode ser registrado com data retroativa', () => {
    const ontem = emDias(-1);
    expect(registrar({ ocorridoEm: ontem }).ocorridoEm).toEqual(ontem);
  });

  it('não expõe nenhum método de edição — o que aconteceu, aconteceu', () => {
    const evento = registrar();
    expect('atualizar' in evento).toBe(false);
    expect('remover' in evento).toBe(false);
  });

  it('só o dono acessa', () => {
    expect(() => registrar().garantirAutoria('intruso')).toThrow(AcessoNegadoError);
  });
});

describe('EventoSanidade (doc 02 §5.8)', () => {
  const registrar = (over: Partial<Parameters<typeof EventoSanidade.registrar>[0]> = {}) =>
    EventoSanidade.registrar({
      id: 's-1',
      usuarioId: 'u-1',
      cicloId: 'c-1',
      tipo: TipoDeSanidade.PRAGA,
      severidade: Severidade.MEDIA,
      descricao: 'ácaros nas folhas baixas',
      criadoEm: AGORA,
      ...over,
    });

  it('nasce em aberto, sem tratamento aplicado', () => {
    const evento = registrar();
    expect(evento.estaResolvido()).toBe(false);
    expect(evento.resolvidoEm).toBeNull();
    expect(evento.tratamentoAplicado).toBeNull();
  });

  it('resolver marca a data e aceita o tratamento aplicado', () => {
    const evento = registrar();
    evento.resolver({ tratamentoAplicado: 'óleo de neem', agora: emDias(3) });

    expect(evento.estaResolvido()).toBe(true);
    expect(evento.resolvidoEm).toEqual(emDias(3));
    expect(evento.tratamentoAplicado).toBe('óleo de neem');
  });

  it('resolver é idempotente — a data original não é sobrescrita', () => {
    const evento = registrar();
    evento.resolver({ agora: emDias(3) });
    evento.resolver({ agora: emDias(10) });
    expect(evento.resolvidoEm).toEqual(emDias(3));
  });

  it('o tratamento pode ser complementado depois, sem mover a resolução', () => {
    const evento = registrar();
    evento.resolver({ agora: emDias(3) });
    evento.resolver({ tratamentoAplicado: 'óleo de neem + poda', agora: emDias(5) });

    expect(evento.tratamentoAplicado).toBe('óleo de neem + poda');
    expect(evento.resolvidoEm).toEqual(emDias(3));
  });

  it('a severidade observada nunca muda — piorar é uma NOVA ocorrência', () => {
    const primeira = registrar({ id: 's-1', severidade: Severidade.BAIXA });
    const reincidencia = registrar({
      id: 's-2',
      severidade: Severidade.ALTA,
      ocorridoEm: emDias(7),
    });

    // É assim que a IA enxerga reincidência: dois registros, não um editado.
    expect(primeira.severidade).toBe(Severidade.BAIXA);
    expect(reincidencia.severidade).toBe(Severidade.ALTA);
    expect('mudarSeveridade' in primeira).toBe(false);
  });

  it('só o dono acessa', () => {
    expect(() => registrar().garantirAutoria('intruso')).toThrow(AcessoNegadoError);
  });
});
