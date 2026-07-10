import { AcessoNegadoError } from '@cosmaria/core-domain';
import { OrigemDaTarefa, StatusDaTarefa, TipoDeTarefa } from './catalogos-de-tarefa';

const UM_DIA_MS = 86_400_000;

export interface TarefaProps {
  id: string;
  usuarioId: string;
  cicloId: string;
  /** Nulo = tarefa do ciclo inteiro; preenchido = tarefa de uma planta específica. */
  plantaId: string | null;
  titulo: string;
  tipo: TipoDeTarefa;
  origem: OrigemDaTarefa;
  status: StatusDaTarefa;
  /** Quando a tarefa deve ser feita — base do lembrete. Nulo = sem data definida. */
  previstaPara: Date | null;
  /** Recorrência em dias; nulo = tarefa pontual (uma vez só). */
  recorrenciaDias: number | null;
  concluidaEm: Date | null;
  /**
   * Alerta da IA que originou a tarefa (quando `origem = IA`). Modelado desde já; só é
   * preenchido quando a épica de IA existir e publicar `AlertaGerado`.
   */
  alertaId: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * Tarefa (doc 02 §5.10, doc 08 §Tarefa — Arquétipo A, operacional e mutável).
 *
 * É um **plano de ação**, não um registro histórico: nasce pendente e pode ser editada
 * enquanto não concluída — o oposto de `EventoManejo`, que registra o que já aconteceu.
 * Uma tarefa recorrente, ao ser concluída, gera a próxima ocorrência (ver `proximaOcorrencia`).
 */
export class Tarefa {
  private constructor(private readonly props: TarefaProps) {}

  static reconstituir(props: TarefaProps): Tarefa {
    return new Tarefa(props);
  }

  static criar(params: {
    id: string;
    usuarioId: string;
    cicloId: string;
    plantaId?: string | null;
    titulo: string;
    tipo: TipoDeTarefa;
    origem?: OrigemDaTarefa;
    previstaPara?: Date | null;
    recorrenciaDias?: number | null;
    alertaId?: string | null;
    criadoEm?: Date;
  }): Tarefa {
    const agora = params.criadoEm ?? new Date();
    return new Tarefa({
      id: params.id,
      usuarioId: params.usuarioId,
      cicloId: params.cicloId,
      plantaId: params.plantaId ?? null,
      titulo: params.titulo.trim(),
      tipo: params.tipo,
      origem: params.origem ?? OrigemDaTarefa.MANUAL,
      status: StatusDaTarefa.PENDENTE,
      previstaPara: params.previstaPara ?? null,
      recorrenciaDias: params.recorrenciaDias ?? null,
      concluidaEm: null,
      alertaId: params.alertaId ?? null,
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get cicloId(): string {
    return this.props.cicloId;
  }
  get plantaId(): string | null {
    return this.props.plantaId;
  }
  get titulo(): string {
    return this.props.titulo;
  }
  get tipo(): TipoDeTarefa {
    return this.props.tipo;
  }
  get origem(): OrigemDaTarefa {
    return this.props.origem;
  }
  get status(): StatusDaTarefa {
    return this.props.status;
  }
  get previstaPara(): Date | null {
    return this.props.previstaPara;
  }
  get recorrenciaDias(): number | null {
    return this.props.recorrenciaDias;
  }
  get concluidaEm(): Date | null {
    return this.props.concluidaEm;
  }
  get alertaId(): string | null {
    return this.props.alertaId;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  estaConcluida(): boolean {
    return this.props.status === StatusDaTarefa.CONCLUIDA;
  }

  ehRecorrente(): boolean {
    return this.props.recorrenciaDias !== null;
  }

  /** Edita uma tarefa. Campo ausente não muda; `null` limpa datas/recorrência. */
  atualizar(
    campos: {
      titulo?: string;
      tipo?: TipoDeTarefa;
      previstaPara?: Date | null;
      recorrenciaDias?: number | null;
    },
    agora: Date = new Date(),
  ): void {
    if (campos.titulo !== undefined) this.props.titulo = campos.titulo.trim();
    if (campos.tipo !== undefined) this.props.tipo = campos.tipo;
    if (campos.previstaPara !== undefined) this.props.previstaPara = campos.previstaPara;
    if (campos.recorrenciaDias !== undefined) this.props.recorrenciaDias = campos.recorrenciaDias;
    this.props.atualizadoEm = agora;
  }

  /** Conclui a tarefa. Idempotente: reconcluir não move a data original. */
  concluir(agora: Date = new Date()): void {
    if (this.props.status === StatusDaTarefa.CONCLUIDA) return;
    this.props.status = StatusDaTarefa.CONCLUIDA;
    this.props.concluidaEm = agora;
    this.props.atualizadoEm = agora;
  }

  /**
   * Próxima ocorrência de uma tarefa recorrente, ou `null` se for pontual. A nova data
   * avança a partir da data prevista (para manter o ritmo — uma rega diária não desliza),
   * ou de `agora` quando não havia data.
   */
  proximaOcorrencia(novoId: string, agora: Date = new Date()): Tarefa | null {
    if (this.props.recorrenciaDias === null) return null;
    const base = this.props.previstaPara ?? agora;
    const proximaData = new Date(base.getTime() + this.props.recorrenciaDias * UM_DIA_MS);
    return Tarefa.criar({
      id: novoId,
      usuarioId: this.props.usuarioId,
      cicloId: this.props.cicloId,
      plantaId: this.props.plantaId,
      titulo: this.props.titulo,
      tipo: this.props.tipo,
      origem: this.props.origem,
      previstaPara: proximaData,
      recorrenciaDias: this.props.recorrenciaDias,
      criadoEm: agora,
    });
  }

  pertenceA(usuarioId: string): boolean {
    return this.props.usuarioId === usuarioId;
  }

  garantirAutoria(usuarioId: string): void {
    if (!this.pertenceA(usuarioId)) {
      throw new AcessoNegadoError();
    }
  }
}
