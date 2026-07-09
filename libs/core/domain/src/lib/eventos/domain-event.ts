/**
 * Contrato base de um evento de domínio (doc 04 §9 — EDA seletivo no monolito
 * modular). Eventos são publicados pela camada de aplicação através da porta
 * EventPublisher e consumidos em processo. O `nome` casa com o Catálogo de Domínio.
 */
export interface DomainEvent {
  readonly nome: string;
  readonly ocorridoEm: Date;
}
