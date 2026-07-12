import { AcessoNegadoError } from '@cosmaria/core-domain';
import { TratamentoEncerradoError } from './errors/med.errors';
import { StatusDoTratamento } from './catalogos';

export interface TratamentoProps {
  id: string;
  usuarioId: string;
  /** Condição/motivo do tratamento, em texto livre do paciente (doc 03 §5.1). */
  condicao: string;
  /** Objetivo terapêutico, quando o paciente quer registrá-lo. */
  objetivo: string | null;
  /**
   * Médico responsável — texto livre, opcional. Não é integração com prontuário nem
   * validação de CRM; o Med acompanha, não substitui o médico (doc 03 §3).
   */
  medicoResponsavel: string | null;
  status: StatusDoTratamento;
  iniciadoEm: Date;
  /** Nulo enquanto ativo. */
  encerradoEm: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * Tratamento (doc 03 §5.1, doc 08 — Arquétipo A, entidade central do Med).
 *
 * Um paciente tem N tratamentos ao longo do tempo, inclusive encerrados: o histórico é a
 * matéria-prima da evolução clínica e do relatório levado ao médico. Encerrar é o fim da
 * fase ativa, não uma exclusão — nenhum registro é apagado.
 */
export class Tratamento {
  private constructor(private readonly props: TratamentoProps) {}

  static reconstituir(props: TratamentoProps): Tratamento {
    return new Tratamento(props);
  }

  static criar(params: {
    id: string;
    usuarioId: string;
    condicao: string;
    objetivo?: string | null;
    medicoResponsavel?: string | null;
    iniciadoEm?: Date;
    criadoEm?: Date;
  }): Tratamento {
    const agora = params.criadoEm ?? new Date();
    return new Tratamento({
      id: params.id,
      usuarioId: params.usuarioId,
      condicao: params.condicao.trim(),
      objetivo: params.objetivo ?? null,
      medicoResponsavel: params.medicoResponsavel ?? null,
      status: StatusDoTratamento.ATIVO,
      iniciadoEm: params.iniciadoEm ?? agora,
      encerradoEm: null,
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
  get condicao(): string {
    return this.props.condicao;
  }
  get objetivo(): string | null {
    return this.props.objetivo;
  }
  get medicoResponsavel(): string | null {
    return this.props.medicoResponsavel;
  }
  get status(): StatusDoTratamento {
    return this.props.status;
  }
  get iniciadoEm(): Date {
    return this.props.iniciadoEm;
  }
  get encerradoEm(): Date | null {
    return this.props.encerradoEm;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  estaAtivo(): boolean {
    return this.props.status === StatusDoTratamento.ATIVO;
  }

  /** `undefined` = não mexer; `null` = limpar o campo. */
  atualizar(
    campos: {
      condicao?: string;
      objetivo?: string | null;
      medicoResponsavel?: string | null;
    },
    agora: Date = new Date(),
  ): void {
    this.garantirAtivo();
    if (campos.condicao !== undefined) {
      this.props.condicao = campos.condicao.trim();
    }
    if (campos.objetivo !== undefined) {
      this.props.objetivo = campos.objetivo;
    }
    if (campos.medicoResponsavel !== undefined) {
      this.props.medicoResponsavel = campos.medicoResponsavel;
    }
    this.props.atualizadoEm = agora;
  }

  /** Encerrar é idempotente: reencerrar um tratamento já encerrado não é um erro. */
  encerrar(agora: Date = new Date()): void {
    if (!this.estaAtivo()) {
      return;
    }
    this.props.status = StatusDoTratamento.ENCERRADO;
    this.props.encerradoEm = agora;
    this.props.atualizadoEm = agora;
  }

  garantirAtivo(): void {
    if (!this.estaAtivo()) {
      throw new TratamentoEncerradoError();
    }
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
