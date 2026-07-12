import { ContextoDeApp, Escopo, VISUALIZADOR_ANONIMO } from '@cosmaria/core-domain';
import { PublicacaoComunidade } from './publicacao-comunidade.entity';

const base = (escopo: Escopo) =>
  PublicacaoComunidade.criar({
    id: 'pub-1',
    perfilPublicoId: 'perfil-autor',
    contexto: ContextoDeApp.GROW,
    referencia: { modulo: 'grow', tipoConteudo: 'ciclo', conteudoId: 'ciclo-1' },
    escopo,
    titulo: 'Meu cultivo',
    dimensoes: { genetica: 'White Widow' },
  });

describe('PublicacaoComunidade.visivelPara', () => {
  it('PUBLICO é visível a qualquer visualizador', () => {
    expect(base(Escopo.PUBLICO).visivelPara(VISUALIZADOR_ANONIMO)).toBe(true);
  });

  it('PRIVADO só é visível ao autor', () => {
    const pub = base(Escopo.PRIVADO);
    expect(pub.visivelPara(VISUALIZADOR_ANONIMO)).toBe(false);
    expect(
      pub.visivelPara({ ehAutor: true, ehSeguidor: false, ehAmigo: false, possuiLink: false }),
    ).toBe(true);
  });

  it('SEGUIDORES é visível a seguidor, não a estranho', () => {
    const pub = base(Escopo.SEGUIDORES);
    expect(pub.visivelPara(VISUALIZADOR_ANONIMO)).toBe(false);
    expect(
      pub.visivelPara({ ehAutor: false, ehSeguidor: true, ehAmigo: false, possuiLink: false }),
    ).toBe(true);
  });
});

describe('PublicacaoComunidade.atualizarConteudo', () => {
  it('reprojeta escopo/título/dimensões mantendo id e referência', () => {
    const pub = base(Escopo.PUBLICO);
    pub.atualizarConteudo({
      escopo: Escopo.PRIVADO,
      titulo: 'Novo título',
      dimensoes: { led: 'Samsung' },
    });
    expect(pub.id).toBe('pub-1');
    expect(pub.referencia.conteudoId).toBe('ciclo-1');
    expect(pub.escopo).toBe(Escopo.PRIVADO);
    expect(pub.titulo).toBe('Novo título');
    expect(pub.dimensoes).toEqual({ led: 'Samsung' });
  });

  it('publicadoPor reconhece o perfil autor', () => {
    const pub = base(Escopo.PUBLICO);
    expect(pub.publicadoPor('perfil-autor')).toBe(true);
    expect(pub.publicadoPor('outro')).toBe(false);
  });
});
