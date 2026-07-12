/**
 * Registro de opt-in da correlação cruzada Grow×Med (doc 00 — integração sempre opt-in).
 *
 * A IA aprende o consentimento por EVENTO (`ProdutoVinculadoALote`/`ProdutoDesvinculadoDoLote`),
 * nunca lendo o schema do Med (doc 04 §24). Guarda o conjunto de produtos vinculados por
 * usuário: enquanto houver ao menos um, a análise cruzada está habilitada. Nenhum dado clínico
 * mora aqui — só a chave do vínculo.
 */
export interface VinculoGrowMedRepository {
  registrar(usuarioId: string, produtoId: string): Promise<void>;
  remover(usuarioId: string, produtoId: string): Promise<void>;
  /** O usuário tem ao menos um vínculo ativo (habilita a correlação cruzada). */
  temVinculo(usuarioId: string): Promise<boolean>;
}

export const VINCULO_GROW_MED_REPOSITORY = Symbol('VinculoGrowMedRepository');
