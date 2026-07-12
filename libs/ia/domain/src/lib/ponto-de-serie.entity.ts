import type { DominioDeDado, Fator } from './catalogos';

export interface PontoDeSerieProps {
  id: string;
  usuarioId: string;
  dominio: DominioDeDado;
  fator: Fator;
  valor: number;
  /** Momento a que o dado se refere — o que alinha séries diferentes no tempo (doc 05 §11). */
  ocorridoEm: Date;
  /** ID do registro bruto de origem (Grow/Med) — rastreabilidade obrigatória (doc 05 §7.2). */
  origemId: string;
  criadoEm: Date;
}

/**
 * PontoDeSerie — a unidade da série temporal própria da IA (doc 05 §6, "Série Temporal por
 * Usuário"). O Adaptador de Ingestão normaliza cada evento de domínio de Grow/Med em um ou
 * mais pontos; o Motor de Correlação lê só daqui, nunca do schema de outro módulo (doc 04
 * §24). Append-only — a série reflete o que foi ingerido.
 */
export class PontoDeSerie {
  private constructor(private readonly props: PontoDeSerieProps) {}

  static reconstituir(props: PontoDeSerieProps): PontoDeSerie {
    return new PontoDeSerie(props);
  }

  static registrar(params: {
    id: string;
    usuarioId: string;
    dominio: DominioDeDado;
    fator: Fator;
    valor: number;
    ocorridoEm: Date;
    origemId: string;
    criadoEm?: Date;
  }): PontoDeSerie {
    return new PontoDeSerie({ ...params, criadoEm: params.criadoEm ?? new Date() });
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get dominio(): DominioDeDado {
    return this.props.dominio;
  }
  get fator(): Fator {
    return this.props.fator;
  }
  get valor(): number {
    return this.props.valor;
  }
  get ocorridoEm(): Date {
    return this.props.ocorridoEm;
  }
  get origemId(): string {
    return this.props.origemId;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
}
