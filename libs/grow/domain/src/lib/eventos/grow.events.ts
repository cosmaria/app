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

/**
 * `RegistroAmbientalCriado` — consumido pelo Motor de Correlação da IA (doc 05).
 * Carrega os derivados já calculados: a IA não precisa reaplicar as fórmulas do Grow,
 * o que criaria duas implementações do mesmo cálculo, livres para divergir.
 */
export class RegistroAmbientalCriado implements DomainEvent {
  readonly nome = 'RegistroAmbientalCriado';
  readonly ocorridoEm: Date;

  constructor(
    readonly registroId: string,
    readonly usuarioId: string,
    readonly cicloId: string,
    readonly plantaId: string | null,
    readonly vpdKpa: number | null,
    readonly dli: number | null,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/**
 * `ColheitaRegistrada` — consumido por IA e Notificações (Catálogo de Domínio, doc 02/04).
 * Carrega a quantidade de plantas e o peso úmido para que o consumidor não precise reabrir
 * a colheita só para calcular rendimento ou disparar o guia de secagem/cura.
 */
export class ColheitaRegistrada implements DomainEvent {
  readonly nome = 'ColheitaRegistrada';
  readonly ocorridoEm: Date;

  constructor(
    readonly colheitaId: string,
    readonly usuarioId: string,
    readonly cicloId: string,
    readonly quantidadeDePlantas: number,
    readonly pesoUmidoGramas: number | null,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/** `TarefaCriada` — consumido por Notificações (agenda o lembrete). */
export class TarefaCriada implements DomainEvent {
  readonly nome = 'TarefaCriada';
  readonly ocorridoEm: Date;

  constructor(
    readonly tarefaId: string,
    readonly usuarioId: string,
    readonly cicloId: string,
    readonly titulo: string,
    /** Quando a tarefa deve ser feita — o lembrete se ancora nela. Nulo = sem data. */
    readonly previstaPara: Date | null,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/** `TarefaConcluida` — consumido pela IA (fecha o loop de aderência às ações). */
export class TarefaConcluida implements DomainEvent {
  readonly nome = 'TarefaConcluida';
  readonly ocorridoEm: Date;

  constructor(
    readonly tarefaId: string,
    readonly usuarioId: string,
    readonly cicloId: string,
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
