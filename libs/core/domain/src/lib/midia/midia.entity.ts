import { AcessoNegadoError } from '../errors/auth.errors';

/**
 * Tipos de mídia aceitos. Lista fechada, e não "qualquer image/*": um MIME livre é um
 * vetor de upload de conteúdo executável travestido de imagem.
 */
export enum TipoDeMidia {
  IMAGEM = 'IMAGEM',
  DOCUMENTO = 'DOCUMENTO',
}

/** MIME → tipo. O que não está aqui é recusado (falha fechada). */
const MIMES_ACEITOS: Readonly<Record<string, TipoDeMidia>> = {
  'image/jpeg': TipoDeMidia.IMAGEM,
  'image/png': TipoDeMidia.IMAGEM,
  'image/webp': TipoDeMidia.IMAGEM,
  'image/heic': TipoDeMidia.IMAGEM,
  'application/pdf': TipoDeMidia.DOCUMENTO,
};

export function tipoDeMidiaDoMime(mime: string): TipoDeMidia | null {
  return MIMES_ACEITOS[mime.toLowerCase()] ?? null;
}

export interface MidiaProps {
  id: string;
  /** Dono do arquivo. Só ele lê e remove — nunca o "dono da entidade anexada". */
  usuarioId: string;
  /**
   * Referência polimórfica por (módulo, tipo de entidade, id) — mesmo espírito do
   * Padrão de Referência Cross-Módulo (doc 08 §11), sem FK entre schemas.
   * A mídia pode nascer solta (`entidadeId` nulo) e ser anexada depois.
   */
  modulo: string;
  tipoEntidade: string;
  entidadeId: string | null;
  tipo: TipoDeMidia;
  nomeArquivo: string;
  tipoConteudo: string;
  tamanhoBytes: number;
  /** Caminho no armazenamento de objetos. NUNCA é exposto ao cliente. */
  chaveDeArmazenamento: string;
  criadoEm: Date;
}

/**
 * Mídia (doc 08 §12.1 — Arquétipo B; reclassificada do Grow para o Core).
 *
 * Capacidade genérica: `Planta` (Grow) e `Tratamento`/exame (Med) anexam a MESMA
 * entidade, e nenhuma lógica de armazenamento é duplicada entre os apps.
 *
 * O binário nunca passa por aqui — a entidade só conhece a chave no armazenamento de
 * objetos (doc 04 §16). O acesso ao arquivo é sempre por URL assinada e temporária.
 */
export class Midia {
  private constructor(private readonly props: MidiaProps) {}

  static reconstituir(props: MidiaProps): Midia {
    return new Midia(props);
  }

  static registrar(params: {
    id: string;
    usuarioId: string;
    modulo: string;
    tipoEntidade: string;
    entidadeId?: string | null;
    tipo: TipoDeMidia;
    nomeArquivo: string;
    tipoConteudo: string;
    tamanhoBytes: number;
    chaveDeArmazenamento: string;
    criadoEm?: Date;
  }): Midia {
    return new Midia({
      id: params.id,
      usuarioId: params.usuarioId,
      modulo: params.modulo,
      tipoEntidade: params.tipoEntidade,
      entidadeId: params.entidadeId ?? null,
      tipo: params.tipo,
      nomeArquivo: params.nomeArquivo,
      tipoConteudo: params.tipoConteudo,
      tamanhoBytes: params.tamanhoBytes,
      chaveDeArmazenamento: params.chaveDeArmazenamento,
      criadoEm: params.criadoEm ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get modulo(): string {
    return this.props.modulo;
  }
  get tipoEntidade(): string {
    return this.props.tipoEntidade;
  }
  get entidadeId(): string | null {
    return this.props.entidadeId;
  }
  get tipo(): TipoDeMidia {
    return this.props.tipo;
  }
  get nomeArquivo(): string {
    return this.props.nomeArquivo;
  }
  get tipoConteudo(): string {
    return this.props.tipoConteudo;
  }
  get tamanhoBytes(): number {
    return this.props.tamanhoBytes;
  }
  get chaveDeArmazenamento(): string {
    return this.props.chaveDeArmazenamento;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  pertenceA(usuarioId: string): boolean {
    return this.props.usuarioId === usuarioId;
  }

  /** Só o dono lê ou remove a própria mídia. Compartilhar é papel do Motor de Privacidade. */
  garantirAutoria(usuarioId: string): void {
    if (!this.pertenceA(usuarioId)) {
      throw new AcessoNegadoError();
    }
  }

  /** Anexa (ou reanexa) a mídia a uma entidade de qualquer módulo. */
  anexarA(modulo: string, tipoEntidade: string, entidadeId: string): void {
    this.props.modulo = modulo;
    this.props.tipoEntidade = tipoEntidade;
    this.props.entidadeId = entidadeId;
  }
}
