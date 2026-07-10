import { AcessoNegadoError } from '@cosmaria/core-domain';
import { ColheitaSemPlantasError } from '../errors/grow.errors';
import { Colheita } from './colheita.entity';
import { Secagem } from './secagem.entity';
import { Cura } from './cura.entity';
import { Lote } from './lote.entity';

const AGORA = new Date('2026-07-09T12:00:00Z');
const emDias = (dias: number) => new Date(AGORA.getTime() + dias * 86_400_000);

describe('Colheita (doc 02 §5.11 — fato histórico, colheita escalonada)', () => {
  const registrar = (over: Partial<Parameters<typeof Colheita.registrar>[0]> = {}) =>
    Colheita.registrar({
      id: 'col-1',
      usuarioId: 'u-1',
      cicloId: 'c-1',
      plantaIds: ['p-1', 'p-2'],
      criadoEm: AGORA,
      ...over,
    });

  it('referencia um subconjunto de plantas do ciclo', () => {
    expect(registrar().plantaIds).toEqual(['p-1', 'p-2']);
    expect(registrar().quantidadeDePlantas()).toBe(2);
  });

  it('deduplica plantas repetidas', () => {
    expect(registrar({ plantaIds: ['p-1', 'p-1', 'p-2'] }).quantidadeDePlantas()).toBe(2);
  });

  it('recusa colheita sem nenhuma planta', () => {
    expect(() => registrar({ plantaIds: [] })).toThrow(ColheitaSemPlantasError);
  });

  it('peso úmido é opcional', () => {
    expect(registrar().pesoUmidoGramas).toBeNull();
    expect(registrar({ pesoUmidoGramas: 480 }).pesoUmidoGramas).toBe(480);
  });

  it('não expõe método de edição — o que foi colhido, foi colhido', () => {
    const colheita = registrar();
    expect('atualizar' in colheita).toBe(false);
    expect('remover' in colheita).toBe(false);
  });

  it('só o dono acessa', () => {
    expect(() => registrar().garantirAutoria('intruso')).toThrow(AcessoNegadoError);
  });
});

describe('Secagem (doc 02 §5.11 — finalização monotônica)', () => {
  const registrar = (over: Partial<Parameters<typeof Secagem.registrar>[0]> = {}) =>
    Secagem.registrar({
      id: 'sec-1',
      usuarioId: 'u-1',
      colheitaId: 'col-1',
      iniciadaEm: AGORA,
      criadoEm: AGORA,
      ...over,
    });

  it('nasce em andamento, sem duração ainda', () => {
    const s = registrar();
    expect(s.estaFinalizada()).toBe(false);
    expect(s.duracaoEmDias()).toBeNull();
  });

  it('finalizar marca a data e calcula a duração', () => {
    const s = registrar();
    s.finalizar(emDias(7));
    expect(s.estaFinalizada()).toBe(true);
    expect(s.duracaoEmDias()).toBe(7);
  });

  it('finalizar é idempotente — a data original não é sobrescrita', () => {
    const s = registrar();
    s.finalizar(emDias(7));
    s.finalizar(emDias(20));
    expect(s.finalizadaEm).toEqual(emDias(7));
  });

  it('pode ser registrada já finalizada (retroativa)', () => {
    const s = registrar({ finalizadaEm: emDias(5) });
    expect(s.duracaoEmDias()).toBe(5);
  });

  it('só o dono acessa', () => {
    expect(() => registrar().garantirAutoria('intruso')).toThrow(AcessoNegadoError);
  });
});

describe('Cura (doc 02 §5.11 — burping)', () => {
  const registrar = (over: Partial<Parameters<typeof Cura.registrar>[0]> = {}) =>
    Cura.registrar({
      id: 'cur-1',
      usuarioId: 'u-1',
      secagemId: 'sec-1',
      iniciadaEm: AGORA,
      criadoEm: AGORA,
      ...over,
    });

  it('registra anotações de burping', () => {
    expect(registrar({ burping: 'aberto 2x/dia na 1a semana' }).burping).toBe(
      'aberto 2x/dia na 1a semana',
    );
  });

  it('finalizar é monotônico', () => {
    const c = registrar();
    c.finalizar(emDias(21));
    c.finalizar(emDias(40));
    expect(c.finalizadaEm).toEqual(emDias(21));
    expect(c.duracaoEmDias()).toBe(21);
  });
});

describe('Lote (doc 02 §5.11 — unidade terminal, rendimento)', () => {
  const gerar = (over: Partial<Parameters<typeof Lote.gerar>[0]> = {}) =>
    Lote.gerar({
      id: 'lot-1',
      usuarioId: 'u-1',
      curaId: 'cur-1',
      codigo: 'OG-2026-01',
      pesoSecoGramas: 120,
      geradoEm: AGORA,
      ...over,
    });

  it('guarda o rendimento seco final', () => {
    expect(gerar().pesoSecoGramas).toBe(120);
  });

  it('deriva o rendimento por planta a partir da colheita de origem', () => {
    expect(gerar().gramasPorPlanta(2)).toBe(60);
    expect(gerar().gramasPorPlanta(0)).toBeNull();
  });

  it('normaliza o código', () => {
    expect(gerar({ codigo: '  OG-01  ' }).codigo).toBe('OG-01');
  });

  it('só o dono acessa', () => {
    expect(() => gerar().garantirAutoria('intruso')).toThrow(AcessoNegadoError);
  });
});
