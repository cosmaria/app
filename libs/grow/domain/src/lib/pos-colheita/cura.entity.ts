import { AcessoNegadoError } from '@cosmaria/core-domain';

export interface CuraProps {
  id: string;
  usuarioId: string;
  /** 1—1 com a Secagem (garantido no banco por UNIQUE). */
  secagemId: string;
  iniciadaEm: Date;
  /** Nulo enquanto a cura corre. Preenchido uma única vez, nunca desfeito. */
  finalizadaEm: Date | null;
  temperaturaC: number | null;
  umidadeRelativa: number | null;
  /** Anotações de "burping" (aberturas periódicas do pote) — texto livre. */
  burping: string | null;
  observacoes: string | null;
  criadoEm: Date;
}

/**
 * Cura (doc 02 §5.11) — etapa pós-colheita 1—1 com a Secagem.
 *
 * Estruturalmente parecida com a Secagem, mas é um **evento de domínio distinto** (doc 09
 * decidiu manter os três separados, não fundi-los num "processo pós-colheita" genérico):
 * tem timing e semântica próprios, e acrescenta o registro de "burping". `finalizar` é
 * monotônica, como na secagem.
 */
export class Cura {
  private constructor(private readonly props: CuraProps) {}

  static reconstituir(props: CuraProps): Cura {
    return new Cura(props);
  }

  static registrar(params: {
    id: string;
    usuarioId: string;
    secagemId: string;
    iniciadaEm?: Date;
    finalizadaEm?: Date | null;
    temperaturaC?: number | null;
    umidadeRelativa?: number | null;
    burping?: string | null;
    observacoes?: string | null;
    criadoEm?: Date;
  }): Cura {
    const agora = params.criadoEm ?? new Date();
    return new Cura({
      id: params.id,
      usuarioId: params.usuarioId,
      secagemId: params.secagemId,
      iniciadaEm: params.iniciadaEm ?? agora,
      finalizadaEm: params.finalizadaEm ?? null,
      temperaturaC: params.temperaturaC ?? null,
      umidadeRelativa: params.umidadeRelativa ?? null,
      burping: params.burping ?? null,
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
  get secagemId(): string {
    return this.props.secagemId;
  }
  get iniciadaEm(): Date {
    return this.props.iniciadaEm;
  }
  get finalizadaEm(): Date | null {
    return this.props.finalizadaEm;
  }
  get temperaturaC(): number | null {
    return this.props.temperaturaC;
  }
  get umidadeRelativa(): number | null {
    return this.props.umidadeRelativa;
  }
  get burping(): string | null {
    return this.props.burping;
  }
  get observacoes(): string | null {
    return this.props.observacoes;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  estaFinalizada(): boolean {
    return this.props.finalizadaEm !== null;
  }

  duracaoEmDias(): number | null {
    if (this.props.finalizadaEm === null) return null;
    return (this.props.finalizadaEm.getTime() - this.props.iniciadaEm.getTime()) / 86_400_000;
  }

  finalizar(agora: Date = new Date()): void {
    if (this.props.finalizadaEm === null) {
      this.props.finalizadaEm = agora;
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
