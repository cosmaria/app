import { AssinaturaJaAtivaError, AssinaturaNaoPremiumError } from '../errors/billing.errors';
import { CicloDeCobranca, Plano } from './plano';
import { StatusAssinatura } from './status-assinatura';

export interface AssinaturaPremiumProps {
  id: string;
  /** 1—1 com Usuário: a assinatura pertence à Conta, nunca a um app (doc 07 §5). */
  usuarioId: string;
  plano: Plano;
  status: StatusAssinatura;
  /** Moeda ISO-4217. Nulo no plano gratuito. Valor monetário nunca vive aqui (doc 07 §9.1). */
  moeda: string | null;
  cicloDeCobranca: CicloDeCobranca | null;
  cupomId: string | null;
  precoRegionalId: string | null;
  /** Fim do período já pago (ou do trial). É o que sustenta o cancelamento gentil. */
  vigenteAte: Date | null;
  iniciadaEm: Date | null;
  canceladaEm: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * AssinaturaPremium (doc 07, doc 08 §12.6 — entidade crítica, tratamento individual).
 *
 * Uma assinatura por Conta, desbloqueando **todos** os apps de uma vez (doc 07 §5).
 * Toda conta possui uma: a gratuita é `Plano.GRATUITO` + `StatusAssinatura.ATIVA`, e
 * não é um estado degradado — é o estado normal e permanentemente útil (doc 07 §4).
 *
 * Nenhum valor monetário mora nesta entidade: preço é `PrecoRegional`, desconto é
 * `CupomOuPromocao`. Aqui só existe a *capacidade* de moeda/ciclo/plano (doc 07 §9.1).
 *
 * Toda mudança de status publica `AssinaturaAtualizada` (auditoria — doc 08 §12.6);
 * a entidade não publica eventos: quem o faz é o caso de uso, com o status anterior.
 */
export class AssinaturaPremium {
  private constructor(private readonly props: AssinaturaPremiumProps) {}

  static reconstituir(props: AssinaturaPremiumProps): AssinaturaPremium {
    return new AssinaturaPremium(props);
  }

  /** Estado inicial de toda Conta: plano gratuito, plenamente utilizável. */
  static criarGratuita(params: {
    id: string;
    usuarioId: string;
    criadoEm?: Date;
  }): AssinaturaPremium {
    const agora = params.criadoEm ?? new Date();
    return new AssinaturaPremium({
      id: params.id,
      usuarioId: params.usuarioId,
      plano: Plano.GRATUITO,
      status: StatusAssinatura.ATIVA,
      moeda: null,
      cicloDeCobranca: null,
      cupomId: null,
      precoRegionalId: null,
      vigenteAte: null,
      iniciadaEm: null,
      canceladaEm: null,
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
  get plano(): Plano {
    return this.props.plano;
  }
  get status(): StatusAssinatura {
    return this.props.status;
  }
  get moeda(): string | null {
    return this.props.moeda;
  }
  get cicloDeCobranca(): CicloDeCobranca | null {
    return this.props.cicloDeCobranca;
  }
  get cupomId(): string | null {
    return this.props.cupomId;
  }
  get precoRegionalId(): string | null {
    return this.props.precoRegionalId;
  }
  get vigenteAte(): Date | null {
    return this.props.vigenteAte;
  }
  get iniciadaEm(): Date | null {
    return this.props.iniciadaEm;
  }
  get canceladaEm(): Date | null {
    return this.props.canceladaEm;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  /**
   * O usuário tem acesso Premium AGORA?
   * - `TRIAL` e `CANCELADA` valem até `vigenteAte` — cancelar não confisca o período pago.
   * - `PENDENTE_PAGAMENTO` nunca concede Premium: o gateway ainda não confirmou.
   * - `INADIMPLENTE` suspende (tolerância a falha transitória de cartão é Versão 2).
   */
  ehPremiumAtivo(agora: Date = new Date()): boolean {
    if (this.props.plano !== Plano.PREMIUM) {
      return false;
    }
    switch (this.props.status) {
      case StatusAssinatura.ATIVA:
        return true;
      case StatusAssinatura.TRIAL:
      case StatusAssinatura.CANCELADA:
        return this.props.vigenteAte !== null && agora < this.props.vigenteAte;
      default:
        return false;
    }
  }

  /** O plano que vale para efeito de limites — nunca o plano "contratado" no papel. */
  planoEfetivo(agora: Date = new Date()): Plano {
    return this.ehPremiumAtivo(agora) ? Plano.PREMIUM : Plano.GRATUITO;
  }

  /** Registra a intenção de assinar. NÃO concede Premium (aguarda o gateway). */
  iniciarUpgrade(
    params: {
      ciclo: CicloDeCobranca;
      moeda: string;
      cupomId?: string | null;
      precoRegionalId?: string | null;
    },
    agora: Date = new Date(),
  ): void {
    if (this.ehPremiumAtivo(agora)) {
      throw new AssinaturaJaAtivaError();
    }
    this.props.plano = Plano.PREMIUM;
    this.props.status = StatusAssinatura.PENDENTE_PAGAMENTO;
    this.props.cicloDeCobranca = params.ciclo;
    this.props.moeda = params.moeda;
    this.props.cupomId = params.cupomId ?? null;
    this.props.precoRegionalId = params.precoRegionalId ?? null;
    this.props.canceladaEm = null;
    this.props.atualizadoEm = agora;
  }

  /** Concede Premium sem cobrança até `terminaEm` (PeriodoGratuitoConfiguracao). */
  iniciarTrial(
    params: { ciclo: CicloDeCobranca; moeda: string; terminaEm: Date },
    agora: Date = new Date(),
  ): void {
    if (this.ehPremiumAtivo(agora)) {
      throw new AssinaturaJaAtivaError();
    }
    this.props.plano = Plano.PREMIUM;
    this.props.status = StatusAssinatura.TRIAL;
    this.props.cicloDeCobranca = params.ciclo;
    this.props.moeda = params.moeda;
    this.props.vigenteAte = params.terminaEm;
    this.props.iniciadaEm = agora;
    this.props.canceladaEm = null;
    this.props.atualizadoEm = agora;
  }

  /** `PagamentoRecebido`: ativa (ou renova) o período pago. */
  confirmarPagamento(vigenteAte: Date, agora: Date = new Date()): void {
    this.props.plano = Plano.PREMIUM;
    this.props.status = StatusAssinatura.ATIVA;
    this.props.vigenteAte = vigenteAte;
    this.props.iniciadaEm = this.props.iniciadaEm ?? agora;
    this.props.canceladaEm = null;
    this.props.atualizadoEm = agora;
  }

  /** `PagamentoFalhou`: suspende o Premium, sem apagar nenhum dado do usuário. */
  registrarFalhaDePagamento(agora: Date = new Date()): void {
    this.props.status = StatusAssinatura.INADIMPLENTE;
    this.props.atualizadoEm = agora;
  }

  /**
   * Cancelamento gentil: o Premium continua valendo até o fim do período já pago.
   * Nenhum dado histórico é perdido — só a capacidade futura volta ao gratuito
   * (doc 07 §9, caso de teste obrigatório).
   */
  cancelar(agora: Date = new Date()): void {
    if (this.props.plano !== Plano.PREMIUM) {
      throw new AssinaturaNaoPremiumError();
    }
    this.props.status = StatusAssinatura.CANCELADA;
    this.props.canceladaEm = agora;
    this.props.atualizadoEm = agora;
  }

  /** Vincula um cupom já validado à assinatura (o desconto é aplicado pelo gateway). */
  aplicarCupom(cupomId: string, agora: Date = new Date()): void {
    if (this.props.plano !== Plano.PREMIUM) {
      throw new AssinaturaNaoPremiumError();
    }
    this.props.cupomId = cupomId;
    this.props.atualizadoEm = agora;
  }
}
