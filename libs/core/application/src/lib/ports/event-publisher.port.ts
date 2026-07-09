import type { DomainEvent } from '@cosmaria/core-domain';

/**
 * Porta de publicação de eventos de domínio (doc 04 §9 — EDA seletivo).
 * No monolito modular, a implementação é em processo. Trocar por um barramento
 * distribuído (ex.: fila) no futuro não toca em nenhum caso de uso (doc 13 §16.1).
 */
export interface EventPublisher {
  publicar(evento: DomainEvent): Promise<void>;
}

export const EVENT_PUBLISHER = Symbol('EventPublisher');
