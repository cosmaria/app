/**
 * Papéis de acesso (RBAC grosso) — doc 04 §11.
 * Definem o que um usuário pode fazer "em geral". Decisões finas de visibilidade
 * de conteúdo (dimensão × escopo) são responsabilidade do Motor de Privacidade
 * (doc 04 §12), NÃO destes papéis.
 *
 * DEPENDENTE já é modelado aqui (doc 03/04 §11) para a Versão 2 (Cuidador/Dependente),
 * mesmo que a funcionalidade esteja desligada — a arquitetura nasce preparada.
 */
export enum Papel {
  USUARIO = 'USUARIO',
  DEPENDENTE = 'DEPENDENTE',
  MODERADOR = 'MODERADOR',
  ADMIN = 'ADMIN',
  SUPORTE = 'SUPORTE',
}

/** Type guard: `valor` é um Papel conhecido? (usado ao ler papéis de fontes externas, ex.: token). */
export function ehPapelValido(valor: string): valor is Papel {
  return (Object.values(Papel) as string[]).includes(valor);
}
