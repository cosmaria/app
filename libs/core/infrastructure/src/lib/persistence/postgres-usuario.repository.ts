import type { Pool } from 'pg';
import type { UsuarioRepository } from '@cosmaria/core-application';
import { Email, Papel, StatusConta, Usuario } from '@cosmaria/core-domain';

interface UsuarioRow {
  id: string;
  email: string;
  senha_hash: string;
  status: string;
  papeis: string[];
  criado_em: Date;
}

/**
 * Repositório Postgres de Usuário (schema `core`, doc 04 §16 / doc 08 §12.1).
 * Acessa APENAS o schema `core` — nunca schemas de outros módulos (doc 08 §11).
 */
export class PostgresUsuarioRepository implements UsuarioRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(usuario: Usuario): Promise<void> {
    await this.pool.query(
      `INSERT INTO core.usuario (id, email, senha_hash, status, papeis, criado_em)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE
         SET email = EXCLUDED.email,
             senha_hash = EXCLUDED.senha_hash,
             status = EXCLUDED.status,
             papeis = EXCLUDED.papeis`,
      [
        usuario.id,
        usuario.email.toString(),
        usuario.senhaHash,
        usuario.status,
        usuario.papeis,
        usuario.criadoEm,
      ],
    );
  }

  async buscarPorEmail(email: Email): Promise<Usuario | null> {
    const { rows } = await this.pool.query<UsuarioRow>(
      `SELECT id, email, senha_hash, status, papeis, criado_em FROM core.usuario WHERE email = $1`,
      [email.toString()],
    );
    return rows[0] ? this.mapear(rows[0]) : null;
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    const { rows } = await this.pool.query<UsuarioRow>(
      `SELECT id, email, senha_hash, status, papeis, criado_em FROM core.usuario WHERE id = $1`,
      [id],
    );
    return rows[0] ? this.mapear(rows[0]) : null;
  }

  async existeComEmail(email: Email): Promise<boolean> {
    const { rowCount } = await this.pool.query(`SELECT 1 FROM core.usuario WHERE email = $1`, [
      email.toString(),
    ]);
    return (rowCount ?? 0) > 0;
  }

  private mapear(row: UsuarioRow): Usuario {
    return Usuario.reconstituir({
      id: row.id,
      email: Email.criar(row.email),
      senhaHash: row.senha_hash,
      status: row.status as StatusConta,
      papeis: (row.papeis ?? []) as Papel[],
      criadoEm: row.criado_em,
    });
  }
}
