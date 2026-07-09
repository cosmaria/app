import type { CanalDeNotificacao, CategoriaDeNotificacao } from './categoria-e-canal';

export enum StatusNotificacao {
  /** Criada, ainda não avaliada pela política de despacho. */
  PENDENTE = 'PENDENTE',
  /** Despachada por ao menos um canal externo. */
  ENVIADA = 'ENVIADA',
  /** Registrada sem envio externo (silêncio, preferência, ou anti-spam) — doc 04 §15. */
  SILENCIADA = 'SILENCIADA',
}

export interface ConteudoDeNotificacao {
  titulo: string;
  corpo: string;
}

export interface NotificacaoProps {
  id: string;
  usuarioId: string;
  categoria: CategoriaDeNotificacao;
  titulo: string;
  corpo: string;
  /** Versões neutras, sem nomes sensíveis, usadas quando o Modo Discreto está ativo. */
  tituloDiscreto: string;
  corpoDiscreto: string;
  status: StatusNotificacao;
  canaisDespachados: CanalDeNotificacao[];
  criadoEm: Date;
  lidaEm: Date | null;
}

/**
 * Notificação (doc 04 §15).
 *
 * Entidade **descoberta na implementação**: o doc 04 exige que uma notificação
 * silenciada seja "registrada sem envio", e o doc 10 especifica a Central de
 * Notificações — nenhum dos dois é possível sem persistir a notificação. O Catálogo de
 * Domínio só tinha `PreferênciaDeNotificação`.
 *
 * Quem produz a notificação fornece **duas versões** do conteúdo: a completa e a
 * discreta. O Modo Discreto (doc 01 §15) escolhe entre elas no momento do despacho —
 * a versão sensível nunca é montada no canal errado por engano.
 */
export class Notificacao {
  private constructor(private readonly props: NotificacaoProps) {}

  static reconstituir(props: NotificacaoProps): Notificacao {
    return new Notificacao(props);
  }

  static criar(params: {
    id: string;
    usuarioId: string;
    categoria: CategoriaDeNotificacao;
    titulo: string;
    corpo: string;
    tituloDiscreto?: string;
    corpoDiscreto?: string;
    criadoEm?: Date;
  }): Notificacao {
    return new Notificacao({
      id: params.id,
      usuarioId: params.usuarioId,
      categoria: params.categoria,
      titulo: params.titulo,
      corpo: params.corpo,
      // Sem versão discreta explícita, o fallback é o título da categoria — nunca o
      // conteúdo completo, que é justamente o que o Modo Discreto quer esconder.
      tituloDiscreto: params.tituloDiscreto ?? 'COSMARIA',
      corpoDiscreto: params.corpoDiscreto ?? 'Você tem uma nova notificação.',
      status: StatusNotificacao.PENDENTE,
      canaisDespachados: [],
      criadoEm: params.criadoEm ?? new Date(),
      lidaEm: null,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get categoria(): CategoriaDeNotificacao {
    return this.props.categoria;
  }
  get titulo(): string {
    return this.props.titulo;
  }
  get corpo(): string {
    return this.props.corpo;
  }
  get tituloDiscreto(): string {
    return this.props.tituloDiscreto;
  }
  get corpoDiscreto(): string {
    return this.props.corpoDiscreto;
  }
  get status(): StatusNotificacao {
    return this.props.status;
  }
  get canaisDespachados(): CanalDeNotificacao[] {
    return [...this.props.canaisDespachados];
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get lidaEm(): Date | null {
    return this.props.lidaEm;
  }

  /** O conteúdo que pode sair, dado o Modo Discreto do usuário (doc 01 §15). */
  conteudo(modoDiscreto: boolean): ConteudoDeNotificacao {
    return modoDiscreto
      ? { titulo: this.props.tituloDiscreto, corpo: this.props.corpoDiscreto }
      : { titulo: this.props.titulo, corpo: this.props.corpo };
  }

  ehLida(): boolean {
    return this.props.lidaEm !== null;
  }

  marcarEnviada(canais: CanalDeNotificacao[]): void {
    this.props.canaisDespachados = [...canais];
    this.props.status = StatusNotificacao.ENVIADA;
  }

  /** Registrada, nunca perdida: o usuário a encontra na Central quando abrir o app. */
  marcarSilenciada(): void {
    this.props.canaisDespachados = [];
    this.props.status = StatusNotificacao.SILENCIADA;
  }

  /** Idempotente: reler não muda a data original. */
  marcarLida(agora: Date = new Date()): void {
    if (this.props.lidaEm === null) {
      this.props.lidaEm = agora;
    }
  }
}
