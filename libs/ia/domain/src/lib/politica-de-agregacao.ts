import { DominioDeDado } from './catalogos';

export interface ConfiguracaoDeAgregacao {
  /** Mínimo de usuários opt-in para um insight agregado anonimizado (k-anonimidade, doc 05 §9). */
  nMinimoCoorte: number;
  /** Mínimo de dias pareados para calcular uma correlação do histórico próprio (doc 05 §14). */
  volumeMinimoProprio: number;
}

/**
 * PoliticaDeAgregacao (doc 05 §9) — **configurável, nunca hardcoded na regra de negócio**.
 *
 * O Motor de Correlação lê estes valores em tempo de execução. Os padrões vêm do doc 05
 * (Grow=30, Med=50 para coorte; volume próprio conservador), mas o composition root pode
 * sobrescrevê-los por ambiente sem tocar no domínio. Dado de saúde (Med) é mais sensível,
 * por isso exige coorte maior.
 */
export class PoliticaDeAgregacao {
  static readonly PADRAO_GROW: ConfiguracaoDeAgregacao = {
    nMinimoCoorte: 30,
    volumeMinimoProprio: 7,
  };
  static readonly PADRAO_MED: ConfiguracaoDeAgregacao = {
    nMinimoCoorte: 50,
    volumeMinimoProprio: 7,
  };

  private constructor(
    private readonly porDominio: Record<DominioDeDado, ConfiguracaoDeAgregacao>,
  ) {}

  static padrao(): PoliticaDeAgregacao {
    return new PoliticaDeAgregacao({
      [DominioDeDado.GROW]: PoliticaDeAgregacao.PADRAO_GROW,
      [DominioDeDado.MED]: PoliticaDeAgregacao.PADRAO_MED,
    });
  }

  static de(config: Record<DominioDeDado, ConfiguracaoDeAgregacao>): PoliticaDeAgregacao {
    return new PoliticaDeAgregacao(config);
  }

  para(dominio: DominioDeDado): ConfiguracaoDeAgregacao {
    return this.porDominio[dominio];
  }

  volumeMinimoProprio(dominio: DominioDeDado): number {
    return this.porDominio[dominio].volumeMinimoProprio;
  }

  nMinimoCoorte(dominio: DominioDeDado): number {
    return this.porDominio[dominio].nMinimoCoorte;
  }
}
