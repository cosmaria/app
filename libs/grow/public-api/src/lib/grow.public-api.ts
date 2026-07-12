/**
 * Snapshot de um Lote do Grow (doc 04 §23 — referência cross-módulo por ID + snapshot).
 * É o mínimo que o Med precisa para exibir a procedência de um produto vinculado, sem
 * nunca ler o schema do Grow. Sempre em tipos primitivos (contrato de fronteira).
 */
export interface LoteSnapshot {
  loteId: string;
  codigo: string;
  pesoSecoGramas: number;
  geradoEm: string;
}

/**
 * Interface pública do COSMARIA Grow (doc 06/doc 14 §10) — a PRIMEIRA do Grow.
 *
 * É o único ponto pelo qual outro módulo (o Med, na integração opt-in Grow↔Med) resolve
 * um Lote. Deliberadamente estreita (ISP, doc 04 §4): só devolve o snapshot de um Lote que
 * pertence ao usuário, e nada mais do interior do Grow. A implementação é fornecida pelo
 * apps/api (composition root), sobre o LoteRepository.
 */
export interface GrowPublicApi {
  /** Snapshot do Lote se ele existir E pertencer ao usuário; senão `null`. */
  obterLoteSnapshot(usuarioId: string, loteId: string): Promise<LoteSnapshot | null>;
}

/** Token de injeção da interface pública do Grow. */
export const GROW_PUBLIC_API = Symbol('GrowPublicApi');
