import { AcessoNegadoError } from '@cosmaria/core-domain';
import type { Severidade, TipoDeSanidade } from './catalogos-de-evento';

export interface EventoSanidadeProps {
  id: string;
  usuarioId: string;
  cicloId: string;
  plantaId: string | null;
  tipo: TipoDeSanidade;
  severidade: Severidade;
  /** Descrição livre do que foi observado (ex.: "manchas amarelas nas folhas baixas"). */
  descricao: string | null;
  tratamentoAplicado: string | null;
  ocorridoEm: Date;
  /** Nulo enquanto não resolvido. Preenchido uma única vez, nunca desfeito. */
  resolvidoEm: Date | null;
  criadoEm: Date;
}

/**
 * EventoSanidade (doc 02 §5.8, doc 08 §12.2 — Arquétipo B).
 *
 * O doc 02 pede "evolução/resolução", o que parece contradizer o histórico imutável do
 * Arquétipo B. Não contradiz: `resolvidoEm` é uma transição **monotônica e única** — uma
 * praga resolvida não volta a estar aberta, e marcar a resolução não reescreve nada do
 * que foi observado. É a mesma forma de `lidaEm` numa notificação.
 *
 * Piorou depois de resolvido? Isso é uma **nova ocorrência**, com sua própria severidade
 * e data — e é assim que a IA enxerga reincidência, em vez de um único registro editado
 * até perder o histórico.
 */
export class EventoSanidade {
  private constructor(private readonly props: EventoSanidadeProps) {}

  static reconstituir(props: EventoSanidadeProps): EventoSanidade {
    return new EventoSanidade(props);
  }

  static registrar(params: {
    id: string;
    usuarioId: string;
    cicloId: string;
    plantaId?: string | null;
    tipo: TipoDeSanidade;
    severidade: Severidade;
    descricao?: string | null;
    tratamentoAplicado?: string | null;
    ocorridoEm?: Date;
    criadoEm?: Date;
  }): EventoSanidade {
    const agora = params.criadoEm ?? new Date();
    return new EventoSanidade({
      id: params.id,
      usuarioId: params.usuarioId,
      cicloId: params.cicloId,
      plantaId: params.plantaId ?? null,
      tipo: params.tipo,
      severidade: params.severidade,
      descricao: params.descricao ?? null,
      tratamentoAplicado: params.tratamentoAplicado ?? null,
      ocorridoEm: params.ocorridoEm ?? agora,
      resolvidoEm: null,
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
  get tipo(): TipoDeSanidade {
    return this.props.tipo;
  }
  get severidade(): Severidade {
    return this.props.severidade;
  }
  get descricao(): string | null {
    return this.props.descricao;
  }
  get tratamentoAplicado(): string | null {
    return this.props.tratamentoAplicado;
  }
  get ocorridoEm(): Date {
    return this.props.ocorridoEm;
  }
  get resolvidoEm(): Date | null {
    return this.props.resolvidoEm;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  estaResolvido(): boolean {
    return this.props.resolvidoEm !== null;
  }

  /**
   * Marca a resolução. Idempotente: reaplicar não move a data original, porque quando o
   * problema se resolveu é um fato, não uma opinião revisável.
   * O tratamento pode ser informado (ou complementado) no momento da resolução.
   */
  resolver(params: { tratamentoAplicado?: string | null; agora?: Date } = {}): void {
    if (params.tratamentoAplicado !== undefined && params.tratamentoAplicado !== null) {
      this.props.tratamentoAplicado = params.tratamentoAplicado;
    }
    if (this.props.resolvidoEm === null) {
      this.props.resolvidoEm = params.agora ?? new Date();
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
