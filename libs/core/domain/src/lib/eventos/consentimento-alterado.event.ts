import type { DomainEvent } from './domain-event';
import type { TipoConsentimento } from '../consentimento/tipo-consentimento';

/**
 * `ConsentimentoAlterado` (Catálogo de Domínio). Publicado ao conceder ou revogar
 * consentimento. Consumido por Grow, Med, IA (ajustam o que podem processar) e pela
 * TrilhaDeAuditoria.
 */
export class ConsentimentoAlterado implements DomainEvent {
  readonly nome = 'ConsentimentoAlterado';
  readonly ocorridoEm: Date;

  constructor(
    readonly usuarioId: string,
    readonly tipo: TipoConsentimento,
    /** true = concedido; false = revogado. */
    readonly concedido: boolean,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}
