import { CicloCultivo } from '../ciclo-cultivo.entity';
import { FaseDeVida } from '../catalogos';
import { Severidade, TipoDeSanidade } from '../eventos-de-cultivo/catalogos-de-evento';
import { EventoSanidade } from '../eventos-de-cultivo/evento-sanidade.entity';
import { Colheita } from '../pos-colheita/colheita.entity';
import { Lote } from '../pos-colheita/lote.entity';
import {
  compararCiclos,
  duracaoTotalEmDias,
  montarEstatisticasDeCiclo,
  type ResumoAmbiental,
  resumirColheitas,
  resumirSanidade,
} from './estatisticas';

const AGORA = new Date('2026-07-10T12:00:00Z');
const emDias = (base: Date, dias: number) => new Date(base.getTime() + dias * 86_400_000);

const ambienteVazio: ResumoAmbiental = {
  totalRegistros: 0,
  temperaturaMedia: null,
  umidadeMedia: null,
  vpdMedio: null,
  dliMedio: null,
  phMedio: null,
  ecMedio: null,
};

const sanidade = (id: string, resolvido: boolean) => {
  const e = EventoSanidade.registrar({
    id,
    usuarioId: 'u-1',
    cicloId: 'c-1',
    tipo: TipoDeSanidade.PRAGA,
    severidade: Severidade.MEDIA,
    criadoEm: AGORA,
  });
  if (resolvido) e.resolver({ agora: emDias(AGORA, 1) });
  return e;
};

describe('resumirSanidade', () => {
  it('conta total, abertos e resolvidos', () => {
    const r = resumirSanidade([
      sanidade('s-1', false),
      sanidade('s-2', true),
      sanidade('s-3', true),
    ]);
    expect(r).toEqual({ total: 3, abertos: 1, resolvidos: 2 });
  });

  it('sem eventos, tudo zero', () => {
    expect(resumirSanidade([])).toEqual({ total: 0, abertos: 0, resolvidos: 0 });
  });
});

describe('resumirColheitas', () => {
  const colheita = (id: string, plantaIds: string[], pesoUmido: number | null) =>
    Colheita.registrar({
      id,
      usuarioId: 'u-1',
      cicloId: 'c-1',
      plantaIds,
      pesoUmidoGramas: pesoUmido,
    });
  const lote = (id: string, curaId: string, pesoSeco: number) =>
    Lote.gerar({ id, usuarioId: 'u-1', curaId, codigo: id, pesoSecoGramas: pesoSeco });

  it('soma rendimento e calcula gramas por planta sobre o total colhido', () => {
    const r = resumirColheitas(
      [colheita('col-1', ['p-1', 'p-2'], 500), colheita('col-2', ['p-3'], 300)],
      [lote('lot-1', 'cur-1', 120), lote('lot-2', 'cur-2', 60)],
    );
    expect(r.totalColheitas).toBe(2);
    expect(r.totalLotes).toBe(2);
    expect(r.totalPlantasColhidas).toBe(3);
    expect(r.pesoUmidoTotalGramas).toBe(800);
    expect(r.pesoSecoTotalGramas).toBe(180);
    expect(r.gramasPorPlanta).toBe(60); // 180 / 3
  });

  it('sem plantas colhidas, gramas por planta é null (não divide por zero)', () => {
    expect(resumirColheitas([], []).gramasPorPlanta).toBeNull();
  });

  it('peso úmido ausente conta como zero, não quebra a soma', () => {
    expect(resumirColheitas([colheita('col-1', ['p-1'], null)], []).pesoUmidoTotalGramas).toBe(0);
  });
});

describe('duracaoTotalEmDias', () => {
  it('ciclo encerrado usa a data de encerramento', () => {
    expect(duracaoTotalEmDias(AGORA, emDias(AGORA, 90))).toBe(90);
  });
  it('ciclo ativo conta até agora', () => {
    expect(duracaoTotalEmDias(AGORA, null, emDias(AGORA, 30))).toBe(30);
  });
});

describe('montarEstatisticasDeCiclo', () => {
  it('monta o relatório completo a partir do agregado e dos dados buscados', () => {
    const ciclo = CicloCultivo.iniciar({
      id: 'c-1',
      usuarioId: 'u-1',
      ambienteId: 'a-1',
      nome: 'Ciclo 1',
      iniciadoEm: AGORA,
    });
    ciclo.avancarFase(FaseDeVida.VEGETATIVO, emDias(AGORA, 10));
    ciclo.avancarFase(FaseDeVida.FLORACAO, emDias(AGORA, 40));

    const est = montarEstatisticasDeCiclo(
      ciclo,
      {
        totalPlantas: 2,
        totalManejos: 5,
        ambiente: { ...ambienteVazio, totalRegistros: 12, temperaturaMedia: 24.5 },
        sanidades: [sanidade('s-1', true)],
        colheitas: [],
        lotes: [],
      },
      emDias(AGORA, 50),
    );

    expect(est.nome).toBe('Ciclo 1');
    expect(est.ativo).toBe(true);
    expect(est.totalPlantas).toBe(2);
    expect(est.duracaoTotalDias).toBe(50);
    // GERMINACAO durou 10 dias, VEGETATIVO 30; FLORACAO (atual) não entra.
    expect(est.duracaoDasFasesEmDias).toEqual([
      { fase: FaseDeVida.GERMINACAO, dias: 10 },
      { fase: FaseDeVida.VEGETATIVO, dias: 30 },
    ]);
    expect(est.ambiente.temperaturaMedia).toBe(24.5);
    expect(est.sanidade.resolvidos).toBe(1);
  });
});

describe('compararCiclos', () => {
  const estatistica = (
    cicloId: string,
    pesoSeco: number,
    gramasPorPlanta: number | null,
    problemas: number,
  ) =>
    montarEstatisticasDeCiclo(
      CicloCultivo.iniciar({
        id: cicloId,
        usuarioId: 'u-1',
        ambienteId: 'a-1',
        nome: cicloId,
        iniciadoEm: AGORA,
      }),
      {
        totalPlantas: 1,
        totalManejos: 0,
        ambiente: ambienteVazio,
        sanidades: Array.from({ length: problemas }, (_, i) => sanidade(`${cicloId}-s${i}`, false)),
        colheitas: [
          Colheita.registrar({
            id: `${cicloId}-col`,
            usuarioId: 'u-1',
            cicloId,
            plantaIds: ['p-1'],
          }),
        ],
        lotes: [
          Lote.gerar({
            id: `${cicloId}-lot`,
            usuarioId: 'u-1',
            curaId: `${cicloId}-cur`,
            codigo: cicloId,
            pesoSecoGramas: pesoSeco,
          }),
        ],
      },
      emDias(AGORA, 10),
    );

  it('aponta os destaques entre os ciclos comparados', () => {
    // gramasPorPlanta = pesoSeco / 1 planta colhida
    const a = estatistica('c-A', 100, 100, 3);
    const b = estatistica('c-B', 150, 150, 1);
    const r = compararCiclos([a, b]);

    expect(r.ciclos).toHaveLength(2);
    expect(r.destaques.maiorRendimentoTotalCicloId).toBe('c-B');
    expect(r.destaques.maiorRendimentoPorPlantaCicloId).toBe('c-B');
    expect(r.destaques.menorIncidenciaDeProblemasCicloId).toBe('c-B');
  });
});
