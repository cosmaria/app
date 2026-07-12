import {
  ContextoDeApp,
  Escopo,
  MotorDePrivacidade,
  type ContextoDeVisualizacao,
} from '@cosmaria/core-domain';

/**
 * Referência a um conteúdo de Grow ou Med (por ID — doc 08, sem JOIN cross-schema).
 * A Comunidade nunca abre esse conteúdo: guarda só a referência e o snapshot publicado.
 */
export interface ReferenciaDeConteudo {
  modulo: string;
  tipoConteudo: string;
  conteudoId: string;
}

export interface PublicacaoComunidadeProps {
  id: string;
  /** Perfil Público (do contexto) que publicou — NUNCA a Conta/usuarioId (doc 06 §13). */
  perfilPublicoId: string;
  contexto: ContextoDeApp;
  referencia: ReferenciaDeConteudo;
  escopo: Escopo;
  titulo: string | null;
  resumo: string | null;
  /**
   * Parâmetros técnicos que o autor escolheu compartilhar (genética/LED/fertilizante no
   * Grow; produto/sintoma/concentração no Med). É o que a busca estruturada indexa
   * (doc 06 §7.1) — chave→valor, sempre em texto, sem dado sensível não autorizado.
   */
  dimensoes: Record<string, string>;
  /** Contadores denormalizados (doc 08 §escalabilidade) — nunca COUNT por item no feed. */
  curtidas: number;
  comentarios: number;
  publicadoEm: Date;
  atualizadoEm: Date;
}

/**
 * PublicaçãoComunidade (doc 06 §12 — projeção de leitura alimentada por eventos, doc 04 §9.1).
 *
 * A Comunidade NÃO possui o conteúdo: Grow e Med o publicam via evento (`GrowlogPublicado` /
 * `PublicacaoComunidadeMedCriada`) já com o Perfil Público resolvido e o escopo escolhido.
 * Esta entidade é o registro projetado desse evento — o que o feed e a busca leem, escopado
 * por contexto (Grow e Med nunca se misturam, doc 06 §2).
 *
 * O `escopo` decide se a publicação aparece para um dado visualizador; a fonte de verdade da
 * regra é o `MotorDePrivacidade` do Core, nunca reimplementada aqui.
 */
export class PublicacaoComunidade {
  private constructor(private readonly props: PublicacaoComunidadeProps) {}

  static reconstituir(props: PublicacaoComunidadeProps): PublicacaoComunidade {
    return new PublicacaoComunidade(props);
  }

  static criar(params: {
    id: string;
    perfilPublicoId: string;
    contexto: ContextoDeApp;
    referencia: ReferenciaDeConteudo;
    escopo: Escopo;
    titulo?: string | null;
    resumo?: string | null;
    dimensoes?: Record<string, string>;
    publicadoEm?: Date;
  }): PublicacaoComunidade {
    const agora = params.publicadoEm ?? new Date();
    return new PublicacaoComunidade({
      id: params.id,
      perfilPublicoId: params.perfilPublicoId,
      contexto: params.contexto,
      referencia: params.referencia,
      escopo: params.escopo,
      titulo: params.titulo ?? null,
      resumo: params.resumo ?? null,
      dimensoes: params.dimensoes ?? {},
      curtidas: 0,
      comentarios: 0,
      publicadoEm: agora,
      atualizadoEm: agora,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get perfilPublicoId(): string {
    return this.props.perfilPublicoId;
  }
  get contexto(): ContextoDeApp {
    return this.props.contexto;
  }
  get referencia(): ReferenciaDeConteudo {
    return { ...this.props.referencia };
  }
  get escopo(): Escopo {
    return this.props.escopo;
  }
  get titulo(): string | null {
    return this.props.titulo;
  }
  get resumo(): string | null {
    return this.props.resumo;
  }
  get dimensoes(): Record<string, string> {
    return { ...this.props.dimensoes };
  }
  get curtidas(): number {
    return this.props.curtidas;
  }
  get comentarios(): number {
    return this.props.comentarios;
  }
  get publicadoEm(): Date {
    return this.props.publicadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  /**
   * Reprojeta a publicação a partir de uma nova versão do conteúdo
   * (`ConteudoCompartilhadoAtualizado`). Mantém id/perfil/referência; atualiza o resto.
   */
  atualizarConteudo(
    campos: {
      escopo?: Escopo;
      titulo?: string | null;
      resumo?: string | null;
      dimensoes?: Record<string, string>;
    },
    agora: Date = new Date(),
  ): void {
    if (campos.escopo !== undefined) {
      this.props.escopo = campos.escopo;
    }
    if (campos.titulo !== undefined) {
      this.props.titulo = campos.titulo;
    }
    if (campos.resumo !== undefined) {
      this.props.resumo = campos.resumo;
    }
    if (campos.dimensoes !== undefined) {
      this.props.dimensoes = campos.dimensoes;
    }
    this.props.atualizadoEm = agora;
  }

  /** Ajusta o contador de curtidas (nunca abaixo de zero). Usado pela projeção em memória. */
  ajustarCurtidas(delta: number): void {
    this.props.curtidas = Math.max(0, this.props.curtidas + delta);
  }

  /** Ajusta o contador de comentários (nunca abaixo de zero). */
  ajustarComentarios(delta: number): void {
    this.props.comentarios = Math.max(0, this.props.comentarios + delta);
  }

  publicadoPor(perfilPublicoId: string): boolean {
    return this.props.perfilPublicoId === perfilPublicoId;
  }

  /**
   * A publicação é visível a este visualizador? Delega a decisão de escopo ao Motor de
   * Privacidade do Core — o autor sempre vê a própria; estranhos veem só PUBLICO; o
   * contexto de seguidor é montado por quem chama (grafo social, doc 06 §12).
   */
  visivelPara(ctx: ContextoDeVisualizacao): boolean {
    return MotorDePrivacidade.escopoPermite(this.props.escopo, ctx);
  }
}
