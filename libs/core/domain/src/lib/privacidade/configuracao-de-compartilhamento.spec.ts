import { AcessoNegadoError } from '../errors/auth.errors';
import { ConfiguracaoDeCompartilhamento } from './configuracao-de-compartilhamento.entity';
import { Escopo } from './escopo';

const base = {
  id: 'c1',
  autorId: 'a1',
  modulo: 'grow',
  tipoConteudo: 'growlog',
  conteudoId: 'g1',
};

describe('ConfiguracaoDeCompartilhamento', () => {
  it('nasce privada — escopo padrão PRIVADO e nenhuma dimensão visível (doc 02 §9.1)', () => {
    const config = ConfiguracaoDeCompartilhamento.criar(base);
    expect(config.escopoPadrao).toBe(Escopo.PRIVADO);
    expect(config.dimensoesConfiguradas().size).toBe(0);
    expect(config.escopoDaDimensao('qualquer_dimensao')).toBe(Escopo.PRIVADO);
  });

  it('definirDimensao sobrepõe o padrão apenas para aquela dimensão', () => {
    const config = ConfiguracaoDeCompartilhamento.criar(base);
    config.definirDimensao('fotos', Escopo.PUBLICO);
    expect(config.escopoDaDimensao('fotos')).toBe(Escopo.PUBLICO);
    expect(config.escopoDaDimensao('genetica')).toBe(Escopo.PRIVADO);
  });

  it('definirEscopoPadrao muda o padrão das dimensões não configuradas', () => {
    const config = ConfiguracaoDeCompartilhamento.criar(base);
    config.definirEscopoPadrao(Escopo.SEGUIDORES);
    expect(config.escopoDaDimensao('qualquer')).toBe(Escopo.SEGUIDORES);
  });

  it('garantirAutoria bloqueia quem não é o autor (AcessoNegadoError)', () => {
    const config = ConfiguracaoDeCompartilhamento.criar(base);
    expect(() => config.garantirAutoria('outro-usuario')).toThrow(AcessoNegadoError);
    expect(() => config.garantirAutoria('a1')).not.toThrow();
    expect(config.pertenceA('a1')).toBe(true);
  });
});
