import { AcessoNegadoError } from '@cosmaria/core-domain';
import { FonteDeDadosClimaticos } from './catalogos-outdoor';
import { DadosClimaticos } from './dados-climaticos.entity';

const AGORA = new Date('2026-07-11T12:00:00Z');

describe('DadosClimaticos (doc 02 §6 — Módulo Outdoor)', () => {
  const configurar = (over: Partial<Parameters<typeof DadosClimaticos.configurar>[0]> = {}) =>
    DadosClimaticos.configurar({
      id: 'dc-1',
      usuarioId: 'u-1',
      ambienteId: 'amb-1',
      localizacaoAproximada: 'Curitiba, PR',
      criadoEm: AGORA,
      ...over,
    });

  it('nasce com fonte MANUAL por padrão (API climática é V2)', () => {
    expect(configurar().fonte).toBe(FonteDeDadosClimaticos.MANUAL);
  });

  it('localização em branco vira null (opt-in, nunca string vazia)', () => {
    expect(configurar({ localizacaoAproximada: '   ' }).localizacaoAproximada).toBeNull();
  });

  it('guarda coordenadas aproximadas quando informadas', () => {
    const dc = configurar({ latitudeAproximada: -25.42, longitudeAproximada: -49.27 });
    expect(dc.latitudeAproximada).toBe(-25.42);
    expect(dc.longitudeAproximada).toBe(-49.27);
  });

  it('atualiza campos e limpa com null', () => {
    const dc = configurar();
    dc.atualizar({ localizacaoAproximada: null, observacoes: 'muito sol à tarde' });
    expect(dc.localizacaoAproximada).toBeNull();
    expect(dc.observacoes).toBe('muito sol à tarde');
  });

  it('só o dono acessa', () => {
    expect(() => configurar().garantirAutoria('intruso')).toThrow(AcessoNegadoError);
  });
});
