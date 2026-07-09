import { CupomInvalidoError } from '../errors/billing.errors';

/** Como o desconto é expresso. O **valor** é configuração comercial (doc 07 §9.1). */
export enum TipoDeDesconto {
  PERCENTUAL = 'PERCENTUAL',
  VALOR_FIXO = 'VALOR_FIXO',
}

export interface CupomOuPromocaoProps {
  id: string;
  /** Código digitado pelo usuário — comparado sempre em caixa alta. */
  codigo: string;
  tipoDeDesconto: TipoDeDesconto;
  /** Percentual (0–100) ou valor fixo na menor unidade da moeda (ex.: centavos). */
  valor: number;
  moeda: string | null;
  validoDe: Date;
  validoAte: Date | null;
  /** `null` = sem teto de usos. */
  usosMaximos: number | null;
  usosRealizados: number;
  ativo: boolean;
}

/**
 * CupomOuPromocao (doc 08 §12.6 — Arquétipo D, Configuração).
 * A arquitetura suporta cupons desde o MVP; se e quando existir uma campanha real é
 * decisão comercial, fora deste documento (doc 07 §9.1, separação das três camadas).
 */
export class CupomOuPromocao {
  private constructor(private readonly props: CupomOuPromocaoProps) {}

  static reconstituir(props: CupomOuPromocaoProps): CupomOuPromocao {
    return new CupomOuPromocao(props);
  }

  static criar(params: {
    id: string;
    codigo: string;
    tipoDeDesconto: TipoDeDesconto;
    valor: number;
    moeda?: string | null;
    validoDe?: Date;
    validoAte?: Date | null;
    usosMaximos?: number | null;
  }): CupomOuPromocao {
    return new CupomOuPromocao({
      id: params.id,
      codigo: params.codigo.trim().toUpperCase(),
      tipoDeDesconto: params.tipoDeDesconto,
      valor: params.valor,
      moeda: params.moeda ?? null,
      validoDe: params.validoDe ?? new Date(),
      validoAte: params.validoAte ?? null,
      usosMaximos: params.usosMaximos ?? null,
      usosRealizados: 0,
      ativo: true,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get codigo(): string {
    return this.props.codigo;
  }
  get tipoDeDesconto(): TipoDeDesconto {
    return this.props.tipoDeDesconto;
  }
  get valor(): number {
    return this.props.valor;
  }
  get moeda(): string | null {
    return this.props.moeda;
  }
  get validoDe(): Date {
    return this.props.validoDe;
  }
  get validoAte(): Date | null {
    return this.props.validoAte;
  }
  get usosMaximos(): number | null {
    return this.props.usosMaximos;
  }
  get usosRealizados(): number {
    return this.props.usosRealizados;
  }
  get ativo(): boolean {
    return this.props.ativo;
  }

  estaValido(agora: Date = new Date()): boolean {
    if (!this.props.ativo || agora < this.props.validoDe) {
      return false;
    }
    if (this.props.validoAte !== null && agora > this.props.validoAte) {
      return false;
    }
    return this.props.usosMaximos === null || this.props.usosRealizados < this.props.usosMaximos;
  }

  /** Consome um uso. Lança se o cupom não estiver mais válido (corrida de esgotamento). */
  registrarUso(agora: Date = new Date()): void {
    if (!this.estaValido(agora)) {
      throw new CupomInvalidoError();
    }
    this.props.usosRealizados += 1;
  }
}
