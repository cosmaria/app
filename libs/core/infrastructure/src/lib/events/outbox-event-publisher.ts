import type { EventPublisher, IdGenerator, OutboxRepository } from '@cosmaria/core-application';
import type { DomainEvent } from '@cosmaria/core-domain';
import type { InProcessEventPublisher } from './in-process-event-publisher';

/** Campos que descrevem o envelope do evento — não vão duplicados no payload serializado. */
const CAMPOS_DE_ENVELOPE = new Set(['nome', 'ocorridoEm', 'id']);

/**
 * Transporte durável do barramento (doc 04 §9). Implementa `EVENT_PUBLISHER` quando há
 * Postgres: `publicar` NÃO entrega — apenas persiste o evento no outbox e devolve, tirando
 * a entrega do caminho da requisição do writer. O `OutboxDispatcher` faz a entrega assíncrona.
 *
 * Snapshot de assinantes: no momento da publicação, lê do registro (`InProcessEventPublisher`)
 * quem está inscrito naquele nome de evento e grava a lista em `pendentes`. Se ninguém ouve,
 * é no-op (não polui a tabela). O id gerado aqui é o `DomainEvent.id` devolvido ao consumidor
 * na entrega — chave de idempotência contra reentrega.
 */
export class OutboxEventPublisher implements EventPublisher {
  constructor(
    private readonly outbox: OutboxRepository,
    private readonly registro: Pick<InProcessEventPublisher, 'assinantesDe'>,
    private readonly idGen: IdGenerator,
  ) {}

  async publicar(evento: DomainEvent): Promise<void> {
    const pendentes = this.registro.assinantesDe(evento.nome);
    if (pendentes.length === 0) {
      return; // ninguém ouve este evento — nada a persistir
    }
    await this.outbox.enfileirar({
      id: this.idGen.gerar(),
      nome: evento.nome,
      payload: this.serializar(evento),
      ocorridoEm: evento.ocorridoEm,
      pendentes,
      tentativas: 0,
    });
  }

  /** Extrai o payload de contrato do evento (tudo menos o envelope nome/ocorridoEm/id). */
  private serializar(evento: DomainEvent): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    for (const [chave, valor] of Object.entries(evento)) {
      if (!CAMPOS_DE_ENVELOPE.has(chave)) {
        payload[chave] = valor;
      }
    }
    return payload;
  }
}
