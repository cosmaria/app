import type { Pool } from 'pg';
import type { MidiaRepository } from '@cosmaria/core-application';
import { Midia, type TipoDeMidia } from '@cosmaria/core-domain';

interface MidiaRow {
  id: string;
  usuario_id: string;
  modulo: string;
  tipo_entidade: string;
  entidade_id: string | null;
  tipo: string;
  nome_arquivo: string;
  tipo_conteudo: string;
  tamanho_bytes: string | number;
  chave_de_armazenamento: string;
  criado_em: Date;
}

const COLUNAS =
  'id, usuario_id, modulo, tipo_entidade, entidade_id, tipo, nome_arquivo, tipo_conteudo, tamanho_bytes, chave_de_armazenamento, criado_em';

const mapear = (row: MidiaRow): Midia =>
  Midia.reconstituir({
    id: row.id,
    usuarioId: row.usuario_id,
    modulo: row.modulo,
    tipoEntidade: row.tipo_entidade,
    entidadeId: row.entidade_id,
    tipo: row.tipo as TipoDeMidia,
    nomeArquivo: row.nome_arquivo,
    tipoConteudo: row.tipo_conteudo,
    // BIGINT volta como string no driver pg — converter evita comparação de string.
    tamanhoBytes: Number(row.tamanho_bytes),
    chaveDeArmazenamento: row.chave_de_armazenamento,
    criadoEm: row.criado_em,
  });

/** Repositório Postgres de Mídia (schema `core`, doc 08 §12.1 — Arquétipo B). */
export class PostgresMidiaRepository implements MidiaRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(midia: Midia): Promise<void> {
    await this.pool.query(
      `INSERT INTO core.midia (${COLUNAS})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE
         SET modulo = EXCLUDED.modulo,
             tipo_entidade = EXCLUDED.tipo_entidade,
             entidade_id = EXCLUDED.entidade_id`,
      [
        midia.id,
        midia.usuarioId,
        midia.modulo,
        midia.tipoEntidade,
        midia.entidadeId,
        midia.tipo,
        midia.nomeArquivo,
        midia.tipoConteudo,
        midia.tamanhoBytes,
        midia.chaveDeArmazenamento,
        midia.criadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<Midia | null> {
    const { rows } = await this.pool.query<MidiaRow>(
      `SELECT ${COLUNAS} FROM core.midia WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapear(rows[0]) : null;
  }

  async listarPorEntidade(
    modulo: string,
    tipoEntidade: string,
    entidadeId: string,
  ): Promise<Midia[]> {
    const { rows } = await this.pool.query<MidiaRow>(
      `SELECT ${COLUNAS} FROM core.midia
        WHERE modulo = $1 AND tipo_entidade = $2 AND entidade_id = $3
        ORDER BY criado_em`,
      [modulo, tipoEntidade, entidadeId],
    );
    return rows.map(mapear);
  }

  async remover(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM core.midia WHERE id = $1`, [id]);
  }
}
