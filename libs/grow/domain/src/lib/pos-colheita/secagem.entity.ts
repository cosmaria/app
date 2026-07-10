import { AcessoNegadoError } from '@cosmaria/core-domain';

export interface SecagemProps {
  id: string;
  usuarioId: string;
  /** 1—1 com a Colheita: cada colheita seca uma única vez (garantido no banco por UNIQUE). */
  colheitaId: string;
  iniciadaEm: Date;
  /** Nulo enquanto a secagem corre. Preenchido uma única vez, nunca desfeito. */
  finalizadaEm: Date | null;
  /** Condições médias do ambiente de secagem (opcionais). */
  temperaturaC: number | null;
  umidadeRelativa: number | null;
  observacoes: string | null;
  criadoEm: Date;
}

/**
 * Secagem (doc 02 §5.11) — etapa pós-colheita 1—1 com a Colheita.
 *
 * A duração sai de `iniciadaEm`→`finalizadaEm`, como no ciclo. `finalizar` é uma transição
 * **monotônica e única** (mesma forma da resolução de sanidade): a secagem terminou é um
 * fato, não uma opinião revisável. Uma correção do que se registrou não reabre a etapa.
 */
export class Secagem {
  private constructor(private readonly props: SecagemProps) {}

  static reconstituir(props: SecagemProps): Secagem {
    return new Secagem(props);
  }

  static registrar(params: {
    id: string;
    usuarioId: string;
    colheitaId: string;
    iniciadaEm?: Date;
    finalizadaEm?: Date | null;
    temperaturaC?: number | null;
    umidadeRelativa?: number | null;
    observacoes?: string | null;
    criadoEm?: Date;
  }): Secagem {
    const agora = params.criadoEm ?? new Date();
    return new Secagem({
      id: params.id,
      usuarioId: params.usuarioId,
      colheitaId: params.colheitaId,
      iniciadaEm: params.iniciadaEm ?? agora,
      finalizadaEm: params.finalizadaEm ?? null,
      temperaturaC: params.temperaturaC ?? null,
      umidadeRelativa: params.umidadeRelativa ?? null,
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
  get colheitaId(): string {
    return this.props.colheitaId;
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
  get observacoes(): string | null {
    return this.props.observacoes;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  estaFinalizada(): boolean {
    return this.props.finalizadaEm !== null;
  }

  /** Duração em dias, ou `null` enquanto a secagem ainda corre. */
  duracaoEmDias(): number | null {
    if (this.props.finalizadaEm === null) return null;
    return (this.props.finalizadaEm.getTime() - this.props.iniciadaEm.getTime()) / 86_400_000;
  }

  /** Monotônica: reaplicar não move a data original. */
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
