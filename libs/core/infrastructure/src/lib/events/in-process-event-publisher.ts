import type { EventPublisher } from '@cosmaria/core-application';
import type { DomainEvent } from '@cosmaria/core-domain';

export type ManipuladorDeEvento = (evento: DomainEvent) => void | Promise<void>;

interface Assinatura {
  readonly assinanteId: string;
  readonly manipulador: ManipuladorDeEvento;
}

/**
 * Registro de assinantes + entrega local do barramento de eventos (doc 04 §9 — EDA
 * seletivo no monolito modular).
 *
 * Dois papéis, deliberadamente separados do *transporte*:
 *  - **Registro**: cada consumidor (IA, Auditoria, Comunidade, Notificações) se registra
 *    em `onModuleInit` com `assinar(nome, manipulador, assinanteId)`. O `assinanteId` dá
 *    identidade estável à assinatura — é o que o transporte durável (outbox) usa para
 *    entregar por assinante e marcar sucesso individual (isolamento + dead-letter por
 *    consumidor).
 *  - **Entrega local**: `entregarPara`/`publicarLocal` invocam os manipuladores em processo.
 *
 * Quando **não há transporte durável** (dev/teste sem Postgres), esta mesma classe é ligada
 * a `EVENT_PUBLISHER` e `publicar` delega a `publicarLocal` — entrega síncrona, isolada por
 * assinante, comportamento equivalente ao MVP. Com Postgres, quem implementa `EVENT_PUBLISHER`
 * é o `OutboxEventPublisher`, que persiste e devolve; o `OutboxDispatcher` então chama de
 * volta `entregarPara` aqui. Trocar o transporte não toca em nenhum caso de uso (doc 13 §16.1).
 */
export class InProcessEventPublisher implements EventPublisher {
  private readonly assinantes = new Map<string, Assinatura[]>();

  /** Registra um manipulador para um nome de evento (Catálogo de Domínio), com identidade. */
  assinar(nomeEvento: string, manipulador: ManipuladorDeEvento, assinanteId: string): void {
    const lista = this.assinantes.get(nomeEvento) ?? [];
    lista.push({ assinanteId, manipulador });
    this.assinantes.set(nomeEvento, lista);
  }

  /** Ids dos assinantes registrados para um nome de evento — snapshot para o outbox. */
  assinantesDe(nomeEvento: string): string[] {
    return (this.assinantes.get(nomeEvento) ?? []).map((a) => a.assinanteId);
  }

  /**
   * Entrega o evento a UM assinante específico. Usado pelo despachante do outbox para
   * repetir só quem falhou. Propaga a exceção do manipulador (o despachante decide o retry).
   */
  async entregarPara(assinanteId: string, evento: DomainEvent): Promise<void> {
    const assinatura = (this.assinantes.get(evento.nome) ?? []).find(
      (a) => a.assinanteId === assinanteId,
    );
    if (assinatura) {
      await assinatura.manipulador(evento);
    }
  }

  /**
   * Entrega síncrona em processo a todos os assinantes, isolando falhas: uma exceção de
   * um assinante não impede os demais. É o caminho de fallback (sem Postgres). Retorna os
   * `assinanteId` que falharam (vazio = todos ok).
   */
  async publicarLocal(evento: DomainEvent): Promise<string[]> {
    const falhados: string[] = [];
    for (const { assinanteId, manipulador } of this.assinantes.get(evento.nome) ?? []) {
      try {
        await manipulador(evento);
      } catch {
        falhados.push(assinanteId);
      }
    }
    return falhados;
  }

  /** Implementa a porta `EventPublisher` no modo sem transporte durável (fallback). */
  async publicar(evento: DomainEvent): Promise<void> {
    await this.publicarLocal(evento);
  }
}
