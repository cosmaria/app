/**
 * Outbox de entrega durável de eventos (doc 04 §9 — transporte substituível do barramento).
 *
 * Uma linha por evento publicado; `pendentes` carrega os `assinanteId` ainda não entregues.
 * O despachante lê o que está devido, entrega por assinante, e atualiza a linha: `marcarEntregue`
 * quando `pendentes` esvazia, `reprogramar` (com backoff) enquanto houver falhas dentro do
 * limite, `marcarMorto` (dead-letter) ao estourar o limite. Nenhum dado clínico transita fora
 * do payload que o próprio publicador já serializou (fronteira de contrato).
 */
export interface OutboxRegistro {
  readonly id: string;
  readonly nome: string;
  /** Evento serializado (payload de contrato) — o despachante reconstrói o DomainEvent daqui. */
  readonly payload: Record<string, unknown>;
  readonly ocorridoEm: Date;
  readonly pendentes: string[];
  readonly tentativas: number;
}

export interface OutboxRepository {
  /** Enfileira um novo evento para entrega (status PENDENTE, devido imediatamente). */
  enfileirar(registro: OutboxRegistro): Promise<void>;

  /**
   * Lê até `limite` linhas PENDENTES já devidas (`proxima_em <= agora`), travando-as para
   * este consumidor (`FOR UPDATE SKIP LOCKED`) — seguro para múltiplas instâncias.
   */
  buscarDevidos(limite: number, agora: Date): Promise<OutboxRegistro[]>;

  /** Todos os assinantes foram entregues: marca ENTREGUE. */
  marcarEntregue(id: string): Promise<void>;

  /** Ainda há falhas dentro do limite: guarda os pendentes restantes e reprograma o retry. */
  reprogramar(
    id: string,
    pendentes: string[],
    tentativas: number,
    proximaEm: Date,
    erro: string,
  ): Promise<void>;

  /** Estourou o limite de tentativas: dead-letter (MORTO), preservado para inspeção. */
  marcarMorto(id: string, pendentes: string[], erro: string): Promise<void>;
}

export const OUTBOX_REPOSITORY = Symbol('OutboxRepository');
