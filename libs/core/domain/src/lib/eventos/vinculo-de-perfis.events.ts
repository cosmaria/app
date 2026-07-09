import type { DomainEvent } from './domain-event';

/**
 * `VinculoDePerfisAutorizado` (Catálogo de Domínio). Publicado quando o usuário revela
 * publicamente que dois Perfis Públicos seus são a mesma pessoa.
 * Consumido pela **TrilhaDeAuditoria** — é uma mudança de exposição de identidade, o
 * tipo de dado mais sensível a erro silencioso da plataforma (doc 08 §7/§14).
 */
export class VinculoDePerfisAutorizado implements DomainEvent {
  readonly nome = 'VinculoDePerfisAutorizado';
  readonly ocorridoEm: Date;

  constructor(
    readonly vinculoId: string,
    readonly usuarioId: string,
    /** Quantos perfis o vínculo revela — nunca os ids, que não pertencem à trilha. */
    readonly quantidadePerfis: number,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/**
 * `VinculoDePerfisRevogado` — contrapartida da revogação (doc 06 §7.4: reversível).
 * Auditado pelo mesmo motivo do evento de autorização: doc 08 §14 exige trilha para
 * **toda** mudança em entidade crítica, e desfazer um vínculo é uma dessas mudanças.
 */
export class VinculoDePerfisRevogado implements DomainEvent {
  readonly nome = 'VinculoDePerfisRevogado';
  readonly ocorridoEm: Date;

  constructor(
    readonly vinculoId: string,
    readonly usuarioId: string,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}
