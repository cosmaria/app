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

/**
 * Correlação cruzada Grow×Med pedida sem opt-in. A integração Grow↔Med é sempre opt-in
 * (doc 00): o usuário só habilita a análise cruzada ao vincular um produto do Med a um Lote
 * do Grow. Mapeado para 403 — o recurso existe, mas exige consentimento explícito.
 */
export class CorrelacaoCruzadaNaoHabilitadaError extends DomainError {
  readonly code = 'CORRELACAO_CRUZADA_NAO_HABILITADA';
  constructor() {
    super('Vincule um produto a um lote do seu cultivo para habilitar a análise Grow×Med.');
  }
}
