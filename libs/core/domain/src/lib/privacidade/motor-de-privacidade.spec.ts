import { ConfiguracaoDeCompartilhamento } from './configuracao-de-compartilhamento.entity';
import { type ContextoDeVisualizacao, VISUALIZADOR_ANONIMO } from './contexto-de-visualizacao';
import { Escopo } from './escopo';
import { MotorDePrivacidade } from './motor-de-privacidade';

const autor: ContextoDeVisualizacao = {
  ehAutor: true,
  ehSeguidor: false,
  ehAmigo: false,
  possuiLink: false,
};
const seguidor: ContextoDeVisualizacao = {
  ehAutor: false,
  ehSeguidor: true,
  ehAmigo: false,
  possuiLink: false,
};
const amigo: ContextoDeVisualizacao = {
  ehAutor: false,
  ehSeguidor: false,
  ehAmigo: true,
  possuiLink: false,
};
const comLink: ContextoDeVisualizacao = {
  ehAutor: false,
  ehSeguidor: false,
  ehAmigo: false,
  possuiLink: true,
};
const anon = VISUALIZADOR_ANONIMO;

describe('MotorDePrivacidade.escopoPermite', () => {
  it('o autor vê todos os escopos', () => {
    for (const escopo of Object.values(Escopo)) {
      expect(MotorDePrivacidade.escopoPermite(escopo, autor)).toBe(true);
    }
  });

  it('PUBLICO é visível até para o anônimo', () => {
    expect(MotorDePrivacidade.escopoPermite(Escopo.PUBLICO, anon)).toBe(true);
  });

  it('PRIVADO só o autor', () => {
    expect(MotorDePrivacidade.escopoPermite(Escopo.PRIVADO, seguidor)).toBe(false);
    expect(MotorDePrivacidade.escopoPermite(Escopo.PRIVADO, anon)).toBe(false);
  });

  it('SEGUIDORES: seguidor e amigo veem; anônimo e só-link não', () => {
    expect(MotorDePrivacidade.escopoPermite(Escopo.SEGUIDORES, seguidor)).toBe(true);
    expect(MotorDePrivacidade.escopoPermite(Escopo.SEGUIDORES, amigo)).toBe(true);
    expect(MotorDePrivacidade.escopoPermite(Escopo.SEGUIDORES, anon)).toBe(false);
    expect(MotorDePrivacidade.escopoPermite(Escopo.SEGUIDORES, comLink)).toBe(false);
  });

  it('AMIGOS: só o amigo (seguidor comum não)', () => {
    expect(MotorDePrivacidade.escopoPermite(Escopo.AMIGOS, amigo)).toBe(true);
    expect(MotorDePrivacidade.escopoPermite(Escopo.AMIGOS, seguidor)).toBe(false);
  });

  it('LINK: só quem tem o link (não implícito por seguir)', () => {
    expect(MotorDePrivacidade.escopoPermite(Escopo.LINK, comLink)).toBe(true);
    expect(MotorDePrivacidade.escopoPermite(Escopo.LINK, seguidor)).toBe(false);
  });
});

describe('MotorDePrivacidade.filtrar / dimensoesVisiveis', () => {
  function configCom(dims: [string, Escopo][]): ConfiguracaoDeCompartilhamento {
    const config = ConfiguracaoDeCompartilhamento.criar({
      id: 'c1',
      autorId: 'a1',
      modulo: 'grow',
      tipoConteudo: 'growlog',
      conteudoId: 'g1',
    });
    for (const [codigo, escopo] of dims) {
      config.definirDimensao(codigo, escopo);
    }
    return config;
  }

  it('remove as dimensões que o visualizador não pode ver', () => {
    const config = configCom([
      ['fotos', Escopo.PUBLICO],
      ['localizacao', Escopo.PRIVADO],
      ['genetica', Escopo.SEGUIDORES],
    ]);
    const dados = { fotos: 'f', localizacao: 'l', genetica: 'g' };

    expect(MotorDePrivacidade.filtrar(config, anon, dados)).toEqual({ fotos: 'f' });
    expect(MotorDePrivacidade.filtrar(config, seguidor, dados)).toEqual({
      fotos: 'f',
      genetica: 'g',
    });
    expect(MotorDePrivacidade.filtrar(config, autor, dados)).toEqual(dados);
  });

  it('dimensão não configurada herda o padrão PRIVADO (fica oculta)', () => {
    const config = configCom([['fotos', Escopo.PUBLICO]]);
    const dados = { fotos: 'f', segredo: 's' };
    expect(MotorDePrivacidade.filtrar(config, anon, dados)).toEqual({ fotos: 'f' });
  });

  it('dimensoesVisiveis lista apenas as visíveis, sem os dados', () => {
    const config = configCom([
      ['fotos', Escopo.PUBLICO],
      ['genetica', Escopo.SEGUIDORES],
    ]);
    expect(
      MotorDePrivacidade.dimensoesVisiveis(config, anon, ['fotos', 'genetica', 'localizacao']),
    ).toEqual(['fotos']);
  });
});
