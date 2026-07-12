import type { DomainEvent } from '@cosmaria/core-domain';

/**
 * Eventos de domínio da Comunidade (Catálogo de Domínio, doc 06 §Eventos/§Notificações).
 *
 * São publicados para que o Serviço de Notificações avise o autor sobre interação social
 * (novo seguidor, curtida, comentário) — sempre referenciando o **Perfil Público do contexto
 * correto**, nunca misturando Grow e Med (doc 06 §Notificações). Carregam o perfil do
 * DESTINATÁRIO (autor/seguido); a resolução perfil→Conta é responsabilidade do Core
 * (o `usuarioId` é deliberadamente oculto da Comunidade, doc 06 §13).
 */

/** `PerfilSeguido` — notifica o perfil seguido que ganhou um novo seguidor. */
export class PerfilSeguido implements DomainEvent {
  readonly nome = 'PerfilSeguido';
  readonly ocorridoEm: Date;

  constructor(
    readonly seguidoPerfilId: string,
    readonly seguidorPerfilId: string,
    readonly contexto: string,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/** `PublicacaoCurtida` — notifica o autor da publicação sobre uma nova curtida. */
export class PublicacaoCurtida implements DomainEvent {
  readonly nome = 'PublicacaoCurtida';
  readonly ocorridoEm: Date;

  constructor(
    readonly publicacaoId: string,
    readonly autorPerfilId: string,
    readonly curtidorPerfilId: string,
    readonly contexto: string,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/** `PublicacaoComentada` — notifica o autor da publicação sobre um novo comentário. */
export class PublicacaoComentada implements DomainEvent {
  readonly nome = 'PublicacaoComentada';
  readonly ocorridoEm: Date;

  constructor(
    readonly publicacaoId: string,
    readonly autorPerfilId: string,
    readonly comentaristaPerfilId: string,
    readonly comentarioId: string,
    readonly contexto: string,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/**
 * `GrowlogForkRealizado` — o autor original ganhou um fork do seu Growlog (doc 02 §9.2).
 * Notifica o autor original e alimenta a reputação por perfil (Com-5). Emitido pela operação
 * de Fork da Comunidade sobre conteúdo do contexto Grow.
 */
export class GrowlogForkRealizado implements DomainEvent {
  readonly nome = 'GrowlogForkRealizado';
  readonly ocorridoEm: Date;

  constructor(
    readonly publicacaoOrigemId: string,
    readonly conteudoOrigemId: string,
    readonly autorOriginalPerfilId: string,
    readonly forkerPerfilId: string,
    readonly contexto: string,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}
