import { AcessoNegadoError } from '@cosmaria/core-domain';
import {
  arredondar,
  calcularDli,
  calcularVpdKpa,
  pressaoDeVaporDeSaturacaoKpa,
} from './calculos-ambientais';
import { OrigemDoRegistro, RegistroAmbiental } from './registro-ambiental.entity';

describe('pressaoDeVaporDeSaturacaoKpa (Tetens)', () => {
  it('bate com os valores de referência da literatura', () => {
    // A 20 °C a SVP é ~2,338 kPa; a 25 °C, ~3,168 kPa.
    expect(arredondar(pressaoDeVaporDeSaturacaoKpa(20), 3)).toBeCloseTo(2.338, 2);
    expect(arredondar(pressaoDeVaporDeSaturacaoKpa(25), 3)).toBeCloseTo(3.168, 2);
  });

  it('cresce com a temperatura', () => {
    expect(pressaoDeVaporDeSaturacaoKpa(30)).toBeGreaterThan(pressaoDeVaporDeSaturacaoKpa(20));
  });
});

describe('calcularVpdKpa (doc 02 §5.6)', () => {
  it('ar saturado tem VPD zero', () => {
    expect(calcularVpdKpa({ temperaturaC: 25, umidadeRelativa: 100 })).toBe(0);
  });

  it('ar totalmente seco tem VPD igual à SVP', () => {
    const vpd = calcularVpdKpa({ temperaturaC: 25, umidadeRelativa: 0 });
    expect(vpd).toBeCloseTo(pressaoDeVaporDeSaturacaoKpa(25), 5);
  });

  it('25 °C e 60% de UR dão ~1,27 kPa de VPD do ar', () => {
    expect(calcularVpdKpa({ temperaturaC: 25, umidadeRelativa: 60 })).toBeCloseTo(1.267, 2);
  });

  it('folha mais fria que o ar reduz o VPD sentido pela planta', () => {
    const doAr = calcularVpdKpa({ temperaturaC: 25, umidadeRelativa: 60 });
    const daFolha = calcularVpdKpa({ temperaturaC: 25, umidadeRelativa: 60, deltaFolhaC: 2 });
    expect(daFolha).toBeLessThan(doAr);
  });

  it('nunca é negativo — umidade acima da saturação é ruído de sensor', () => {
    expect(calcularVpdKpa({ temperaturaC: 25, umidadeRelativa: 120 })).toBe(0);
  });

  it('mais umidade, menos VPD', () => {
    const seco = calcularVpdKpa({ temperaturaC: 25, umidadeRelativa: 40 });
    const umido = calcularVpdKpa({ temperaturaC: 25, umidadeRelativa: 80 });
    expect(seco).toBeGreaterThan(umido);
  });
});

describe('calcularDli (doc 02 §5.6)', () => {
  it('600 µmol/m²/s por 18 h dão ~38,88 mol/m²/dia', () => {
    expect(calcularDli({ ppfd: 600, horasDeLuz: 18 })).toBeCloseTo(38.88, 2);
  });

  it('luz apagada zera o DLI', () => {
    expect(calcularDli({ ppfd: 900, horasDeLuz: 0 })).toBe(0);
  });

  it('um LED fraco por muitas horas iguala um LED forte por poucas', () => {
    expect(calcularDli({ ppfd: 300, horasDeLuz: 24 })).toBeCloseTo(
      calcularDli({ ppfd: 600, horasDeLuz: 12 }),
      5,
    );
  });
});

describe('RegistroAmbiental (Arquétipo B — série temporal, append-only)', () => {
  const registrar = (over: Partial<Parameters<typeof RegistroAmbiental.registrar>[0]> = {}) =>
    RegistroAmbiental.registrar({
      id: 'r-1',
      usuarioId: 'u-1',
      cicloId: 'c-1',
      temperaturaC: 25,
      umidadeRelativa: 60,
      ...over,
    });

  it('nasce MANUAL — sensores e importação virão sem migração de schema (doc 08 §6)', () => {
    expect(registrar().origem).toBe(OrigemDoRegistro.MANUAL);
  });

  it('calcula e persiste o VPD a partir de temperatura e umidade', () => {
    expect(registrar().vpdKpa).toBeCloseTo(1.267, 2);
  });

  it('calcula o DLI a partir de PPFD e horas de luz', () => {
    expect(registrar({ ppfd: 600, horasDeLuz: 18 }).dli).toBeCloseTo(38.88, 2);
  });

  it('sem umidade não há VPD — um derivado não se inventa a partir de insumo ausente', () => {
    const registro = registrar({ umidadeRelativa: null });
    expect(registro.vpdKpa).toBeNull();
    expect(registro.temperaturaC).toBe(25);
  });

  it('sem horas de luz não há DLI, mesmo com PPFD', () => {
    expect(registrar({ ppfd: 600 }).dli).toBeNull();
  });

  it('o iniciante registra só temperatura e umidade, e isso é um check-in válido', () => {
    const registro = registrar();
    expect(registro.possuiAlgumaMedicao()).toBe(true);
    expect(registro.ec).toBeNull();
    expect(registro.ppfd).toBeNull();
  });

  it('um registro sem nenhuma medição não é um check-in', () => {
    const vazio = registrar({ temperaturaC: null, umidadeRelativa: null });
    expect(vazio.possuiAlgumaMedicao()).toBe(false);
  });

  it('a medição pode ser do ambiente (sem planta) ou específica de uma planta', () => {
    expect(registrar().plantaId).toBeNull();
    expect(registrar({ plantaId: 'p-1', ph: 6.2 }).plantaId).toBe('p-1');
  });

  it('registro de sensor declara a própria origem', () => {
    expect(registrar({ origem: OrigemDoRegistro.SENSOR }).origem).toBe(OrigemDoRegistro.SENSOR);
  });

  it('só o dono acessa o próprio registro', () => {
    expect(() => registrar().garantirAutoria('intruso')).toThrow(AcessoNegadoError);
  });
});
