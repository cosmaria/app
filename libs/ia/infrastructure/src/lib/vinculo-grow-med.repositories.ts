import type { Pool } from 'pg';
import type { VinculoGrowMedRepository } from '@cosmaria/ia-application';

/** Registro de opt-in Grow↔Med em memória (mesma porta do Postgres — LSP, doc 04 §4). */
export class InMemoryVinculoGrowMedRepository implements VinculoGrowMedRepository {
  private readonly porUsuario = new Map<string, Set<string>>();

  async registrar(usuarioId: string, produtoId: string): Promise<void> {
    const set = this.porUsuario.get(usuarioId) ?? new Set<string>();
    set.add(produtoId);
    this.porUsuario.set(usuarioId, set);
  }

  async remover(usuarioId: string, produtoId: string): Promise<void> {
    this.porUsuario.get(usuarioId)?.delete(produtoId);
  }

  async temVinculo(usuarioId: string): Promise<boolean> {
    return (this.porUsuario.get(usuarioId)?.size ?? 0) > 0;
  }
}

/**
 * Registro de opt-in Grow↔Med no schema `ia` (tabela `ia.vinculo_grow_med`). Guarda só a
 * chave (usuario_id, produto_id) — nenhum dado clínico. Idempotente por chave natural.
 */
export class PostgresVinculoGrowMedRepository implements VinculoGrowMedRepository {
  constructor(private readonly pool: Pool) {}

  async registrar(usuarioId: string, produtoId: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO ia.vinculo_grow_med (usuario_id, produto_id)
       VALUES ($1, $2) ON CONFLICT (usuario_id, produto_id) DO NOTHING`,
      [usuarioId, produtoId],
    );
  }

  async remover(usuarioId: string, produtoId: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM ia.vinculo_grow_med WHERE usuario_id = $1 AND produto_id = $2`,
      [usuarioId, produtoId],
    );
  }

  async temVinculo(usuarioId: string): Promise<boolean> {
    const { rowCount } = await this.pool.query(
      `SELECT 1 FROM ia.vinculo_grow_med WHERE usuario_id = $1 LIMIT 1`,
      [usuarioId],
    );
    return (rowCount ?? 0) > 0;
  }
}
