import type { ContextoDeVisualizacao, Escopo } from '@cosmaria/core-domain';
import type { CompartilhamentoResumo } from '@cosmaria/core-application';

/** Referência a um conteúdo de outro módulo (por ID — doc 08, sem JOIN cross-schema). */
export interface ReferenciaDeConteudo {
  modulo: string;
  tipoConteudo: string;
  conteudoId: string;
}

/** Entrada para (re)configurar a privacidade de um conteúdo. */
export interface DefinirCompartilhamentoEntrada extends ReferenciaDeConteudo {
  autorId: string;
  escopoPadrao?: Escopo;
  dimensoes?: { codigo: string; escopo: Escopo }[];
}

/**
 * Interface pública do Motor de Privacidade (doc 04 §12 / doc 14 §10).
 * É o ÚNICO ponto pelo qual outros módulos (Comunidade, Grow, Med) configuram e
 * aplicam privacidade — dependem só deste contrato, nunca do interior do Core.
 * A implementação é fornecida pelo apps/api (composition root).
 */
export interface PrivacidadePublicApi {
  /** Cria/atualiza a configuração de compartilhamento de um conteúdo (só o autor). */
  definirCompartilhamento(entrada: DefinirCompartilhamentoEntrada): Promise<CompartilhamentoResumo>;

  /** Filtra um conteúdo (mapa dimensão → valor), devolvendo só o visível ao visualizador. */
  filtrar(
    ref: ReferenciaDeConteudo,
    contexto: ContextoDeVisualizacao,
    dados: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;

  /** Quais dimensões (dentre as candidatas) o visualizador pode ver, sem expor os dados. */
  dimensoesVisiveis(
    ref: ReferenciaDeConteudo,
    contexto: ContextoDeVisualizacao,
    dimensoes: string[],
  ): Promise<string[]>;
}

/** Token de injeção da interface pública de privacidade. */
export const PRIVACIDADE_PUBLIC_API = Symbol('PrivacidadePublicApi');
