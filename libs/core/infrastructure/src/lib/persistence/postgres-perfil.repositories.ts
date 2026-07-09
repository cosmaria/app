import type { Pool } from 'pg';
import type {
  PerfilPublicoRepository,
  ResultadoInsercaoPerfil,
  VinculoDePerfisRepository,
} from '@cosmaria/core-application';
import {
  type ContextoDeApp,
  PerfilPublico,
  RegistroDeVinculoDePerfis,
} from '@cosmaria/core-domain';

interface PerfilRow {
  id: string;
  usuario_id: string;
  contexto: string;
  nome_exibicao: string | null;
  avatar_url: string | null;
  biografia: string | null;
  criado_em: Date;
  atualizado_em: Date;
}

const mapearPerfil = (row: PerfilRow): PerfilPublico =>
  PerfilPublico.reconstituir({
    id: row.id,
    usuarioId: row.usuario_id,
    contexto: row.contexto as ContextoDeApp,
    nomeExibicao: row.nome_exibicao,
    avatarUrl: row.avatar_url,
    biografia: row.biografia,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
  });

const COLUNAS_PERFIL =
  'id, usuario_id, contexto, nome_exibicao, avatar_url, biografia, criado_em, atualizado_em';

/**
 * Repositório Postgres de PerfilPúblico (schema `core`, doc 08 §12.1).
 * É o banco — pela chave natural (usuario_id, contexto) — e não a aplicação que garante
 * a idempotência da criação lazy sob concorrência (doc 06, Riscos Técnicos).
 */
export class PostgresPerfilPublicoRepository implements PerfilPublicoRepository {
  constructor(private readonly pool: Pool) {}

  /**
   * `DO NOTHING RETURNING` devolve linha só para quem venceu a corrida do INSERT; quem
   * perdeu recebe zero linhas e relê o perfil já persistido. Assim duas requisições
   * concorrentes convergem para o MESMO perfilId, e o evento é publicado uma só vez.
   */
  async inserirSeNaoExistir(perfil: PerfilPublico): Promise<ResultadoInsercaoPerfil> {
    const { rows } = await this.pool.query<PerfilRow>(
      `INSERT INTO core.perfil_publico (${COLUNAS_PERFIL})
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (usuario_id, contexto) DO NOTHING
       RETURNING ${COLUNAS_PERFIL}`,
      [
        perfil.id,
        perfil.usuarioId,
        perfil.contexto,
        perfil.nomeExibicao,
        perfil.avatarUrl,
        perfil.biografia,
        perfil.criadoEm,
        perfil.atualizadoEm,
      ],
    );
    if (rows[0]) {
      return { perfil: mapearPerfil(rows[0]), criado: true };
    }

    const existente = await this.buscarPorUsuarioEContexto(perfil.usuarioId, perfil.contexto);
    if (!existente) {
      // Só chegaria aqui se a linha sumisse entre o INSERT e o SELECT (exclusão de conta).
      throw new Error('Perfil público não encontrado após conflito de inserção.');
    }
    return { perfil: existente, criado: false };
  }

  /** Edição de um perfil já existente — nunca cria linha, nunca troca o id. */
  async salvar(perfil: PerfilPublico): Promise<void> {
    await this.pool.query(
      `UPDATE core.perfil_publico
          SET nome_exibicao = $2, avatar_url = $3, biografia = $4, atualizado_em = $5
        WHERE id = $1`,
      [perfil.id, perfil.nomeExibicao, perfil.avatarUrl, perfil.biografia, perfil.atualizadoEm],
    );
  }

  async buscarPorId(id: string): Promise<PerfilPublico | null> {
    const { rows } = await this.pool.query<PerfilRow>(
      `SELECT ${COLUNAS_PERFIL} FROM core.perfil_publico WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearPerfil(rows[0]) : null;
  }

  async buscarPorUsuarioEContexto(
    usuarioId: string,
    contexto: ContextoDeApp,
  ): Promise<PerfilPublico | null> {
    const { rows } = await this.pool.query<PerfilRow>(
      `SELECT ${COLUNAS_PERFIL} FROM core.perfil_publico
        WHERE usuario_id = $1 AND contexto = $2`,
      [usuarioId, contexto],
    );
    return rows[0] ? mapearPerfil(rows[0]) : null;
  }

  async buscarPorIds(ids: string[]): Promise<PerfilPublico[]> {
    if (ids.length === 0) {
      return [];
    }
    const { rows } = await this.pool.query<PerfilRow>(
      `SELECT ${COLUNAS_PERFIL} FROM core.perfil_publico WHERE id = ANY($1::uuid[])`,
      [ids],
    );
    return rows.map(mapearPerfil);
  }

  async listarPorUsuario(usuarioId: string): Promise<PerfilPublico[]> {
    const { rows } = await this.pool.query<PerfilRow>(
      `SELECT ${COLUNAS_PERFIL} FROM core.perfil_publico
        WHERE usuario_id = $1 ORDER BY criado_em`,
      [usuarioId],
    );
    return rows.map(mapearPerfil);
  }
}

interface VinculoRow {
  id: string;
  usuario_id: string;
  perfil_ids: string[];
  visivel_em: string[];
  criado_em: Date;
  revogado_em: Date | null;
}

const mapearVinculo = (row: VinculoRow): RegistroDeVinculoDePerfis =>
  RegistroDeVinculoDePerfis.reconstituir({
    id: row.id,
    usuarioId: row.usuario_id,
    perfilIds: row.perfil_ids,
    visivelEm: row.visivel_em as ContextoDeApp[],
    criadoEm: row.criado_em,
    revogadoEm: row.revogado_em,
  });

const COLUNAS_VINCULO = 'id, usuario_id, perfil_ids, visivel_em, criado_em, revogado_em';

/** Repositório Postgres do RegistroDeVinculoDePerfis (schema `core`). */
export class PostgresVinculoDePerfisRepository implements VinculoDePerfisRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(vinculo: RegistroDeVinculoDePerfis): Promise<void> {
    await this.pool.query(
      `INSERT INTO core.registro_vinculo_perfis (${COLUNAS_VINCULO})
       VALUES ($1, $2, $3::uuid[], $4::text[], $5, $6)
       ON CONFLICT (id) DO UPDATE SET revogado_em = EXCLUDED.revogado_em`,
      [
        vinculo.id,
        vinculo.usuarioId,
        vinculo.perfilIds,
        vinculo.visivelEm,
        vinculo.criadoEm,
        vinculo.revogadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<RegistroDeVinculoDePerfis | null> {
    const { rows } = await this.pool.query<VinculoRow>(
      `SELECT ${COLUNAS_VINCULO} FROM core.registro_vinculo_perfis WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearVinculo(rows[0]) : null;
  }

  async buscarVigentePorPerfil(perfilId: string): Promise<RegistroDeVinculoDePerfis | null> {
    const { rows } = await this.pool.query<VinculoRow>(
      `SELECT ${COLUNAS_VINCULO} FROM core.registro_vinculo_perfis
        WHERE perfil_ids @> ARRAY[$1]::uuid[] AND revogado_em IS NULL
        LIMIT 1`,
      [perfilId],
    );
    return rows[0] ? mapearVinculo(rows[0]) : null;
  }

  async listarPorUsuario(usuarioId: string): Promise<RegistroDeVinculoDePerfis[]> {
    const { rows } = await this.pool.query<VinculoRow>(
      `SELECT ${COLUNAS_VINCULO} FROM core.registro_vinculo_perfis
        WHERE usuario_id = $1 ORDER BY criado_em`,
      [usuarioId],
    );
    return rows.map(mapearVinculo);
  }
}
