import { DomainError } from '@cosmaria/core-domain';

/**
 * Erros de domínio da IA. Estendem o `DomainError` do Core (shared kernel).
 */

/** Fator desconhecido informado numa consulta de correlação. */
export class FatorDesconhecidoError extends DomainError {
  readonly code = 'FATOR_DESCONHECIDO';
  constructor(fator: string) {
    super(`Fator desconhecido: "${fator}".`);
  }
}

/** Domínio de dado inválido numa consulta. */
export class DominioDeDadoInvalidoError extends DomainError {
  readonly code = 'DOMINIO_DE_DADO_INVALIDO';
  constructor() {
    super('Domínio de dado inválido (use GROW ou MED).');
  }
}
