import { AcessoNegadoError } from '@cosmaria/core-domain';
import {
  FaseDeVida,
  OrigemDoMaterial,
  TipoDeAmbiente,
  TipoDeGenetica,
  ehFaseDeVidaValida,
  transicaoDeFasePermitida,
} from './catalogos';
import { Ambiente } from './ambiente.entity';
import { CicloCultivo } from './ciclo-cultivo.entity';
import { Genetica } from './genetica.entity';
import { Planta } from './planta.entity';
import { CicloEncerradoError, TransicaoDeFaseInvalidaError } from './errors/grow.errors';

const AGORA = new Date('2026-07-09T12:00:00Z');
const emDias = (dias: number): Date => new Date(AGORA.getTime() + dias * 86_400_000);

describe('Catálogos internos (doc 08 §8 — código estável, nunca texto)', () => {
  it('valida a fase pelo código', () => {
    expect(ehFaseDeVidaValida('FLORACAO')).toBe(true);
    expect(ehFaseDeVidaValida('Floração')).toBe(false);
  });

  describe('transição de fase', () => {
    it('avançar é permitido', () => {
      expect(transicaoDeFasePermitida(FaseDeVida.GERMINACAO, FaseDeVida.VEGETATIVO)).toBe(true);
    });

    it('pular fases é permitido — a autoflorescente não passa pela pré-floração', () => {
      expect(transicaoDeFasePermitida(FaseDeVida.VEGETATIVO, FaseDeVida.FLORACAO)).toBe(true);
    });

    it('retroceder é proibido — corromperia as durações já calculadas', () => {
      expect(transicaoDeFasePermitida(FaseDeVida.FLORACAO, FaseDeVida.VEGETATIVO)).toBe(false);
    });

    it('permanecer na mesma fase não é uma transição', () => {
      expect(transicaoDeFasePermitida(FaseDeVida.FLORACAO, FaseDeVida.FLORACAO)).toBe(false);
    });
  });
});

describe('Genetica (doc 02 §5.1)', () => {
  const criar = () =>
    Genetica.criar({
      id: 'g-1',
      usuarioId: 'u-1',
      nome: '  OG Kush  ',
      tipo: TipoDeGenetica.FOTOPERIODICA,
      criadoEm: AGORA,
    });

  it('normaliza o nome e nasce sem linhagem', () => {
    const g = criar();
    expect(g.nome).toBe('OG Kush');
    expect(g.linhagem).toBeNull();
    expect(g.breeder).toBeNull();
  });

  it('undefined não mexe no campo; null limpa', () => {
    const g = criar();
    g.atualizar({ linhagem: 'Chemdawg x Hindu Kush' });
    g.atualizar({ breeder: null });
    expect(g.linhagem).toBe('Chemdawg x Hindu Kush');
    expect(g.nome).toBe('OG Kush');
  });

  it('só o dono edita', () => {
    const g = criar();
    expect(() => g.garantirAutoria('u-1')).not.toThrow();
    expect(() => g.garantirAutoria('outro')).toThrow(AcessoNegadoError);
  });
});

describe('Ambiente (doc 02 §5.3)', () => {
  const criar = (tipo: TipoDeAmbiente) =>
    Ambiente.criar({ id: 'a-1', usuarioId: 'u-1', nome: 'Estufa 1', tipo, criadoEm: AGORA });

  it('os três tipos são suportados desde a v1', () => {
    expect(criar(TipoDeAmbiente.INDOOR).tipo).toBe(TipoDeAmbiente.INDOOR);
    expect(criar(TipoDeAmbiente.OUTDOOR).tipo).toBe(TipoDeAmbiente.OUTDOOR);
    expect(criar(TipoDeAmbiente.ESTUFA).tipo).toBe(TipoDeAmbiente.ESTUFA);
  });

  it('só o outdoor aceita enriquecimento do Módulo Outdoor (desacoplado)', () => {
    expect(criar(TipoDeAmbiente.OUTDOOR).aceitaDadosClimaticos()).toBe(true);
    expect(criar(TipoDeAmbiente.INDOOR).aceitaDadosClimaticos()).toBe(false);
  });

  it('dimensões e capacidade são opcionais — o ambiente funciona sem elas', () => {
    const a = criar(TipoDeAmbiente.INDOOR);
    expect(a.larguraCm).toBeNull();
    expect(a.capacidadePlantas).toBeNull();
  });
});

describe('CicloCultivo (entidade central — doc 08 §12.2)', () => {
  const iniciar = () =>
    CicloCultivo.iniciar({
      id: 'c-1',
      usuarioId: 'u-1',
      ambienteId: 'a-1',
      nome: 'Ciclo de inverno',
      iniciadoEm: AGORA,
    });

  it('nasce ativo, na germinação, com a fase inicial já no histórico', () => {
    const c = iniciar();
    expect(c.estaAtivo()).toBe(true);
    expect(c.faseAtual).toBe(FaseDeVida.GERMINACAO);
    expect(c.transicoes()).toEqual([{ fase: FaseDeVida.GERMINACAO, ocorridaEm: AGORA }]);
  });

  it('cada transição é datada — é daí que saem as durações de fase', () => {
    const c = iniciar();
    c.avancarFase(FaseDeVida.VEGETATIVO, emDias(7));
    c.avancarFase(FaseDeVida.FLORACAO, emDias(35));

    expect(c.duracaoDasFasesEmDias()).toEqual([
      { fase: FaseDeVida.GERMINACAO, dias: 7 },
      { fase: FaseDeVida.VEGETATIVO, dias: 28 },
    ]);
  });

  it('a fase atual não entra nas durações — ela ainda corre', () => {
    const c = iniciar();
    expect(c.duracaoDasFasesEmDias()).toEqual([]);
  });

  it('recusa retroceder de fase', () => {
    const c = iniciar();
    c.avancarFase(FaseDeVida.FLORACAO, emDias(30));
    expect(() => c.avancarFase(FaseDeVida.VEGETATIVO, emDias(31))).toThrow(
      TransicaoDeFaseInvalidaError,
    );
    expect(c.faseAtual).toBe(FaseDeVida.FLORACAO);
  });

  it('um ciclo encerrado é imutável', () => {
    const c = iniciar();
    c.encerrar(emDias(90));

    expect(c.estaAtivo()).toBe(false);
    expect(() => c.avancarFase(FaseDeVida.CURA, emDias(91))).toThrow(CicloEncerradoError);
    expect(() => c.renomear('outro nome', emDias(91))).toThrow(CicloEncerradoError);
    expect(() => c.encerrar(emDias(92))).toThrow(CicloEncerradoError);
  });

  it('só o dono opera o ciclo', () => {
    expect(() => iniciar().garantirAutoria('outro')).toThrow(AcessoNegadoError);
  });
});

describe('Planta (unidade central de registro — doc 02 §5.2)', () => {
  const criar = (over: Partial<Parameters<typeof Planta.criar>[0]> = {}) =>
    Planta.criar({
      id: 'p-1',
      usuarioId: 'u-1',
      cicloId: 'c-1',
      geneticaId: 'g-1',
      nome: 'Planta 1',
      origem: OrigemDoMaterial.SEMENTE,
      criadoEm: AGORA,
      ...over,
    });

  it('nasce na germinação, sem data de germinação registrada', () => {
    const p = criar();
    expect(p.faseAtual).toBe(FaseDeVida.GERMINACAO);
    expect(p.germinadaEm).toBeNull();
    expect(p.plantaMaeId).toBeNull();
  });

  it('um clone rastreia a planta-mãe de onde veio', () => {
    const p = criar({ origem: OrigemDoMaterial.CLONE, plantaMaeId: 'mae-1' });
    expect(p.origem).toBe(OrigemDoMaterial.CLONE);
    expect(p.plantaMaeId).toBe('mae-1');
  });

  it('tem fase própria: plantas do mesmo ciclo amadurecem em ritmos diferentes', () => {
    const cedo = criar({ id: 'p-1' });
    const tarde = criar({ id: 'p-2' });

    cedo.avancarFase(FaseDeVida.COLHEITA, emDias(80));

    // É isto que sustenta a colheita escalonada (0—N colheitas por ciclo, doc 04 §25).
    expect(cedo.faseAtual).toBe(FaseDeVida.COLHEITA);
    expect(tarde.faseAtual).toBe(FaseDeVida.GERMINACAO);
  });

  it('recusa retroceder de fase', () => {
    const p = criar();
    p.avancarFase(FaseDeVida.FLORACAO, emDias(30));
    expect(() => p.avancarFase(FaseDeVida.GERMINACAO, emDias(31))).toThrow(
      TransicaoDeFaseInvalidaError,
    );
  });
});
