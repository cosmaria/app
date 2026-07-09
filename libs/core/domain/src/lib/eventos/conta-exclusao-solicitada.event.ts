import type { DomainEvent } from './domain-event';

/**
 * `ContaExclusaoSolicitada` (Catálogo de Domínio, doc 04 §21.2 — direito ao
 * esquecimento). Publicado pelo Core; cada módulo (Grow, Med, Comunidade, IA)
 * reage expurgando/anonimizando os próprios dados — o Core não conhece o schema
 * de ninguém.
 */
export class ContaExclusaoSolicitada implements DomainEvent {
  readonly nome = 'ContaExclusaoSolicitada';
  readonly ocorridoEm: Date;

  constructor(
    readonly usuarioId: string,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}
