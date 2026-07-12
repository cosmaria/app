import type { Pool } from 'pg';
import type { OutboxRegistro, OutboxRepository } from '@cosmaria/core-application';

interface OutboxRow {
  id: string;
  nome: string;
  payload: Record<string, unknown>;
  ocorrido_em: Date;
  pendentes: string[];
  tentativas: number;
}

const mapear = (row: OutboxRow): OutboxRegistro => ({
  id: row.id,
  nome: row.nome,
  payload: row.payload,
  ocorridoEm: row.ocorrido_em,
  pendentes: row.pendentes,
  tentativas: row.tentativas,
});

/**
 * Outbox durável no schema `core` (tabela `core.outbox`). O `pendentes` (jsonb) guarda os
 * `assinanteId` ainda não entregues; `buscarDevidos` trava as linhas com `FOR UPDATE SKIP
 * LOCKED`, deixando o despachante seguro sob múltiplas instâncias (doc 13 §16.1).
 */
export class PostgresOutboxRepository implements OutboxRepository {
  constructor(private readonly pool: Pool) {}

  async enfileirar(registro: OutboxRegistro): Promise<void> {
    await this.pool.query(
      `INSERT INTO core.outbox (id, nome, payload, ocorrido_em, pendentes, status, tentativas, proxima_em)
       VALUES ($1, $2, $3::jsonb, $4, $5::jsonb, 'PENDENTE', 0, now())`,
      [
        registro.id,
        registro.nome,
        JSON.stringify(registro.payload),
        registro.ocorridoEm,
        JSON.stringify(registro.pendentes),
      ],
    );
  }

  async buscarDevidos(limite: number, agora: Date): Promise<OutboxRegistro[]> {
    const { rows } = await this.pool.query<OutboxRow>(
      `SELECT id, nome, payload, ocorrido_em, pendentes, tentativas
         FROM core.outbox
        WHERE status = 'PENDENTE' AND proxima_em <= $1
        ORDER BY proxima_em
        LIMIT $2
        FOR UPDATE SKIP LOCKED`,
      [agora, limite],
    );
    return rows.map(mapear);
  }

  async marcarEntregue(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE core.outbox
          SET status = 'ENTREGUE', pendentes = '[]'::jsonb, entregue_em = now()
        WHERE id = $1`,
      [id],
    );
  }

  async reprogramar(
    id: string,
    pendentes: string[],
    tentativas: number,
    proximaEm: Date,
    erro: string,
  ): Promise<void> {
    await this.pool.query(
      `UPDATE core.outbox
          SET pendentes = $2::jsonb, tentativas = $3, proxima_em = $4, ultimo_erro = $5
        WHERE id = $1`,
      [id, JSON.stringify(pendentes), tentativas, proximaEm, erro],
    );
  }

  async marcarMorto(id: string, pendentes: string[], erro: string): Promise<void> {
    await this.pool.query(
      `UPDATE core.outbox
          SET status = 'MORTO', pendentes = $2::jsonb, ultimo_erro = $3
        WHERE id = $1`,
      [id, JSON.stringify(pendentes), erro],
    );
  }
}
