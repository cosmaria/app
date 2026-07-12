/**
 * Contrato base de um evento de domínio (doc 04 §9 — EDA seletivo no monolito
 * modular). Eventos são publicados pela camada de aplicação através da porta
 * EventPublisher e consumidos em processo. O `nome` casa com o Catálogo de Domínio.
 */
export interface DomainEvent {
  readonly nome: string;
  readonly ocorridoEm: Date;

  /**
   * Id estável do evento, atribuído pelo transporte durável (outbox) no momento da
   * publicação e devolvido ao consumidor na (re)entrega. Ausente no caminho síncrono
   * em processo (entrega exatamente-uma-vez inline). Consumidores idempotentes usam-no
   * como chave de deduplicação contra reentrega (doc 04 §659).
   */
  readonly id?: string;
}
