import { AcessoNegadoError } from '@cosmaria/core-domain';

export interface LoteProps {
  id: string;
  usuarioId: string;
  /** 1—1 com a Cura (garantido no banco por UNIQUE). Fecha o fluxo pós-colheita. */
  curaId: string;
  /** Código/apelido do lote dado pelo usuário (ex.: "OG-2026-01"). Texto livre. */
  codigo: string;
  /** Rendimento final: peso seco total do lote, em gramas. */
  pesoSecoGramas: number;
  observacoes: string | null;
  geradoEm: Date;
}

/**
 * Lote (doc 02 §5.11/§12.2, doc 08 — entidade crítica) — unidade terminal do fluxo
 * Colheita → Secagem → Cura → **Lote**. Carrega o rendimento seco final.
 *
 * **Decisão (Grow-4):** o Lote é tratado como entidade **pura do Grow**. A futura
 * referência opt-in a partir do COSMARIA Med (`ProdutoVinculadoALote`, doc 03/09) não é
 * modelada aqui: quando o Med existir, ele lerá o Lote por **ID + snapshot** através da
 * public-api do Grow (regra cross-módulo, doc 08 §11), e o evento de vínculo nascerá no
 * próprio Med. Nada neste agregado precisa mudar para isso acontecer — nenhuma migração
 * destrutiva, nenhum acoplamento especulativo a um módulo que ainda não existe.
 */
export class Lote {
  private constructor(private readonly props: LoteProps) {}

  static reconstituir(props: LoteProps): Lote {
    return new Lote(props);
  }

  static gerar(params: {
    id: string;
    usuarioId: string;
    curaId: string;
    codigo: string;
    pesoSecoGramas: number;
    observacoes?: string | null;
    geradoEm?: Date;
  }): Lote {
    return new Lote({
      id: params.id,
      usuarioId: params.usuarioId,
      curaId: params.curaId,
      codigo: params.codigo.trim(),
      pesoSecoGramas: params.pesoSecoGramas,
      observacoes: params.observacoes ?? null,
      geradoEm: params.geradoEm ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get curaId(): string {
    return this.props.curaId;
  }
  get codigo(): string {
    return this.props.codigo;
  }
  get pesoSecoGramas(): number {
    return this.props.pesoSecoGramas;
  }
  get observacoes(): string | null {
    return this.props.observacoes;
  }
  get geradoEm(): Date {
    return this.props.geradoEm;
  }

  /** Rendimento por planta, em gramas — derivado do número de plantas da colheita de origem. */
  gramasPorPlanta(quantidadeDePlantas: number): number | null {
    if (quantidadeDePlantas <= 0) return null;
    return this.props.pesoSecoGramas / quantidadeDePlantas;
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
