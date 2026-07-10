import type { Pool } from 'pg';
import type { PreferenciaDeComplexidadeRepository } from '@cosmaria/core-application';
import { type NivelDeComplexidade, PreferenciaDeComplexidade } from '@cosmaria/core-domain';

interface PreferenciaRow {
  id: string;
  usuario_id: string;
  nivel: string;
  campos_habilitados: string[];
  atualizado_em: Date;
}

/** PreferênciaDeComplexidade no schema `core` (Arquétipo D — uma linha por Usuário). */
export class PostgresPreferenciaDeComplexidadeRepository implements PreferenciaDeComplexidadeRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(preferencia: PreferenciaDeComplexidade): Promise<void> {
    await this.pool.query(
      `INSERT INTO core.preferencia_de_complexidade
         (id, usuario_id, nivel, campos_habilitados, atualizado_em)
       VALUES ($1, $2, $3, $4::text[], $5)
       ON CONFLICT (usuario_id) DO UPDATE
         SET nivel = EXCLUDED.nivel,
             campos_habilitados = EXCLUDED.campos_habilitados,
             atualizado_em = EXCLUDED.atualizado_em`,
      [
        preferencia.id,
        preferencia.usuarioId,
        preferencia.nivel,
        preferencia.camposHabilitados(),
        preferencia.atualizadoEm,
      ],
    );
  }

  async buscarPorUsuario(usuarioId: string): Promise<PreferenciaDeComplexidade | null> {
    const { rows } = await this.pool.query<PreferenciaRow>(
      `SELECT id, usuario_id, nivel, campos_habilitados, atualizado_em
         FROM core.preferencia_de_complexidade WHERE usuario_id = $1`,
      [usuarioId],
    );
    const row = rows[0];
    if (!row) {
      return null;
    }
    return PreferenciaDeComplexidade.reconstituir({
      id: row.id,
      usuarioId: row.usuario_id,
      nivel: row.nivel as NivelDeComplexidade,
      camposHabilitados: new Set(row.campos_habilitados),
      atualizadoEm: row.atualizado_em,
    });
  }
}
