/**
 * Status de uma Conta (doc 08 §12.1 — entidade Usuário).
 * Só uma conta ATIVA pode autenticar.
 */
export enum StatusConta {
  ATIVO = 'ATIVO',
  SUSPENSO = 'SUSPENSO',
  EM_EXCLUSAO = 'EM_EXCLUSAO',
}
