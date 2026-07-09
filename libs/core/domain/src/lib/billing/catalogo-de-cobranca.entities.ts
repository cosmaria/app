import type { CicloDeCobranca, Plano } from './plano';

export interface PeriodoGratuitoConfiguracaoProps {
  id: string;
  plano: Plano;
  duracaoDias: number;
  ativo: boolean;
}

/**
 * PeriodoGratuitoConfiguracao (doc 08 §12.6 — Arquétipo D, Configuração).
 * Nasce **inativo**: se e quando existir trial é decisão de negócio, não de arquitetura
 * (doc 07 §9.1). O sistema apenas garante que ativá-lo não exige desenvolvimento novo.
 */
export class PeriodoGratuitoConfiguracao {
  private constructor(private readonly props: PeriodoGratuitoConfiguracaoProps) {}

  static reconstituir(props: PeriodoGratuitoConfiguracaoProps): PeriodoGratuitoConfiguracao {
    return new PeriodoGratuitoConfiguracao(props);
  }

  get id(): string {
    return this.props.id;
  }
  get plano(): Plano {
    return this.props.plano;
  }
  get duracaoDias(): number {
    return this.props.duracaoDias;
  }
  get ativo(): boolean {
    return this.props.ativo;
  }

  estaDisponivel(): boolean {
    return this.props.ativo && this.props.duracaoDias > 0;
  }

  /** Data de término do trial contada a partir de agora. */
  calcularTermino(agora: Date = new Date()): Date {
    return new Date(agora.getTime() + this.props.duracaoDias * 24 * 60 * 60 * 1000);
  }
}

export interface PrecoRegionalProps {
  id: string;
  /** ISO-3166-1 alfa-2 (ex.: 'BR'). */
  pais: string;
  /** ISO-4217 (ex.: 'BRL'). */
  moeda: string;
  plano: Plano;
  ciclo: CicloDeCobranca;
  /** Menor unidade da moeda (centavos). Valor real é decisão comercial (doc 07 §9.1). */
  valorCentavos: number;
}

/**
 * PrecoRegional (doc 08 §12.6 — Arquétipo D, Configuração).
 * Existe para que preço por país/moeda seja configuração desde o dia 1 — nunca uma
 * migração dolorosa quando a COSMARIA sair do Brasil (doc 00: i18n desde a arquitetura).
 */
export class PrecoRegional {
  private constructor(private readonly props: PrecoRegionalProps) {}

  static reconstituir(props: PrecoRegionalProps): PrecoRegional {
    return new PrecoRegional(props);
  }

  get id(): string {
    return this.props.id;
  }
  get pais(): string {
    return this.props.pais;
  }
  get moeda(): string {
    return this.props.moeda;
  }
  get plano(): Plano {
    return this.props.plano;
  }
  get ciclo(): CicloDeCobranca {
    return this.props.ciclo;
  }
  get valorCentavos(): number {
    return this.props.valorCentavos;
  }
}
