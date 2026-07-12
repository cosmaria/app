import { AcessoNegadoError } from '@cosmaria/core-domain';
import {
  montarEvolucaoClinica,
  Produto,
  RegistroDeEfeito,
  RegistroDeSintomaDiario,
  RegistroDeUso,
  resumirSessoes,
  resumirSintomas,
  SessaoAntesDepois,
  SessaoDepoisJaRegistradaError,
  SintomaDiarioSemMedicaoError,
  StatusDoTratamento,
  TipoDeEfeito,
  TipoDeProduto,
  Tratamento,
  TratamentoEncerradoError,
  UnidadeDeDose,
  ViaDeAdministracao,
} from '../index';

describe('Med — domínio do núcleo', () => {
  describe('Tratamento', () => {
    const criar = () =>
      Tratamento.criar({ id: 't1', usuarioId: 'u1', condicao: '  Dor crônica  ' });

    it('nasce ativo e com a condição normalizada', () => {
      const t = criar();
      expect(t.status).toBe(StatusDoTratamento.ATIVO);
      expect(t.estaAtivo()).toBe(true);
      expect(t.condicao).toBe('Dor crônica');
      expect(t.encerradoEm).toBeNull();
    });

    it('atualiza campos parciais, preservando os ausentes', () => {
      const t = criar();
      t.atualizar({ objetivo: 'Reduzir dor noturna' });
      expect(t.objetivo).toBe('Reduzir dor noturna');
      expect(t.condicao).toBe('Dor crônica');
      t.atualizar({ objetivo: null });
      expect(t.objetivo).toBeNull();
    });

    it('encerra e vira imutável para escrita', () => {
      const t = criar();
      t.encerrar();
      expect(t.status).toBe(StatusDoTratamento.ENCERRADO);
      expect(t.encerradoEm).not.toBeNull();
      expect(() => t.atualizar({ condicao: 'x' })).toThrow(TratamentoEncerradoError);
    });

    it('encerrar é idempotente', () => {
      const t = criar();
      t.encerrar();
      const quando = t.encerradoEm;
      expect(() => t.encerrar()).not.toThrow();
      expect(t.encerradoEm).toBe(quando);
    });

    it('bloqueia acesso de outro usuário', () => {
      expect(() => criar().garantirAutoria('intruso')).toThrow(AcessoNegadoError);
    });
  });

  describe('Produto', () => {
    it('nasce com loteId nulo (vínculo com o Grow é V2, inerte)', () => {
      const p = Produto.criar({
        id: 'p1',
        usuarioId: 'u1',
        tratamentoId: 't1',
        nome: '  Óleo CBD  ',
        tipo: TipoDeProduto.OLEO,
        concentracaoCbd: '50mg/ml',
      });
      expect(p.nome).toBe('Óleo CBD');
      expect(p.loteId).toBeNull();
      expect(p.concentracaoCbd).toBe('50mg/ml');
      expect(p.concentracaoThc).toBeNull();
    });
  });

  describe('RegistroDeUso', () => {
    it('registra uma dose imutável com horário próprio', () => {
      const usadoEm = new Date('2026-07-01T08:00:00Z');
      const r = RegistroDeUso.registrar({
        id: 'r1',
        usuarioId: 'u1',
        produtoId: 'p1',
        quantidade: 3,
        unidade: UnidadeDeDose.GOTAS,
        via: ViaDeAdministracao.SUBLINGUAL,
        usadoEm,
      });
      expect(r.quantidade).toBe(3);
      expect(r.unidade).toBe(UnidadeDeDose.GOTAS);
      expect(r.via).toBe(ViaDeAdministracao.SUBLINGUAL);
      expect(r.usadoEm).toBe(usadoEm);
    });
  });

  describe('SessaoAntesDepois', () => {
    const abrir = () =>
      SessaoAntesDepois.registrarAntes({
        id: 's1',
        usuarioId: 'u1',
        registroDeUsoId: 'r1',
        sintomaAlvo: 'Dor',
        intensidadeAntes: 8,
        intervaloMinutos: 60,
      });

    it('nasce sem o "depois" e sem variação', () => {
      const s = abrir();
      expect(s.estaFinalizada()).toBe(false);
      expect(s.intensidadeDepois).toBeNull();
      expect(s.variacao()).toBeNull();
    });

    it('registra o "depois" e calcula a variação (antes − depois)', () => {
      const s = abrir();
      s.registrarDepois(3);
      expect(s.estaFinalizada()).toBe(true);
      expect(s.intensidadeDepois).toBe(3);
      expect(s.variacao()).toBe(5);
      expect(s.registradaDepoisEm).not.toBeNull();
    });

    it('recusa registrar o "depois" duas vezes (monotônico)', () => {
      const s = abrir();
      s.registrarDepois(3);
      expect(() => s.registrarDepois(2)).toThrow(SessaoDepoisJaRegistradaError);
    });
  });

  describe('RegistroDeSintomaDiario', () => {
    it('registra com ao menos uma dimensão preenchida', () => {
      const r = RegistroDeSintomaDiario.registrar({ id: 'sd1', usuarioId: 'u1', dor: 4 });
      expect(r.dor).toBe(4);
      expect(r.humor).toBeNull();
    });

    it('recusa um check-in sem nenhuma dimensão', () => {
      expect(() => RegistroDeSintomaDiario.registrar({ id: 'sd1', usuarioId: 'u1' })).toThrow(
        SintomaDiarioSemMedicaoError,
      );
    });
  });

  describe('RegistroDeEfeito', () => {
    it('registra um efeito adverso com a descrição normalizada', () => {
      const e = RegistroDeEfeito.registrar({
        id: 'e1',
        usuarioId: 'u1',
        registroDeUsoId: 'r1',
        tipo: TipoDeEfeito.ADVERSO,
        descricao: '  Boca seca  ',
        intensidade: 3,
      });
      expect(e.tipo).toBe(TipoDeEfeito.ADVERSO);
      expect(e.descricao).toBe('Boca seca');
      expect(e.intensidade).toBe(3);
      expect(e.duracaoMinutos).toBeNull();
    });
  });

  describe('Evolução clínica (agregação)', () => {
    it('resume sessões: efetividade média só das finalizadas', () => {
      const s1 = SessaoAntesDepois.registrarAntes({
        id: 's1',
        usuarioId: 'u1',
        registroDeUsoId: 'r1',
        sintomaAlvo: 'Dor',
        intensidadeAntes: 8,
        intervaloMinutos: 60,
      });
      s1.registrarDepois(2); // variação 6
      const s2 = SessaoAntesDepois.registrarAntes({
        id: 's2',
        usuarioId: 'u1',
        registroDeUsoId: 'r2',
        sintomaAlvo: 'Dor',
        intensidadeAntes: 6,
        intervaloMinutos: 60,
      });
      s2.registrarDepois(2); // variação 4
      const s3 = SessaoAntesDepois.registrarAntes({
        id: 's3',
        usuarioId: 'u1',
        registroDeUsoId: 'r3',
        sintomaAlvo: 'Dor',
        intensidadeAntes: 5,
        intervaloMinutos: 60,
      }); // não finalizada — não entra na média

      const resumo = resumirSessoes([s1, s2, s3]);
      expect(resumo.total).toBe(3);
      expect(resumo.finalizadas).toBe(2);
      expect(resumo.variacaoMedia).toBe(5); // (6+4)/2
    });

    it('resume sintomas ignorando dimensões ausentes (como o AVG)', () => {
      const a = RegistroDeSintomaDiario.registrar({ id: 'a', usuarioId: 'u1', dor: 8 });
      const b = RegistroDeSintomaDiario.registrar({ id: 'b', usuarioId: 'u1', dor: 4, humor: 6 });
      const resumo = resumirSintomas([a, b]);
      expect(resumo.checkins).toBe(2);
      expect(resumo.dorMedia).toBe(6); // (8+4)/2
      expect(resumo.humorMedio).toBe(6); // só b tem humor
      expect(resumo.ansiedadeMedia).toBeNull();
    });

    it('monta a evolução cruzando uso, sessões e efeitos', () => {
      const produto = Produto.criar({
        id: 'p1',
        usuarioId: 'u1',
        tratamentoId: 't1',
        nome: 'Óleo',
        tipo: TipoDeProduto.OLEO,
      });
      const dose = RegistroDeUso.registrar({
        id: 'r1',
        usuarioId: 'u1',
        produtoId: 'p1',
        quantidade: 2,
        unidade: UnidadeDeDose.GOTAS,
        via: ViaDeAdministracao.SUBLINGUAL,
      });
      const efeito = RegistroDeEfeito.registrar({
        id: 'e1',
        usuarioId: 'u1',
        registroDeUsoId: 'r1',
        tipo: TipoDeEfeito.POSITIVO,
        descricao: 'Alívio',
      });
      const ev = montarEvolucaoClinica({
        tratamentoId: 't1',
        condicao: 'Dor',
        status: StatusDoTratamento.ATIVO,
        de: null,
        ate: null,
        doses: [dose],
        produtos: [produto],
        sessoes: [],
        sintomas: [],
        efeitos: [efeito],
      });
      expect(ev.uso.totalDeDoses).toBe(1);
      expect(ev.uso.porProduto[0]).toEqual({ produtoId: 'p1', nome: 'Óleo', doses: 1 });
      expect(ev.efeitos).toEqual({ total: 1, positivos: 1, adversos: 0 });
    });
  });
});
