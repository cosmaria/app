import { AcessoNegadoError } from '@cosmaria/core-domain';
import { TipoDeProduto } from './catalogos';

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
   * Referência opt-in a um Lote do COSMARIA Grow (doc 03 §5.2, §11).
   *
   * **Versão 2, inerte no MVP** (doc 03 §18): a coluna existe para que o vínculo não exija
   * migração destrutiva depois, mas nenhum caso de uso do núcleo a preenche nem a lê. O
   * vínculo real (por ID + snapshot, via a interface pública do Grow — doc 04 §23) nasce
   * quando a épica de integração Grow↔Med for construída. Guardar o ID cru não acopla o
   * Med ao schema do Grow.
   */
  loteId: string | null;
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
      loteId: null,
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
    return this.props.loteId;
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

  pertenceA(usuarioId: string): boolean {
    return this.props.usuarioId === usuarioId;
  }

  garantirAutoria(usuarioId: string): void {
    if (!this.pertenceA(usuarioId)) {
      throw new AcessoNegadoError();
    }
  }
}
