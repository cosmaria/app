import type { DomainEvent } from './domain-event';

/**
 * `ExportacaoDadosSolicitada` (Catálogo de Domínio, doc 04 §21.3 — portabilidade
 * LGPD Art. 18). Cada módulo contribui sua fatia dos dados do usuário para o pacote
 * compilado pelo Core.
 */
export class ExportacaoDadosSolicitada implements DomainEvent {
  readonly nome = 'ExportacaoDadosSolicitada';
  readonly ocorridoEm: Date;

  constructor(
    readonly usuarioId: string,
    readonly solicitacaoId: string,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}
