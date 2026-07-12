import type { DomainEvent } from '@cosmaria/core-domain';

/**
 * Eventos de domínio do Med (Catálogo de Domínio, doc 03 §Eventos).
 *
 * Implementam o `DomainEvent` do Core — shared kernel, o contrato técnico do barramento.
 * Publicá-los é a única forma pela qual o Med provoca efeito em outro módulo: ele nunca
 * chama IA, Comunidade ou Notificações diretamente (doc 04 §9). Nenhum consumidor existe
 * ainda no MVP do núcleo; os eventos são publicados desde já para que IA (correlação
 * dose × sintoma) e Notificações (lembrete de dose) se conectem sem retrabalho.
 */

/** `TratamentoCriado` — consumido por IA (abre a linha do tempo clínica do paciente). */
export class TratamentoCriado implements DomainEvent {
  readonly nome = 'TratamentoCriado';
  readonly ocorridoEm: Date;

  constructor(
    readonly tratamentoId: string,
    readonly usuarioId: string,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/** `TratamentoEncerrado` — consumido por IA e Relatórios (fecha o período clínico). */
export class TratamentoEncerrado implements DomainEvent {
  readonly nome = 'TratamentoEncerrado';
  readonly ocorridoEm: Date;

  constructor(
    readonly tratamentoId: string,
    readonly usuarioId: string,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/** `ProdutoRegistrado` — informacional; nenhum consumidor reage a ele hoje. */
export class ProdutoRegistrado implements DomainEvent {
  readonly nome = 'ProdutoRegistrado';
  readonly ocorridoEm: Date;

  constructor(
    readonly produtoId: string,
    readonly usuarioId: string,
    readonly tratamentoId: string,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/**
 * `DoseRegistrada` — consumido pelo Motor de Correlação da IA (doc 03 §8) e por
 * Notificações (agenda o pedido de registro "depois" da sessão, quando houver).
 * Carrega produto e horário para o consumidor não precisar reabrir a dose.
 */
export class DoseRegistrada implements DomainEvent {
  readonly nome = 'DoseRegistrada';
  readonly ocorridoEm: Date;

  constructor(
    readonly registroDeUsoId: string,
    readonly usuarioId: string,
    readonly produtoId: string,
    readonly usadoEm: Date,
    /** Valor numérico da dose — a IA correlaciona dose × sintoma sem reabrir o registro. */
    readonly quantidade: number,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/**
 * `SessaoAntesRegistrada` — consumido por Notificações: agenda o lembrete do "depois"
 * após `intervaloMinutos` (doc 03 §5.4/§14 — agendamento confiável é risco técnico central).
 */
export class SessaoAntesRegistrada implements DomainEvent {
  readonly nome = 'SessaoAntesRegistrada';
  readonly ocorridoEm: Date;

  constructor(
    readonly sessaoId: string,
    readonly usuarioId: string,
    readonly registroDeUsoId: string,
    readonly intervaloMinutos: number,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/** `SessaoDepoisRegistrada` — consumido pela IA (fecha o par antes/depois para a correlação). */
export class SessaoDepoisRegistrada implements DomainEvent {
  readonly nome = 'SessaoDepoisRegistrada';
  readonly ocorridoEm: Date;

  constructor(
    readonly sessaoId: string,
    readonly usuarioId: string,
    /** Variação antes−depois (positivo = melhora): a efetividade percebida que a IA correlaciona. */
    readonly variacao: number | null,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/** `SintomaDiarioRegistrado` — consumido pela IA (linha de base longitudinal, doc 03 §8). */
export class SintomaDiarioRegistrado implements DomainEvent {
  readonly nome = 'SintomaDiarioRegistrado';
  readonly ocorridoEm: Date;

  constructor(
    readonly registroId: string,
    readonly usuarioId: string,
    /** As dimensões da linha de base (0–10, `null` = não registrada) — a IA correlaciona cada uma. */
    readonly humor: number | null,
    readonly ansiedade: number | null,
    readonly dor: number | null,
    readonly sono: number | null,
    readonly apetite: number | null,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/** `EfeitoRegistrado` — consumido pela IA (detecção de padrões de efeito adverso, doc 03 §8). */
export class EfeitoRegistrado implements DomainEvent {
  readonly nome = 'EfeitoRegistrado';
  readonly ocorridoEm: Date;

  constructor(
    readonly efeitoId: string,
    readonly usuarioId: string,
    readonly registroDeUsoId: string,
    readonly tipo: string,
    /** Intensidade percebida (0–10, `null` = não informada) — a IA detecta padrões de efeito. */
    readonly intensidade: number | null,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}

/**
 * `RelatorioGerado` — consumido por Notificações/analytics. Informa que o paciente gerou
 * um relatório clínico de um tratamento num período (doc 03 §5.7).
 */
export class RelatorioGerado implements DomainEvent {
  readonly nome = 'RelatorioGerado';
  readonly ocorridoEm: Date;

  constructor(
    readonly tratamentoId: string,
    readonly usuarioId: string,
    ocorridoEm?: Date,
  ) {
    this.ocorridoEm = ocorridoEm ?? new Date();
  }
}
