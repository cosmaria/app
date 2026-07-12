import type { DomainEvent } from '@cosmaria/core-domain';
import type { DirecaoDaCorrelacao, DominioDeDado, Fator, NivelDeConfianca } from '../catalogos';

/**
 * Eventos de domínio da IA (doc 05 §Eventos). Implementam o `DomainEvent` do Core (shared
 * kernel). O Motor de Insights (épica IA-2) consumirá `CorrelacaoCalculada`.
 */

/** `CorrelacaoCalculada` — publicado quando o Motor de Correlação conclui (doc 05 §6.1). */
export class CorrelacaoCalculada implements DomainEvent {
  readonly nome = 'CorrelacaoCalculada';
  readonly ocorridoEm: Date;

  constructor(
    readonly usuarioId: string,
    readonly dominio: DominioDeDado,
    readonly fatorA: Fator,
    readonly fatorB: Fator,
    readonly forca: number,
    readonly direcao: DirecaoDaCorrelacao,
    readonly confianca: NivelDeConfianca,
    readonly tamanhoAmostra: number,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}
