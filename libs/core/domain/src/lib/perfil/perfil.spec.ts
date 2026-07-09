import { AcessoNegadoError } from '../errors/auth.errors';
import { VinculoDePerfisInvalidoError } from '../errors/perfil.errors';
import { ContextoDeApp, ehContextoDeAppValido } from './contexto-de-app';
import { PerfilPublico } from './perfil-publico.entity';
import { PoliticaDeNomeDePerfil } from './politica-de-nome-de-perfil';
import { RegistroDeVinculoDePerfis } from './registro-de-vinculo-de-perfis.entity';

describe('ContextoDeApp', () => {
  it('valida contextos conhecidos e rejeita desconhecidos', () => {
    expect(ehContextoDeAppValido('GROW')).toBe(true);
    expect(ehContextoDeAppValido('MED')).toBe(true);
    expect(ehContextoDeAppValido('RECREATIVO')).toBe(false);
  });
});

describe('PoliticaDeNomeDePerfil (doc 06 §13)', () => {
  it('sugere um identificador neutro derivado só do id opaco do perfil', () => {
    expect(PoliticaDeNomeDePerfil.sugerir('7f3a2b1c-0000-0000-0000-00000012ab34')).toBe(
      'perfil-12ab34',
    );
  });

  it('nunca deriva do e-mail nem de qualquer dado real do usuário', () => {
    const sugestao = PoliticaDeNomeDePerfil.sugerir('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');
    expect(sugestao).not.toContain('@');
    expect(sugestao).toBe('perfil-eeeeee');
  });

  it('produz sugestões sem relação entre dois perfis da mesma Conta (sem canal lateral)', () => {
    expect(PoliticaDeNomeDePerfil.sugerir('perfil-grow-111111')).not.toBe(
      PoliticaDeNomeDePerfil.sugerir('perfil-med-222222'),
    );
  });
});

describe('PerfilPublico (doc 06 §4)', () => {
  const criar = (contexto: ContextoDeApp, nomeExibicao?: string | null): PerfilPublico =>
    PerfilPublico.criar({ id: 'p-1', usuarioId: 'u-1', contexto, nomeExibicao });

  it('nasce anônimo quando nenhum nome é informado — anonimato é o estado padrão', () => {
    const perfil = criar(ContextoDeApp.MED);
    expect(perfil.ehAnonimo()).toBe(true);
    expect(perfil.nomeExibicao).toBeNull();
    expect(perfil.avatarUrl).toBeNull();
    expect(perfil.biografia).toBeNull();
  });

  it('um perfil do Med sem nenhum dado preenchido permanece funcional (doc 06, caso de teste)', () => {
    const perfil = criar(ContextoDeApp.MED);
    expect(perfil.contexto).toBe(ContextoDeApp.MED);
    expect(perfil.nomeSugerido()).toBe('perfil-p1');
  });

  it('deixa de ser anônimo ao preencher qualquer campo de identidade', () => {
    const perfil = criar(ContextoDeApp.GROW);
    perfil.atualizar({ nomeExibicao: 'Cultivador Alpha' });
    expect(perfil.ehAnonimo()).toBe(false);
    expect(perfil.nomeExibicao).toBe('Cultivador Alpha');
  });

  it('volta a ser anônimo ao limpar os campos com null, sem excluir o perfil', () => {
    const perfil = criar(ContextoDeApp.GROW, 'Cultivador Alpha');
    perfil.atualizar({ nomeExibicao: null });
    expect(perfil.ehAnonimo()).toBe(true);
  });

  it('undefined não mexe no campo; null limpa o campo', () => {
    const perfil = criar(ContextoDeApp.GROW, 'Alpha');
    perfil.atualizar({ biografia: 'Cultivo indoor' });
    perfil.atualizar({ avatarUrl: null });
    expect(perfil.nomeExibicao).toBe('Alpha');
    expect(perfil.biografia).toBe('Cultivo indoor');
  });

  it('atualiza o carimbo de tempo a cada alteração', () => {
    const perfil = criar(ContextoDeApp.GROW);
    const depois = new Date(perfil.criadoEm.getTime() + 1000);
    perfil.atualizar({ biografia: 'oi' }, depois);
    expect(perfil.atualizadoEm).toEqual(depois);
  });

  it('só o dono da Conta edita o próprio perfil', () => {
    const perfil = criar(ContextoDeApp.GROW);
    expect(() => perfil.garantirAutoria('u-1')).not.toThrow();
    expect(() => perfil.garantirAutoria('outro')).toThrow(AcessoNegadoError);
  });
});

describe('RegistroDeVinculoDePerfis (doc 06 §7.4 — Versão 2)', () => {
  const autorizar = (visivelEm: ContextoDeApp[] = [ContextoDeApp.GROW, ContextoDeApp.MED]) =>
    RegistroDeVinculoDePerfis.autorizar({
      id: 'v-1',
      usuarioId: 'u-1',
      perfilIds: ['p-grow', 'p-med'],
      visivelEm,
    });

  it('exige ao menos dois perfis distintos', () => {
    expect(() =>
      RegistroDeVinculoDePerfis.autorizar({
        id: 'v-1',
        usuarioId: 'u-1',
        perfilIds: ['p-grow', 'p-grow'],
        visivelEm: [ContextoDeApp.GROW],
      }),
    ).toThrow(VinculoDePerfisInvalidoError);
  });

  it('exige ao menos um contexto de exibição', () => {
    expect(() =>
      RegistroDeVinculoDePerfis.autorizar({
        id: 'v-1',
        usuarioId: 'u-1',
        perfilIds: ['p-grow', 'p-med'],
        visivelEm: [],
      }),
    ).toThrow(VinculoDePerfisInvalidoError);
  });

  it('permite revelação parcial: visível no Med, invisível no Grow (doc 06 §18)', () => {
    const vinculo = autorizar([ContextoDeApp.MED]);
    expect(vinculo.ehVisivelEm(ContextoDeApp.MED)).toBe(true);
    expect(vinculo.ehVisivelEm(ContextoDeApp.GROW)).toBe(false);
  });

  it('deixa de ser visível em qualquer contexto assim que revogado', () => {
    const vinculo = autorizar();
    vinculo.revogar();
    expect(vinculo.estaVigente()).toBe(false);
    expect(vinculo.ehVisivelEm(ContextoDeApp.GROW)).toBe(false);
    expect(vinculo.ehVisivelEm(ContextoDeApp.MED)).toBe(false);
  });

  it('revogar é idempotente — a data original não é sobrescrita', () => {
    const vinculo = autorizar();
    const primeira = new Date('2026-01-01T00:00:00Z');
    vinculo.revogar(primeira);
    vinculo.revogar(new Date('2026-02-01T00:00:00Z'));
    expect(vinculo.revogadoEm).toEqual(primeira);
  });

  it('só o dono da Conta revoga o próprio vínculo', () => {
    const vinculo = autorizar();
    expect(() => vinculo.garantirAutoria('outro')).toThrow(AcessoNegadoError);
  });

  it('sabe quais perfis participa', () => {
    const vinculo = autorizar();
    expect(vinculo.contemPerfil('p-med')).toBe(true);
    expect(vinculo.contemPerfil('p-desconhecido')).toBe(false);
  });
});
