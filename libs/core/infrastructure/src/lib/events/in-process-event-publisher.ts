import type { EventPublisher } from '@cosmaria/core-application';
import type { DomainEvent } from '@cosmaria/core-domain';

export type ManipuladorDeEvento = (evento: DomainEvent) => void | Promise<void>;

/**
 * Barramento de eventos EM PROCESSO (doc 04 §9 — EDA seletivo no monolito modular).
 * Publica de forma síncrona para os assinantes registrados. É o ponto de troca:
 * um barramento distribuído futuro implementa a mesma porta EventPublisher, sem
 * tocar nos casos de uso (doc 13 §16.1). Consumidores reais (auditoria, IA,
 * Comunidade) se registram nas suas próprias épicas.
 */
export class InProcessEventPublisher implements EventPublisher {
  private readonly assinantes = new Map<string, ManipuladorDeEvento[]>();

  /** Registra um manipulador para um nome de evento (Catálogo de Domínio). */
  assinar(nomeEvento: string, manipulador: ManipuladorDeEvento): void {
    const lista = this.assinantes.get(nomeEvento) ?? [];
    lista.push(manipulador);
    this.assinantes.set(nomeEvento, lista);
  }

  async publicar(evento: DomainEvent): Promise<void> {
    const manipuladores = this.assinantes.get(evento.nome) ?? [];
    for (const manipulador of manipuladores) {
      await manipulador(evento);
    }
  }
}
