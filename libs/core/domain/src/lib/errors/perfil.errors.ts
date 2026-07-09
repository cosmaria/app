import { DomainError } from './auth.errors';

/** Perfil Público inexistente (ou de outra Conta — nunca revelamos qual dos dois). */
export class PerfilNaoEncontradoError extends DomainError {
  readonly code = 'PERFIL_NAO_ENCONTRADO';
  constructor() {
    super('Perfil público não encontrado.');
  }
}

/**
 * Vínculo entre Perfis Públicos é **Versão 2** (doc 06 §19, decisão consolidada #1):
 * o modelo de dados nasce pronto no MVP, mas a funcionalidade fica desabilitada por
 * feature flag. Lançar primeiro uma comunidade simples, sólida e segura.
 */
export class VinculoDePerfisDesabilitadoError extends DomainError {
  readonly code = 'VINCULO_DE_PERFIS_DESABILITADO';
  constructor() {
    super('O vínculo entre perfis ainda não está disponível.');
  }
}

/** Um vínculo precisa de ao menos dois Perfis Públicos distintos da MESMA Conta. */
export class VinculoDePerfisInvalidoError extends DomainError {
  readonly code = 'VINCULO_DE_PERFIS_INVALIDO';
  constructor(motivo: string) {
    super(`Vínculo entre perfis inválido: ${motivo}`);
  }
}
