import { AcessoNegadoError } from '@cosmaria/core-domain';
import type { TipoDeGenetica } from './catalogos';

export interface GeneticaProps {
  id: string;
  /** Dono do cadastro. Genéticas são privadas até serem compartilhadas na Comunidade. */
  usuarioId: string;
  nome: string;
  tipo: TipoDeGenetica;
  /** Linhagem/breeder, quando conhecido. Texto livre do usuário — nunca traduzido. */
  linhagem: string | null;
  breeder: string | null;
  /** Características esperadas, em texto livre (doc 02 §5.1). */
  caracteristicasEsperadas: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * Genética (doc 02 §5.1, doc 08 §12.2 — Arquétipo A, praticamente estática após criada).
 *
 * É o que permite comparar cultivos diferentes da **mesma** genética (doc 02 §5.12).
 * Por isso não pode ser excluída enquanto originar plantas: apagá-la desconectaria
 * ciclos que só fazem sentido comparados entre si.
 */
export class Genetica {
  private constructor(private readonly props: GeneticaProps) {}

  static reconstituir(props: GeneticaProps): Genetica {
    return new Genetica(props);
  }

  static criar(params: {
    id: string;
    usuarioId: string;
    nome: string;
    tipo: TipoDeGenetica;
    linhagem?: string | null;
    breeder?: string | null;
    caracteristicasEsperadas?: string | null;
    criadoEm?: Date;
  }): Genetica {
    const agora = params.criadoEm ?? new Date();
    return new Genetica({
      id: params.id,
      usuarioId: params.usuarioId,
      nome: params.nome.trim(),
      tipo: params.tipo,
      linhagem: params.linhagem ?? null,
      breeder: params.breeder ?? null,
      caracteristicasEsperadas: params.caracteristicasEsperadas ?? null,
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
  get nome(): string {
    return this.props.nome;
  }
  get tipo(): TipoDeGenetica {
    return this.props.tipo;
  }
  get linhagem(): string | null {
    return this.props.linhagem;
  }
  get breeder(): string | null {
    return this.props.breeder;
  }
  get caracteristicasEsperadas(): string | null {
    return this.props.caracteristicasEsperadas;
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
      tipo?: TipoDeGenetica;
      linhagem?: string | null;
      breeder?: string | null;
      caracteristicasEsperadas?: string | null;
    },
    agora: Date = new Date(),
  ): void {
    if (campos.nome !== undefined) {
      this.props.nome = campos.nome.trim();
    }
    if (campos.tipo !== undefined) {
      this.props.tipo = campos.tipo;
    }
    if (campos.linhagem !== undefined) {
      this.props.linhagem = campos.linhagem;
    }
    if (campos.breeder !== undefined) {
      this.props.breeder = campos.breeder;
    }
    if (campos.caracteristicasEsperadas !== undefined) {
      this.props.caracteristicasEsperadas = campos.caracteristicasEsperadas;
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
