/**
 * Relação do visualizador com o autor do conteúdo — entrada do Motor de Privacidade
 * (doc 04 §12). Quem monta este contexto é o módulo consumidor (Comunidade, ao
 * resolver o grafo de seguimento); o Core apenas o avalia. Um amigo é sempre também
 * tratado como seguidor pela camada que monta o contexto (mútuo ⊇ unilateral).
 */
export interface ContextoDeVisualizacao {
  ehAutor: boolean;
  ehSeguidor: boolean;
  ehAmigo: boolean;
  /** O visualizador acessou via link direto (escopo LINK, Versão 2). */
  possuiLink: boolean;
}

/** Visualizador sem nenhuma relação com o autor (anônimo/público). */
export const VISUALIZADOR_ANONIMO: ContextoDeVisualizacao = {
  ehAutor: false,
  ehSeguidor: false,
  ehAmigo: false,
  possuiLink: false,
};
