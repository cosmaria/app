import {
  avaliarAlerta,
  calcularCorrelacao,
  DirecaoDaCorrelacao,
  DominioDeDado,
  ehRelevante,
  explicar,
  Fator,
  montarDigest,
  montarInsight,
  NivelDeConfianca,
  pearson,
  PoliticaDeAgregacao,
  PontoDeSerie,
  recomendar,
  REGRAS_PADRAO,
  SeveridadeDeAlerta,
} from '../index';

const ponto = (fator: Fator, valor: number, dia: string, origemId = 'o'): PontoDeSerie =>
  PontoDeSerie.registrar({
    id: `${fator}-${dia}`,
    usuarioId: 'u1',
    dominio: DominioDeDado.MED,
    fator,
    valor,
    ocorridoEm: new Date(`2026-07-${dia}T12:00:00Z`),
    origemId,
  });

describe('IA — domínio', () => {
  describe('pearson', () => {
    it('correlação positiva perfeita = 1', () => {
      expect(
        pearson([
          [1, 2],
          [2, 4],
          [3, 6],
        ]),
      ).toBeCloseTo(1);
    });
    it('correlação negativa perfeita = -1', () => {
      expect(
        pearson([
          [1, 6],
          [2, 4],
          [3, 2],
        ]),
      ).toBeCloseTo(-1);
    });
    it('série constante não gera correlação (evita divisão por zero)', () => {
      expect(
        pearson([
          [1, 5],
          [2, 5],
          [3, 5],
        ]),
      ).toBe(0);
    });
  });

  describe('PoliticaDeAgregacao', () => {
    it('usa os padrões do doc 05 (Grow=30, Med=50)', () => {
      const p = PoliticaDeAgregacao.padrao();
      expect(p.nMinimoCoorte(DominioDeDado.GROW)).toBe(30);
      expect(p.nMinimoCoorte(DominioDeDado.MED)).toBe(50);
    });
  });

  describe('calcularCorrelacao', () => {
    it('não conclui abaixo do volume mínimo', () => {
      const r = calcularCorrelacao(
        Fator.DOSE,
        [ponto(Fator.DOSE, 1, '01')],
        Fator.DOR,
        [ponto(Fator.DOR, 8, '01')],
        3,
      );
      expect(r.suficiente).toBe(false);
      expect(r.correlacao).toBeNull();
      expect(r.limitacao).toContain('1 de 3');
    });

    it('correlaciona dois fatores alinhando por dia', () => {
      const doses = ['01', '02', '03', '04'].map((d, i) => ponto(Fator.DOSE, i + 1, d));
      // Dor cai conforme a dose sobe — correlação negativa.
      const dores = ['01', '02', '03', '04'].map((d, i) => ponto(Fator.DOR, 8 - i, d));
      const r = calcularCorrelacao(Fator.DOSE, doses, Fator.DOR, dores, 3);
      expect(r.suficiente).toBe(true);
      expect(r.correlacao?.direcao).toBe(DirecaoDaCorrelacao.NEGATIVA);
      expect(r.correlacao?.forca).toBeCloseTo(-1);
      expect(r.correlacao?.tamanhoAmostra).toBe(4);
      expect(r.correlacao?.confianca).toBe(NivelDeConfianca.BAIXA);
      // Rastreabilidade: carrega os ids brutos de origem (doc 05 §7.2).
      expect(r.correlacao?.origemIds.length).toBeGreaterThan(0);
    });

    it('só pareia dias presentes nas duas séries', () => {
      const doses = ['01', '02', '03'].map((d, i) => ponto(Fator.DOSE, i + 1, d));
      const dores = ['02', '03', '04'].map((d, i) => ponto(Fator.DOR, i + 1, d));
      const r = calcularCorrelacao(Fator.DOSE, doses, Fator.DOR, dores, 2);
      expect(r.correlacao?.tamanhoAmostra).toBe(2); // só dias 02 e 03
    });
  });

  describe('Insights + Explicabilidade', () => {
    const correlacao = (forca: number, direcao: DirecaoDaCorrelacao) => ({
      fatorA: Fator.DOSE,
      fatorB: Fator.DOR,
      forca,
      direcao,
      confianca: NivelDeConfianca.BAIXA,
      tamanhoAmostra: 8,
      periodoInicio: new Date('2026-06-01T00:00:00Z'),
      periodoFim: new Date('2026-06-08T00:00:00Z'),
      origemIds: ['a', 'b'],
    });

    it('ehRelevante: descarta correlações fracas ou neutras', () => {
      expect(ehRelevante(correlacao(-0.9, DirecaoDaCorrelacao.NEGATIVA))).toBe(true);
      expect(ehRelevante(correlacao(0.1, DirecaoDaCorrelacao.POSITIVA))).toBe(false);
      expect(ehRelevante(correlacao(0.05, DirecaoDaCorrelacao.NEUTRA))).toBe(false);
    });

    it('explicar: usa o template obrigatório, sem certeza absoluta', () => {
      const frase = explicar(correlacao(-0.85, DirecaoDaCorrelacao.NEGATIVA));
      expect(frase).toContain('Com base em 8 dias');
      expect(frase).toContain('aproximadamente 85%');
      expect(frase).toContain('correlação negativa');
      expect(frase).toContain('confiança baixo');
      expect(frase).toContain('Limitação');
      // Nunca linguagem de certeza (princípio permanente §4.6).
      expect(frase).not.toMatch(/a IA acredita|com certeza|garantid/i);
    });

    it('montarInsight: sempre carrega a frase da explicabilidade e a rastreabilidade', () => {
      const i = montarInsight(DominioDeDado.MED, correlacao(-0.7, DirecaoDaCorrelacao.NEGATIVA));
      expect(i.texto.length).toBeGreaterThan(0);
      expect(i.origemIds).toEqual(['a', 'b']);
      expect(i.fatorA).toBe(Fator.DOSE);
    });
  });

  describe('Alertas', () => {
    const regraVpd = REGRAS_PADRAO.find((r) => r.fator === Fator.VPD)!;
    const pontoVpd = (valor: number): PontoDeSerie =>
      PontoDeSerie.registrar({
        id: 'p',
        usuarioId: 'u1',
        dominio: DominioDeDado.GROW,
        fator: Fator.VPD,
        valor,
        ocorridoEm: new Date('2026-06-10T12:00:00Z'),
        origemId: 'reg-1',
      });

    it('dispara quando o último valor está acima da faixa', () => {
      const a = avaliarAlerta(regraVpd, pontoVpd(2.0));
      expect(a).not.toBeNull();
      expect(a?.severidade).toBe(SeveridadeDeAlerta.ATENCAO);
      expect(a?.mensagem).toContain('acima');
      expect(a?.origemId).toBe('reg-1');
    });

    it('não dispara dentro da faixa saudável', () => {
      expect(avaliarAlerta(regraVpd, pontoVpd(1.0))).toBeNull();
    });

    it('não dispara sem ponto (nada registrado ainda)', () => {
      expect(avaliarAlerta(regraVpd, null)).toBeNull();
    });

    it('o alerta de dor do Med é neutro e remete ao médico (disclaimer)', () => {
      const regraDor = REGRAS_PADRAO.find((r) => r.fator === Fator.DOR)!;
      expect(regraDor.sugestaoDeAcao.toLowerCase()).toContain('médico');
    });
  });

  describe('Recomendações e Digest', () => {
    const insight = (dominio: DominioDeDado) =>
      montarInsight(dominio, {
        fatorA: Fator.DOSE,
        fatorB: Fator.DOR,
        forca: -0.8,
        direcao: DirecaoDaCorrelacao.NEGATIVA,
        confianca: NivelDeConfianca.MEDIA,
        tamanhoAmostra: 20,
        periodoInicio: new Date('2026-06-01T00:00:00Z'),
        periodoFim: new Date('2026-06-20T00:00:00Z'),
        origemIds: ['a'],
      });

    it('recomendação do Med é neutra e remete ao médico', () => {
      const r = recomendar(insight(DominioDeDado.MED));
      expect(r.texto.toLowerCase()).toContain('médico');
    });

    it('recomendação do Grow é acionável (manejo), não clínica', () => {
      const r = recomendar(insight(DominioDeDado.GROW));
      expect(r.texto.toLowerCase()).toContain('manejo');
      expect(r.texto.toLowerCase()).not.toContain('médico');
    });

    it('digest em cold-start sinaliza poucos dados e sempre traz o disclaimer', () => {
      const d = montarDigest({
        dominio: DominioDeDado.MED,
        coldStart: true,
        insights: [],
        alertas: [],
        recomendacoes: [],
      });
      expect(d.coldStart).toBe(true);
      expect(d.mensagemColdStart).toContain('poucos registros');
      expect(d.disclaimer.toLowerCase()).toContain('não constituem');
    });
  });
});
