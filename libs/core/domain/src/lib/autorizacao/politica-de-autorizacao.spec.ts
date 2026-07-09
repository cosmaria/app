import { Papel } from './papel';
import { Permissao } from './permissao';
import { PoliticaDeAutorizacao } from './politica-de-autorizacao';

describe('PoliticaDeAutorizacao (RBAC — doc 04 §11)', () => {
  it('USUARIO comum não recebe nenhuma permissão administrativa', () => {
    expect(PoliticaDeAutorizacao.concede([Papel.USUARIO], Permissao.GERIR_PLATAFORMA)).toBe(false);
    expect(PoliticaDeAutorizacao.concede([Papel.USUARIO], Permissao.MODERAR_COMUNIDADE)).toBe(
      false,
    );
    expect(PoliticaDeAutorizacao.permissoesDe([Papel.USUARIO])).toEqual([]);
  });

  it('ADMIN concede todas as permissões grossas', () => {
    for (const permissao of Object.values(Permissao)) {
      expect(PoliticaDeAutorizacao.concede([Papel.ADMIN], permissao)).toBe(true);
    }
  });

  it('MODERADOR modera a comunidade, mas não gere a plataforma', () => {
    expect(PoliticaDeAutorizacao.concede([Papel.MODERADOR], Permissao.MODERAR_COMUNIDADE)).toBe(
      true,
    );
    expect(PoliticaDeAutorizacao.concede([Papel.MODERADOR], Permissao.GERIR_PLATAFORMA)).toBe(
      false,
    );
  });

  it('SUPORTE lê a trilha de auditoria e presta suporte, mas não gere a plataforma', () => {
    expect(PoliticaDeAutorizacao.concede([Papel.SUPORTE], Permissao.LER_TRILHA_AUDITORIA)).toBe(
      true,
    );
    expect(PoliticaDeAutorizacao.concede([Papel.SUPORTE], Permissao.PRESTAR_SUPORTE)).toBe(true);
    expect(PoliticaDeAutorizacao.concede([Papel.SUPORTE], Permissao.GERIR_PLATAFORMA)).toBe(false);
  });

  it('múltiplos papéis unem as permissões (sem duplicatas)', () => {
    const permissoes = PoliticaDeAutorizacao.permissoesDe([
      Papel.USUARIO,
      Papel.MODERADOR,
      Papel.SUPORTE,
    ]);
    expect(permissoes).toContain(Permissao.MODERAR_COMUNIDADE);
    expect(permissoes).toContain(Permissao.PRESTAR_SUPORTE);
    expect(permissoes).toContain(Permissao.LER_TRILHA_AUDITORIA);
    // sem duplicata mesmo que dois papéis concedam a mesma permissão
    expect(new Set(permissoes).size).toBe(permissoes.length);
  });

  it('DEPENDENTE (Versão 2) existe como papel, sem permissões grossas por enquanto', () => {
    expect(PoliticaDeAutorizacao.permissoesDe([Papel.DEPENDENTE])).toEqual([]);
  });

  it('lista de papéis vazia nunca concede nada', () => {
    expect(PoliticaDeAutorizacao.concede([], Permissao.GERIR_PLATAFORMA)).toBe(false);
  });
});
