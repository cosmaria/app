/**
 * Erros de domínio da autenticação.
 * São puros (sem dependência de framework) e carregam um `code` estável,
 * que a camada de apresentação (doc 09 §5 — formato de erro único) traduz
 * para o contrato HTTP sem vazar detalhe interno.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  protected constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Credenciais inválidas — NUNCA revela se foi o e-mail ou a senha (segurança, doc 09 §8). */
export class CredenciaisInvalidasError extends DomainError {
  readonly code = 'CREDENCIAIS_INVALIDAS';
  constructor() {
    super('E-mail ou senha inválidos.');
  }
}

/** Conta não está ATIVA (suspensa ou em exclusão). */
export class ContaInativaError extends DomainError {
  readonly code = 'CONTA_INATIVA';
  constructor() {
    super('Esta conta não está ativa.');
  }
}

/** Sessão/refresh token inválido, expirado ou revogado. */
export class SessaoInvalidaError extends DomainError {
  readonly code = 'SESSAO_INVALIDA';
  constructor() {
    super('Sessão inválida ou expirada. Faça login novamente.');
  }
}

/** Tentativa de registrar um e-mail que já existe. */
export class EmailJaCadastradoError extends DomainError {
  readonly code = 'EMAIL_JA_CADASTRADO';
  constructor() {
    super('Já existe uma conta com este e-mail.');
  }
}

/** Valor de e-mail com formato inválido. */
export class EmailInvalidoError extends DomainError {
  readonly code = 'EMAIL_INVALIDO';
  constructor(valor: string) {
    super(`E-mail inválido: "${valor}".`);
  }
}

/** Usuário autenticado, mas sem o papel/permissão necessário (RBAC, doc 04 §11). */
export class AcessoNegadoError extends DomainError {
  readonly code = 'ACESSO_NEGADO';
  constructor() {
    super('Você não tem permissão para executar esta ação.');
  }
}
