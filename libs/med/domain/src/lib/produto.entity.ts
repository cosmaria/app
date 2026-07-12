import { AcessoNegadoError } from '@cosmaria/core-domain';
import { TipoDeProduto } from './catalogos';

/**
 * Snapshot de um Lote do Grow copiado no ato do vínculo (doc 04 §23 — referência
 * cross-módulo por ID + snapshot). Guardar a cópia significa que o Med exibe a procedência
 * sem depender do Grow em toda leitura, e o dado sobrevive mesmo que o Lote mude/suma.
 * O formato é local ao Med (o Med não importa a public-api do Grow no domínio).
 */
export interface LoteVinculado {
  loteId: string;
  codigo: string;
  pesoSecoGramas: number;
  geradoEm: Date;
}

export interface ProdutoProps {
  id: string;
  usuarioId: string;
  /** Tratamento ao qual o produto pertence (doc 03 §11: Tratamento 1—N Produto). */
  tratamentoId: string;
  nome: string;
  tipo: TipoDeProduto;
  /** Concentração de CBD (mg/ml, mg/g ou % — texto do rótulo), quando conhecida. */
  concentracaoCbd: string | null;
  concentracaoThc: string | null;
  fabricante: string | null;
  /**
   * Vínculo opt-in a um Lote do COSMARIA Grow (doc 03 §5.2/§18, doc 00 — integração
   * Grow↔Med é SEMPRE opt-in). `null` enquanto não vinculado. O snapshot é copiado do
   * Grow via a public-api no ato do vínculo; guardar isso não acopla o Med ao schema do Grow.
   */
  loteVinculado: LoteVinculado | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * Produto (doc 03 §5.2, doc 08 — Arquétipo A).
 *
 * O que o paciente usa: nome, forma farmacêutica, concentração. É a âncora das doses
 * (RegistroDeUso) e, no futuro, do vínculo com um cultivo próprio (Grow).
 */
export class Produto {
  private constructor(private readonly props: ProdutoProps) {}

  static reconstituir(props: ProdutoProps): Produto {
    return new Produto(props);
  }

  static criar(params: {
    id: string;
    usuarioId: string;
    tratamentoId: string;
    nome: string;
    tipo: TipoDeProduto;
    concentracaoCbd?: string | null;
    concentracaoThc?: string | null;
    fabricante?: string | null;
    criadoEm?: Date;
  }): Produto {
    const agora = params.criadoEm ?? new Date();
    return new Produto({
      id: params.id,
      usuarioId: params.usuarioId,
      tratamentoId: params.tratamentoId,
      nome: params.nome.trim(),
      tipo: params.tipo,
      concentracaoCbd: params.concentracaoCbd ?? null,
      concentracaoThc: params.concentracaoThc ?? null,
      fabricante: params.fabricante ?? null,
      loteVinculado: null,
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
  get tratamentoId(): string {
    return this.props.tratamentoId;
  }
  get nome(): string {
    return this.props.nome;
  }
  get tipo(): TipoDeProduto {
    return this.props.tipo;
  }
  get concentracaoCbd(): string | null {
    return this.props.concentracaoCbd;
  }
  get concentracaoThc(): string | null {
    return this.props.concentracaoThc;
  }
  get fabricante(): string | null {
    return this.props.fabricante;
  }
  get loteId(): string | null {
    return this.props.loteVinculado?.loteId ?? null;
  }
  get loteVinculado(): LoteVinculado | null {
    return this.props.loteVinculado ? { ...this.props.loteVinculado } : null;
  }
  estaVinculadoALote(): boolean {
    return this.props.loteVinculado !== null;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  /** `undefined` = não mexer; `null` = limpar o campo. */
  atualizar(
    campos: {
      nome?: string;
      tipo?: TipoDeProduto;
      concentracaoCbd?: string | null;
      concentracaoThc?: string | null;
      fabricante?: string | null;
    },
    agora: Date = new Date(),
  ): void {
    if (campos.nome !== undefined) {
      this.props.nome = campos.nome.trim();
    }
    if (campos.tipo !== undefined) {
      this.props.tipo = campos.tipo;
    }
    if (campos.concentracaoCbd !== undefined) {
      this.props.concentracaoCbd = campos.concentracaoCbd;
    }
    if (campos.concentracaoThc !== undefined) {
      this.props.concentracaoThc = campos.concentracaoThc;
    }
    if (campos.fabricante !== undefined) {
      this.props.fabricante = campos.fabricante;
    }
    this.props.atualizadoEm = agora;
  }

  /** Vincula (ou revincula) o produto a um Lote do Grow. Idempotente para o mesmo lote. */
  vincularLote(snapshot: LoteVinculado, agora: Date = new Date()): void {
    this.props.loteVinculado = { ...snapshot };
    this.props.atualizadoEm = agora;
  }

  /** Desfaz o vínculo (opt-out). Idempotente. */
  desvincularLote(agora: Date = new Date()): void {
    if (this.props.loteVinculado === null) {
      return;
    }
    this.props.loteVinculado = null;
    this.props.atualizadoEm = agora;
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
