import { AcessoNegadoError } from '@cosmaria/core-domain';

export interface ModeloDeTratamentoProps {
  id: string;
  usuarioId: string;
  nome: string;
  /** Valores-padrão que pré-preenchem um novo tratamento (doc 03 §10 — templates Premium). */
  condicaoPadrao: string | null;
  objetivoPadrao: string | null;
  /** Rotina/observações padrão em texto livre (ex.: "1 gota sublingual à noite"). */
  notas: string | null;
  criadoEm: Date;
}

/**
 * ModeloDeTratamento (doc 03 §10, Premium).
 *
 * Template nomeado que pré-preenche um novo tratamento — distinto de duplicar um tratamento
 * existente. Espelha o `ModeloDeCiclo` do Grow: criar é gated por Premium (gate no caso de
 * uso), mas ler/remover o que já é do usuário nunca é limitado (doc 07 §9, princípio ético).
 */
export class ModeloDeTratamento {
  private constructor(private readonly props: ModeloDeTratamentoProps) {}

  static reconstituir(props: ModeloDeTratamentoProps): ModeloDeTratamento {
    return new ModeloDeTratamento(props);
  }

  static criar(params: {
    id: string;
    usuarioId: string;
    nome: string;
    condicaoPadrao?: string | null;
    objetivoPadrao?: string | null;
    notas?: string | null;
    criadoEm?: Date;
  }): ModeloDeTratamento {
    return new ModeloDeTratamento({
      id: params.id,
      usuarioId: params.usuarioId,
      nome: params.nome.trim(),
      condicaoPadrao: params.condicaoPadrao ?? null,
      objetivoPadrao: params.objetivoPadrao ?? null,
      notas: params.notas ?? null,
      criadoEm: params.criadoEm ?? new Date(),
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
  get condicaoPadrao(): string | null {
    return this.props.condicaoPadrao;
  }
  get objetivoPadrao(): string | null {
    return this.props.objetivoPadrao;
  }
  get notas(): string | null {
    return this.props.notas;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
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
