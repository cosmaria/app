import type { DomainEvent } from './domain-event';
import type { ContextoDeApp } from '../perfil/contexto-de-app';

/**
 * `PerfilPublicoCriado` (Catálogo de Domínio, doc 06 §9). Publicado na criação lazy do
 * perfil, na primeira interação da Conta com a Comunidade daquele contexto.
 * Informacional: nenhum consumidor reage a ele hoje — nunca é auditado, porque não é
 * uma revelação de identidade, e nunca cruza contextos.
 */
export class PerfilPublicoCriado implements DomainEvent {
  readonly nome = 'PerfilPublicoCriado';
  readonly ocorridoEm: Date;

  constructor(
    readonly perfilId: string,
    readonly usuarioId: string,
    readonly contexto: ContextoDeApp,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}
