import type { DomainEvent } from '@cosmaria/core-domain';
import type { FaseDeVida } from '../catalogos';

/**
 * Eventos de domínio do Grow (Catálogo de Domínio).
 *
 * Implementam o `DomainEvent` do Core, que é **shared kernel** — o contrato técnico do
 * barramento, comum a todos os bounded contexts. Publicá-los é a única forma pela qual o
 * Grow provoca efeito em outro módulo: ele nunca chama IA, Comunidade ou Notificações
 * diretamente (doc 04 §9).
 */

/** `CicloCriado` — consumido por Estatísticas e IA. */
export class CicloCriado implements DomainEvent {
  readonly nome = 'CicloCriado';
  readonly ocorridoEm: Date;

  constructor(
    readonly cicloId: string,
    readonly usuarioId: string,
    readonly ambienteId: string,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/** `CicloFinalizado` — consumido por Estatísticas e IA. */
export class CicloFinalizado implements DomainEvent {
  readonly nome = 'CicloFinalizado';
  readonly ocorridoEm: Date;

  constructor(
    readonly cicloId: string,
    readonly usuarioId: string,
    /** Duração total do ciclo, em dias — evita que o consumidor releia o histórico. */
    readonly duracaoEmDias: number,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/** `PlantaCriada` — informacional; nenhum consumidor reage a ele hoje. */
export class PlantaCriada implements DomainEvent {
  readonly nome = 'PlantaCriada';
  readonly ocorridoEm: Date;

  constructor(
    readonly plantaId: string,
    readonly usuarioId: string,
    readonly cicloId: string,
    readonly geneticaId: string,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/** `PlantaFaseAlterada` — consumido por IA e Notificações. */
export class PlantaFaseAlterada implements DomainEvent {
  readonly nome = 'PlantaFaseAlterada';
  readonly ocorridoEm: Date;

  constructor(
    readonly plantaId: string,
    readonly usuarioId: string,
    readonly faseAnterior: FaseDeVida,
    readonly faseNova: FaseDeVida,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}
