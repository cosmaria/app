import { AcessoNegadoError } from '../errors/auth.errors';
import { Escopo } from './escopo';

export interface ConfiguracaoDeCompartilhamentoProps {
  id: string;
  /** Dono do conteúdo — só ele pode alterar a configuração. */
  autorId: string;
  /** Módulo dono do conteúdo (ex.: 'grow', 'med') — referência cross-módulo por ID (doc 08). */
  modulo: string;
  tipoConteudo: string;
  conteudoId: string;
  /** Escopo aplicado a qualquer dimensão NÃO configurada explicitamente. Nasce PRIVADO. */
  escopoPadrao: Escopo;
  /** Escopo por dimensão (código da dimensão → escopo). Vocabulário registrado por módulo. */
  dimensoes: Map<string, Escopo>;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * ConfiguraçãoDeCompartilhamento (doc 04 §12, doc 08 §12.1 — Arquétipo D).
 * Entidade ÚNICA do Core: grade dimensão × escopo de um conteúdo. Nasce PRIVADA,
 * todas as dimensões OFF (doc 02 §9.1) — nada é visível até o autor configurar.
 */
export class ConfiguracaoDeCompartilhamento {
  private constructor(private readonly props: ConfiguracaoDeCompartilhamentoProps) {}

  static reconstituir(props: ConfiguracaoDeCompartilhamentoProps): ConfiguracaoDeCompartilhamento {
    return new ConfiguracaoDeCompartilhamento(props);
  }

  /** Cria a configuração de um conteúdo — PRIVADA por padrão, sem dimensões visíveis. */
  static criar(params: {
    id: string;
    autorId: string;
    modulo: string;
    tipoConteudo: string;
    conteudoId: string;
    criadoEm?: Date;
  }): ConfiguracaoDeCompartilhamento {
    const agora = params.criadoEm ?? new Date();
    return new ConfiguracaoDeCompartilhamento({
      id: params.id,
      autorId: params.autorId,
      modulo: params.modulo,
      tipoConteudo: params.tipoConteudo,
      conteudoId: params.conteudoId,
      escopoPadrao: Escopo.PRIVADO,
      dimensoes: new Map(),
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get autorId(): string {
    return this.props.autorId;
  }
  get modulo(): string {
    return this.props.modulo;
  }
  get tipoConteudo(): string {
    return this.props.tipoConteudo;
  }
  get conteudoId(): string {
    return this.props.conteudoId;
  }
  get escopoPadrao(): Escopo {
    return this.props.escopoPadrao;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  /** Cópia imutável do mapa dimensão → escopo. */
  dimensoesConfiguradas(): ReadonlyMap<string, Escopo> {
    return new Map(this.props.dimensoes);
  }

  /** Escopo efetivo de uma dimensão: o configurado, ou o escopo padrão (PRIVADO). */
  escopoDaDimensao(codigo: string): Escopo {
    return this.props.dimensoes.get(codigo) ?? this.props.escopoPadrao;
  }

  definirEscopoPadrao(escopo: Escopo, agora: Date = new Date()): void {
    this.props.escopoPadrao = escopo;
    this.props.atualizadoEm = agora;
  }

  definirDimensao(codigo: string, escopo: Escopo, agora: Date = new Date()): void {
    this.props.dimensoes.set(codigo, escopo);
    this.props.atualizadoEm = agora;
  }

  pertenceA(usuarioId: string): boolean {
    return this.props.autorId === usuarioId;
  }

  /** Garante que quem está alterando é o autor — senão, acesso negado (RBAC/posse). */
  garantirAutoria(usuarioId: string): void {
    if (!this.pertenceA(usuarioId)) {
      throw new AcessoNegadoError();
    }
  }
}
