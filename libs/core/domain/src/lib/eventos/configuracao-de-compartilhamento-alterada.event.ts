import type { DomainEvent } from './domain-event';

/**
 * Evento `ConfiguracaoDeCompartilhamentoAlterada` (Catálogo de Domínio).
 * Publicado pelo Core quando o autor cria/edita a privacidade de um conteúdo.
 * Consumidor previsto: TrilhaDeAuditoria (épica de Consentimento/LGPD) — doc 08 §7
 * exige auditoria de toda mudança de ConfiguraçãoDeCompartilhamento.
 */
export class ConfiguracaoDeCompartilhamentoAlterada implements DomainEvent {
  readonly nome = 'ConfiguracaoDeCompartilhamentoAlterada';
  readonly ocorridoEm: Date;

  constructor(
    readonly configuracaoId: string,
    readonly autorId: string,
    readonly modulo: string,
    readonly tipoConteudo: string,
    readonly conteudoId: string,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}
