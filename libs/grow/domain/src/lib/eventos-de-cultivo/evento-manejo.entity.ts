import { AcessoNegadoError } from '@cosmaria/core-domain';
import type { TipoDeManejo } from './catalogos-de-evento';

export interface EventoManejoProps {
  id: string;
  usuarioId: string;
  cicloId: string;
  /** Nulo quando o manejo foi no ciclo inteiro (ex.: fertilização de todas as plantas). */
  plantaId: string | null;
  tipo: TipoDeManejo;
  ocorridoEm: Date;
  observacoes: string | null;
  criadoEm: Date;
}

/**
 * EventoManejo (doc 02 §5.7, doc 08 §12.2 — Arquétipo B, histórico imutável).
 *
 * Registra o que o cultivador **fez**. É imutável por definição: uma poda que aconteceu
 * não deixa de ter acontecido, e a IA correlaciona intervenções com o que veio depois.
 * Errou o registro? Registre o correto — o histórico do que se acreditou na hora também
 * é dado.
 */
export class EventoManejo {
  private constructor(private readonly props: EventoManejoProps) {}

  static reconstituir(props: EventoManejoProps): EventoManejo {
    return new EventoManejo(props);
  }

  static registrar(params: {
    id: string;
    usuarioId: string;
    cicloId: string;
    plantaId?: string | null;
    tipo: TipoDeManejo;
    ocorridoEm?: Date;
    observacoes?: string | null;
    criadoEm?: Date;
  }): EventoManejo {
    const agora = params.criadoEm ?? new Date();
    return new EventoManejo({
      id: params.id,
      usuarioId: params.usuarioId,
      cicloId: params.cicloId,
      plantaId: params.plantaId ?? null,
      tipo: params.tipo,
      ocorridoEm: params.ocorridoEm ?? agora,
      observacoes: params.observacoes ?? null,
      criadoEm: agora,
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
  get tipo(): TipoDeManejo {
    return this.props.tipo;
  }
  get ocorridoEm(): Date {
    return this.props.ocorridoEm;
  }
  get observacoes(): string | null {
    return this.props.observacoes;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
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
