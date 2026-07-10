import { AcessoNegadoError } from '@cosmaria/core-domain';
import { TipoDeAmbiente } from './catalogos';

export interface AmbienteProps {
  id: string;
  usuarioId: string;
  nome: string;
  tipo: TipoDeAmbiente;
  /** Dimensões em centímetros. Nulas quando o usuário ainda não as informou. */
  larguraCm: number | null;
  comprimentoCm: number | null;
  alturaCm: number | null;
  /** Quantas plantas o espaço comporta. Informativo — nunca um limite imposto. */
  capacidadePlantas: number | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * Ambiente (doc 02 §5.3, doc 08 §12.2 — Arquétipo A).
 *
 * O espaço físico tem histórico próprio: um ambiente hospeda **múltiplos ciclos** ao
 * longo do tempo, e por isso não é excluído enquanto tiver ciclos registrados.
 *
 * `OUTDOOR` é suportado desde a v1 de forma **manual**. O enriquecimento climático
 * (clima, previsão, dados solares) pertence ao Módulo Outdoor, desacoplado (doc 02 §6):
 * esta entidade não conhece nem depende dele para funcionar.
 */
export class Ambiente {
  private constructor(private readonly props: AmbienteProps) {}

  static reconstituir(props: AmbienteProps): Ambiente {
    return new Ambiente(props);
  }

  static criar(params: {
    id: string;
    usuarioId: string;
    nome: string;
    tipo: TipoDeAmbiente;
    larguraCm?: number | null;
    comprimentoCm?: number | null;
    alturaCm?: number | null;
    capacidadePlantas?: number | null;
    criadoEm?: Date;
  }): Ambiente {
    const agora = params.criadoEm ?? new Date();
    return new Ambiente({
      id: params.id,
      usuarioId: params.usuarioId,
      nome: params.nome.trim(),
      tipo: params.tipo,
      larguraCm: params.larguraCm ?? null,
      comprimentoCm: params.comprimentoCm ?? null,
      alturaCm: params.alturaCm ?? null,
      capacidadePlantas: params.capacidadePlantas ?? null,
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
  get nome(): string {
    return this.props.nome;
  }
  get tipo(): TipoDeAmbiente {
    return this.props.tipo;
  }
  get larguraCm(): number | null {
    return this.props.larguraCm;
  }
  get comprimentoCm(): number | null {
    return this.props.comprimentoCm;
  }
  get alturaCm(): number | null {
    return this.props.alturaCm;
  }
  get capacidadePlantas(): number | null {
    return this.props.capacidadePlantas;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  /** Só ambientes outdoor podem ser enriquecidos pelo Módulo Outdoor (doc 02 §5.3). */
  aceitaDadosClimaticos(): boolean {
    return this.props.tipo === TipoDeAmbiente.OUTDOOR;
  }

  atualizar(
    campos: {
      nome?: string;
      tipo?: TipoDeAmbiente;
      larguraCm?: number | null;
      comprimentoCm?: number | null;
      alturaCm?: number | null;
      capacidadePlantas?: number | null;
    },
    agora: Date = new Date(),
  ): void {
    if (campos.nome !== undefined) {
      this.props.nome = campos.nome.trim();
    }
    if (campos.tipo !== undefined) {
      this.props.tipo = campos.tipo;
    }
    if (campos.larguraCm !== undefined) {
      this.props.larguraCm = campos.larguraCm;
    }
    if (campos.comprimentoCm !== undefined) {
      this.props.comprimentoCm = campos.comprimentoCm;
    }
    if (campos.alturaCm !== undefined) {
      this.props.alturaCm = campos.alturaCm;
    }
    if (campos.capacidadePlantas !== undefined) {
      this.props.capacidadePlantas = campos.capacidadePlantas;
    }
    this.props.atualizadoEm = agora;
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
