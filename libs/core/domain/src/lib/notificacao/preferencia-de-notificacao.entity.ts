import { CanalDeNotificacao, CategoriaDeNotificacao } from './categoria-e-canal';

export interface PreferenciaDeNotificacaoProps {
  id: string;
  usuarioId: string;
  /** Canais habilitados por categoria. Categoria ausente ⇒ canais padrão. */
  canaisPorCategoria: Map<CategoriaDeNotificacao, CanalDeNotificacao[]>;
  /**
   * Modo Discreto (doc 01 §15 — requisito de produto, não só de marca): oculta nomes
   * sensíveis (plantas, tratamentos, produtos) no **conteúdo** da notificação.
   */
  modoDiscreto: boolean;
  /** Início do horário de silêncio, em minutos desde a meia-noite local. */
  silencioInicioMinutos: number | null;
  silencioFimMinutos: number | null;
  /**
   * Fuso IANA do usuário (ex.: 'America/Sao_Paulo'). Mora aqui porque é aqui que é
   * usado — o horário de silêncio é local, não UTC. Nasce em 'UTC': supor o fuso do
   * mercado inicial seria exatamente o hardcode que o doc 00 proíbe (i18n desde a
   * arquitetura); o cliente informa o fuso real.
   */
  fusoHorario: string;
  atualizadoEm: Date;
}

/**
 * Canal padrão de uma categoria sem preferência gravada. Deliberadamente conservador:
 * tudo chega na Central (IN_APP), e só as categorias acionáveis (tarefa, alerta) saem
 * por push. Cobrança e social não invadem o usuário por padrão — coerente com o tom
 * "nunca agressivo" do doc 07 e com o princípio de confiança do doc 01.
 */
const CANAIS_PADRAO: Readonly<Record<CategoriaDeNotificacao, CanalDeNotificacao[]>> = {
  [CategoriaDeNotificacao.TAREFA]: [CanalDeNotificacao.IN_APP, CanalDeNotificacao.PUSH],
  [CategoriaDeNotificacao.ALERTA_IA]: [CanalDeNotificacao.IN_APP, CanalDeNotificacao.PUSH],
  [CategoriaDeNotificacao.SOCIAL]: [CanalDeNotificacao.IN_APP],
  [CategoriaDeNotificacao.BILLING]: [CanalDeNotificacao.IN_APP],
  [CategoriaDeNotificacao.SISTEMA]: [CanalDeNotificacao.IN_APP],
};

const MINUTOS_POR_DIA = 24 * 60;

/**
 * PreferenciaDeNotificacao (doc 08 §12.1 — Arquétipo D, uma linha por Usuário).
 * É a fonte única do que o Serviço de Notificações pode enviar: nenhum módulo decide
 * por conta própria se notifica (doc 04 §15).
 */
export class PreferenciaDeNotificacao {
  private constructor(private readonly props: PreferenciaDeNotificacaoProps) {}

  static reconstituir(props: PreferenciaDeNotificacaoProps): PreferenciaDeNotificacao {
    return new PreferenciaDeNotificacao(props);
  }

  /** Preferência padrão de uma Conta nova: sem silêncio, sem Modo Discreto. */
  static padrao(params: {
    id: string;
    usuarioId: string;
    atualizadoEm?: Date;
  }): PreferenciaDeNotificacao {
    return new PreferenciaDeNotificacao({
      id: params.id,
      usuarioId: params.usuarioId,
      canaisPorCategoria: new Map(),
      modoDiscreto: false,
      silencioInicioMinutos: null,
      silencioFimMinutos: null,
      fusoHorario: 'UTC',
      atualizadoEm: params.atualizadoEm ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get modoDiscreto(): boolean {
    return this.props.modoDiscreto;
  }
  get silencioInicioMinutos(): number | null {
    return this.props.silencioInicioMinutos;
  }
  get silencioFimMinutos(): number | null {
    return this.props.silencioFimMinutos;
  }
  get fusoHorario(): string {
    return this.props.fusoHorario;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  /** Cópia imutável do mapa categoria → canais explicitamente configurados. */
  canaisConfigurados(): ReadonlyMap<CategoriaDeNotificacao, CanalDeNotificacao[]> {
    return new Map(this.props.canaisPorCategoria);
  }

  /** Canais efetivos da categoria: o configurado, ou o padrão. IN_APP nunca sai. */
  canaisDe(categoria: CategoriaDeNotificacao): CanalDeNotificacao[] {
    const configurado = this.props.canaisPorCategoria.get(categoria);
    const canais = configurado ?? CANAIS_PADRAO[categoria];
    return canais.includes(CanalDeNotificacao.IN_APP)
      ? [...canais]
      : [CanalDeNotificacao.IN_APP, ...canais];
  }

  /**
   * Está dentro do horário de silêncio? `minutosDoDia` é a hora **local** do usuário —
   * quem sabe o fuso é a camada de aplicação, não o domínio (i18n, doc 00).
   * Trata a virada de dia (ex.: 22:00 → 07:00), em que o fim é menor que o início.
   */
  estaEmSilencio(minutosDoDia: number): boolean {
    const { silencioInicioMinutos: inicio, silencioFimMinutos: fim } = this.props;
    if (inicio === null || fim === null || inicio === fim) {
      return false;
    }
    return inicio < fim
      ? minutosDoDia >= inicio && minutosDoDia < fim
      : minutosDoDia >= inicio || minutosDoDia < fim;
  }

  definirCanais(
    categoria: CategoriaDeNotificacao,
    canais: CanalDeNotificacao[],
    agora: Date = new Date(),
  ): void {
    this.props.canaisPorCategoria.set(categoria, [...new Set(canais)]);
    this.props.atualizadoEm = agora;
  }

  definirModoDiscreto(ativo: boolean, agora: Date = new Date()): void {
    this.props.modoDiscreto = ativo;
    this.props.atualizadoEm = agora;
  }

  definirFusoHorario(fusoHorario: string, agora: Date = new Date()): void {
    this.props.fusoHorario = fusoHorario;
    this.props.atualizadoEm = agora;
  }

  /** `null` em qualquer dos dois desliga o silêncio. Valores fora do dia são rejeitados. */
  definirHorarioDeSilencio(
    inicioMinutos: number | null,
    fimMinutos: number | null,
    agora: Date = new Date(),
  ): void {
    const valido = (m: number | null): boolean =>
      m === null || (Number.isInteger(m) && m >= 0 && m < MINUTOS_POR_DIA);
    if (!valido(inicioMinutos) || !valido(fimMinutos)) {
      throw new RangeError('Horário de silêncio fora do intervalo de um dia.');
    }
    this.props.silencioInicioMinutos = inicioMinutos;
    this.props.silencioFimMinutos = fimMinutos;
    this.props.atualizadoEm = agora;
  }
}
