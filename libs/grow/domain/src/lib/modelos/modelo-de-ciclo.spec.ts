import { AcessoNegadoError } from '@cosmaria/core-domain';
import { FaseDeVida } from '../catalogos';
import { ModeloDeCiclo } from './modelo-de-ciclo.entity';

describe('ModeloDeCiclo (doc 02 §7 — template Premium)', () => {
  const criar = (over: Partial<Parameters<typeof ModeloDeCiclo.criar>[0]> = {}) =>
    ModeloDeCiclo.criar({ id: 'm-1', usuarioId: 'u-1', nome: 'Autoflor de verão', ...over });

  it('normaliza o nome e nasce com padrões opcionais nulos', () => {
    const m = criar({ nome: '  Indica indoor  ' });
    expect(m.nome).toBe('Indica indoor');
    expect(m.ambienteId).toBeNull();
    expect(m.geneticaId).toBeNull();
    expect(m.faseInicial).toBeNull();
  });

  it('guarda os padrões sugeridos quando informados', () => {
    const m = criar({
      ambienteId: 'amb-1',
      geneticaId: 'gen-1',
      faseInicial: FaseDeVida.VEGETATIVO,
      rotinaPadrao: 'regar a cada 2 dias',
    });
    expect(m.ambienteId).toBe('amb-1');
    expect(m.geneticaId).toBe('gen-1');
    expect(m.faseInicial).toBe(FaseDeVida.VEGETATIVO);
    expect(m.rotinaPadrao).toBe('regar a cada 2 dias');
  });

  it('só o dono acessa', () => {
    expect(() => criar().garantirAutoria('intruso')).toThrow(AcessoNegadoError);
  });
});
