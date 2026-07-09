/**
 * Permissões de acesso grosso (RBAC) — o que um papel pode fazer na plataforma.
 * Ancoradas no doc 09: os endpoints Administrativos (arquétipo API-6) exigem
 * papel Admin; a moderação de Comunidade é do Moderador; suporte lê a trilha.
 * Novas permissões são adicionadas conforme os módulos que as exigem forem
 * implementados (Billing, LGPD, Comunidade) — sempre concedidas via PoliticaDeAutorizacao.
 */
export enum Permissao {
  /** Gestão de configuração da plataforma (limite de plano, preço, cupom, trial, política de agregação) — doc 09 API-6. */
  GERIR_PLATAFORMA = 'GERIR_PLATAFORMA',
  /** Leitura da trilha de auditoria — doc 09 `GET /v1/admin/trilha-auditoria`. */
  LER_TRILHA_AUDITORIA = 'LER_TRILHA_AUDITORIA',
  /** Moderação de conteúdo da Comunidade — doc 04 §11 (papel Moderador). */
  MODERAR_COMUNIDADE = 'MODERAR_COMUNIDADE',
  /** Operações de suporte ao usuário — doc 04 §11 (papel Suporte). */
  PRESTAR_SUPORTE = 'PRESTAR_SUPORTE',
}

/** Type guard: `valor` é uma Permissão conhecida? (usado ao validar query da API). */
export function ehPermissaoValida(valor: string): valor is Permissao {
  return (Object.values(Permissao) as string[]).includes(valor);
}
