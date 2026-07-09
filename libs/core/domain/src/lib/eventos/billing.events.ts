import type { DomainEvent } from './domain-event';
import type { Plano } from '../billing/plano';
import type { StatusAssinatura } from '../billing/status-assinatura';

/**
 * `AssinaturaAtualizada` (Catálogo de Domínio). Publicado a CADA mudança de status da
 * `AssinaturaPremium`. Consumido por Notificações e pela TrilhaDeAuditoria (doc 08
 * §12.6 — mudança de status tem implicação financeira, auditoria obrigatória).
 *
 * Consolidação decidida na implementação: o doc 07 previa `AssinaturaIniciada` e
 * `AssinaturaCancelada` como eventos separados, mas ambos são casos particulares de uma
 * transição de status, já descritos por `statusAnterior`→`statusNovo`. Publicar os três
 * significaria duas fontes de verdade para o mesmo fato. Mesmo precedente da unificação
 * de `LimitePremiumAtingido` (que era duplicado por app antes do doc 04).
 */
export class AssinaturaAtualizada implements DomainEvent {
  readonly nome = 'AssinaturaAtualizada';
  readonly ocorridoEm: Date;

  constructor(
    readonly assinaturaId: string,
    readonly usuarioId: string,
    readonly statusAnterior: StatusAssinatura,
    readonly statusNovo: StatusAssinatura,
    readonly plano: Plano,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/** `PagamentoRecebido` — publicado pelo webhook do gateway (doc 09 §9). */
export class PagamentoRecebido implements DomainEvent {
  readonly nome = 'PagamentoRecebido';
  readonly ocorridoEm: Date;

  constructor(
    readonly usuarioId: string,
    /** Id do evento no provedor — é também a chave de idempotência do webhook. */
    readonly eventoExternoId: string,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/** `PagamentoFalhou` — consumido por Notificações e TrilhaDeAuditoria (doc 09 §9). */
export class PagamentoFalhou implements DomainEvent {
  readonly nome = 'PagamentoFalhou';
  readonly ocorridoEm: Date;

  constructor(
    readonly usuarioId: string,
    readonly eventoExternoId: string,
    /** Motivo relatado pelo provedor — nunca dado de cartão, só um código opaco. */
    readonly motivo: string | null,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/**
 * `LimitePremiumAtingido` (doc 04 — evento ÚNICO do Core, nunca duplicado por app).
 * Consumido por Grow, Med e Notificações. Publicado quando uma tentativa de criar
 * nova capacidade simultânea esbarra no `LimiteDePlano` do plano gratuito.
 */
export class LimitePremiumAtingido implements DomainEvent {
  readonly nome = 'LimitePremiumAtingido';
  readonly ocorridoEm: Date;

  constructor(
    readonly usuarioId: string,
    readonly chave: string,
    readonly limite: number,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}
