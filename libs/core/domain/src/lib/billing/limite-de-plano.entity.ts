import type { Plano } from './plano';

/**
 * Chaves de limite conhecidas (doc 07 §9). São **dados de configuração**, não
 * constantes de regra: o valor de cada chave vive na tabela `LimiteDePlano` e é
 * ajustável sem novo desenvolvimento (decisão consolidada #1 do doc 07).
 *
 * A lista existe só para dar nome estável ao que os módulos consultam — Grow e Med
 * citam a chave, nunca o número.
 */
export const ChavesDeLimite = {
  /** Capacidade simultânea de ambientes no Grow. Histórico NUNCA é limitado. */
  GROW_AMBIENTES_SIMULTANEOS: 'grow.ambientes_simultaneos',
} as const;

export interface LimiteDePlanoProps {
  id: string;
  chave: string;
  plano: Plano;
  /** `null` = ilimitado. Um limite ausente para um plano também significa ilimitado. */
  valor: number | null;
  vigenteDe: Date;
}

/**
 * LimiteDePlano (doc 08 §12.6 — Arquétipo D, Configuração).
 *
 * Rege exclusivamente **capacidade simultânea futura**, nunca o passado: nenhum dado já
 * registrado pelo usuário é limitado ou ocultado por causa do plano (doc 07 §9 — regra
 * ética, não só estratégica).
 */
export class LimiteDePlano {
  private constructor(private readonly props: LimiteDePlanoProps) {}

  static reconstituir(props: LimiteDePlanoProps): LimiteDePlano {
    return new LimiteDePlano(props);
  }

  static definir(params: {
    id: string;
    chave: string;
    plano: Plano;
    valor: number | null;
    vigenteDe?: Date;
  }): LimiteDePlano {
    return new LimiteDePlano({
      id: params.id,
      chave: params.chave,
      plano: params.plano,
      valor: params.valor,
      vigenteDe: params.vigenteDe ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }
  get chave(): string {
    return this.props.chave;
  }
  get plano(): Plano {
    return this.props.plano;
  }
  get valor(): number | null {
    return this.props.valor;
  }
  get vigenteDe(): Date {
    return this.props.vigenteDe;
  }

  ehIlimitado(): boolean {
    return this.props.valor === null;
  }

  /** `usoAtual` é quantos o usuário JÁ tem; a pergunta é se cabe mais um. */
  permiteMaisUm(usoAtual: number): boolean {
    return this.ehIlimitado() || usoAtual < (this.props.valor as number);
  }
}
