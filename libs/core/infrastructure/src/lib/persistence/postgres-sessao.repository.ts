import type { Pool } from 'pg';
import type { SessaoRepository } from '@cosmaria/core-application';
import { SessaoDeAutenticacao } from '@cosmaria/core-domain';

interface SessaoRow {
  id: string;
  usuario_id: string;
  refresh_token_hash: string;
  expira_em: Date;
  revogada_em: Date | null;
  criado_em: Date;
}

/** Repositório Postgres de SessaoDeAutenticacao (schema `core`). */
export class PostgresSessaoRepository implements SessaoRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(sessao: SessaoDeAutenticacao): Promise<void> {
    await this.pool.query(
      `INSERT INTO core.sessao_de_autenticacao
         (id, usuario_id, refresh_token_hash, expira_em, revogada_em, criado_em)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE
         SET revogada_em = EXCLUDED.revogada_em`,
      [
        sessao.id,
        sessao.usuarioId,
        sessao.refreshTokenHash,
        sessao.expiraEm,
        sessao.revogadaEm,
        sessao.criadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<SessaoDeAutenticacao | null> {
    const { rows } = await this.pool.query<SessaoRow>(
      `SELECT id, usuario_id, refresh_token_hash, expira_em, revogada_em, criado_em
       FROM core.sessao_de_autenticacao WHERE id = $1`,
      [id],
    );
    const row = rows[0];
    if (!row) {
      return null;
    }
    return SessaoDeAutenticacao.reconstituir({
      id: row.id,
      usuarioId: row.usuario_id,
      refreshTokenHash: row.refresh_token_hash,
      expiraEm: row.expira_em,
      revogadaEm: row.revogada_em,
      criadoEm: row.criado_em,
    });
  }
}
