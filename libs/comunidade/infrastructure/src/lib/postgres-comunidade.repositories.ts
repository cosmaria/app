import type { Pool } from 'pg';
import { type ContextoDeApp, type Escopo } from '@cosmaria/core-domain';
import type {
  ComentarioRepository,
  ContagemDiaria,
  CurtidaRepository,
  FiltroDeBusca,
  FiltroDeFeed,
  PublicacaoComunidadeRepository,
  RegistroDeForkRepository,
  SeguimentoRepository,
  VisualizacaoDePerfilRepository,
} from '@cosmaria/comunidade-application';
import {
  Comentario,
  Curtida,
  PublicacaoComunidade,
  RegistroDeFork,
  Seguimento,
} from '@cosmaria/comunidade-domain';

// ---------------------------------------------------------------------------
// Publicação (projeção de leitura)
// ---------------------------------------------------------------------------

interface PublicacaoRow {
  id: string;
  perfil_publico_id: string;
  contexto: string;
  modulo: string;
  tipo_conteudo: string;
  conteudo_id: string;
  escopo: string;
  titulo: string | null;
  resumo: string | null;
  dimensoes: Record<string, string> | null;
  curtidas: number | string;
  comentarios: number | string;
  publicado_em: Date;
  atualizado_em: Date;
}

const COLUNAS =
  'id, perfil_publico_id, contexto, modulo, tipo_conteudo, conteudo_id, escopo, titulo, resumo, dimensoes, curtidas, comentarios, publicado_em, atualizado_em';

const mapear = (r: PublicacaoRow): PublicacaoComunidade =>
  PublicacaoComunidade.reconstituir({
    id: r.id,
    perfilPublicoId: r.perfil_publico_id,
    contexto: r.contexto as ContextoDeApp,
    referencia: { modulo: r.modulo, tipoConteudo: r.tipo_conteudo, conteudoId: r.conteudo_id },
    escopo: r.escopo as Escopo,
    titulo: r.titulo,
    resumo: r.resumo,
    dimensoes: r.dimensoes ?? {},
    curtidas: Number(r.curtidas),
    comentarios: Number(r.comentarios),
    publicadoEm: r.publicado_em,
    atualizadoEm: r.atualizado_em,
  });

/**
 * Projeção da Comunidade no schema `comunidade`. O snapshot de dimensões vira JSONB — a
 * busca estruturada consulta `dimensoes ->> chave`. Contadores são denormalizados e
 * ajustados atomicamente; o upsert de reprojeção NUNCA os sobrescreve (doc 08 §escalabilidade).
 */
export class PostgresPublicacaoComunidadeRepository implements PublicacaoComunidadeRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(p: PublicacaoComunidade): Promise<void> {
    const ref = p.referencia;
    await this.pool.query(
      `INSERT INTO comunidade.publicacao (${COLUNAS})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13,$14)
       ON CONFLICT (id) DO UPDATE
         SET escopo = EXCLUDED.escopo,
             titulo = EXCLUDED.titulo,
             resumo = EXCLUDED.resumo,
             dimensoes = EXCLUDED.dimensoes,
             atualizado_em = EXCLUDED.atualizado_em`,
      [
        p.id,
        p.perfilPublicoId,
        p.contexto,
        ref.modulo,
        ref.tipoConteudo,
        ref.conteudoId,
        p.escopo,
        p.titulo,
        p.resumo,
        JSON.stringify(p.dimensoes),
        p.curtidas,
        p.comentarios,
        p.publicadoEm,
        p.atualizadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<PublicacaoComunidade | null> {
    const { rows } = await this.pool.query<PublicacaoRow>(
      `SELECT ${COLUNAS} FROM comunidade.publicacao WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapear(rows[0]) : null;
  }

  async buscarPorReferencia(
    modulo: string,
    conteudoId: string,
  ): Promise<PublicacaoComunidade | null> {
    const { rows } = await this.pool.query<PublicacaoRow>(
      `SELECT ${COLUNAS} FROM comunidade.publicacao WHERE modulo = $1 AND conteudo_id = $2`,
      [modulo, conteudoId],
    );
    return rows[0] ? mapear(rows[0]) : null;
  }

  async listarFeed(contexto: ContextoDeApp, filtro: FiltroDeFeed): Promise<PublicacaoComunidade[]> {
    const { rows } = await this.pool.query<PublicacaoRow>(
      `SELECT ${COLUNAS} FROM comunidade.publicacao
       WHERE contexto = $1
         AND (
           escopo = 'PUBLICO'
           OR perfil_publico_id = $2
           OR (escopo = 'SEGUIDORES' AND perfil_publico_id = ANY($3))
         )
         AND ($4::timestamptz IS NULL OR publicado_em < $4)
       ORDER BY publicado_em DESC
       LIMIT $5`,
      [
        contexto,
        filtro.perfilDoVisualizador,
        filtro.seguindoPerfilIds,
        filtro.publicadasAntesDe ?? null,
        filtro.limite,
      ],
    );
    return rows.map(mapear);
  }

  async buscar(contexto: ContextoDeApp, filtro: FiltroDeBusca): Promise<PublicacaoComunidade[]> {
    const { rows } = await this.pool.query<PublicacaoRow>(
      `SELECT ${COLUNAS} FROM comunidade.publicacao
       WHERE contexto = $1
         AND (
           escopo = 'PUBLICO'
           OR perfil_publico_id = $2
           OR (escopo = 'SEGUIDORES' AND perfil_publico_id = ANY($3))
         )
         AND dimensoes ->> $4 ILIKE '%' || $5 || '%'
       ORDER BY publicado_em DESC
       LIMIT $6`,
      [
        contexto,
        filtro.perfilDoVisualizador,
        filtro.seguindoPerfilIds,
        filtro.chave,
        filtro.valor,
        filtro.limite,
      ],
    );
    return rows.map(mapear);
  }

  async ajustarCurtidas(publicacaoId: string, delta: number): Promise<void> {
    await this.pool.query(
      `UPDATE comunidade.publicacao SET curtidas = GREATEST(0, curtidas + $2) WHERE id = $1`,
      [publicacaoId, delta],
    );
  }

  async ajustarComentarios(publicacaoId: string, delta: number): Promise<void> {
    await this.pool.query(
      `UPDATE comunidade.publicacao SET comentarios = GREATEST(0, comentarios + $2) WHERE id = $1`,
      [publicacaoId, delta],
    );
  }

  async somarContadoresRecebidos(perfilPublicoId: string): Promise<{
    publicacoes: number;
    curtidas: number;
    comentarios: number;
  }> {
    const { rows } = await this.pool.query<{
      publicacoes: string;
      curtidas: string;
      comentarios: string;
    }>(
      `SELECT count(*)::int AS publicacoes,
              COALESCE(sum(curtidas), 0)::int AS curtidas,
              COALESCE(sum(comentarios), 0)::int AS comentarios
         FROM comunidade.publicacao WHERE perfil_publico_id = $1`,
      [perfilPublicoId],
    );
    return {
      publicacoes: Number(rows[0]?.publicacoes ?? 0),
      curtidas: Number(rows[0]?.curtidas ?? 0),
      comentarios: Number(rows[0]?.comentarios ?? 0),
    };
  }
}

// ---------------------------------------------------------------------------
// Seguimento
// ---------------------------------------------------------------------------

interface SeguimentoRow {
  id: string;
  seguidor_perfil_id: string;
  seguido_perfil_id: string;
  contexto: string;
  criado_em: Date;
}

export class PostgresSeguimentoRepository implements SeguimentoRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(s: Seguimento): Promise<void> {
    await this.pool.query(
      `INSERT INTO comunidade.seguimento (id, seguidor_perfil_id, seguido_perfil_id, contexto, criado_em)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (seguidor_perfil_id, seguido_perfil_id) DO NOTHING`,
      [s.id, s.seguidorPerfilId, s.seguidoPerfilId, s.contexto, s.criadoEm],
    );
  }

  async remover(seguidorPerfilId: string, seguidoPerfilId: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM comunidade.seguimento WHERE seguidor_perfil_id = $1 AND seguido_perfil_id = $2`,
      [seguidorPerfilId, seguidoPerfilId],
    );
  }

  async existe(seguidorPerfilId: string, seguidoPerfilId: string): Promise<boolean> {
    const { rowCount } = await this.pool.query(
      `SELECT 1 FROM comunidade.seguimento WHERE seguidor_perfil_id = $1 AND seguido_perfil_id = $2`,
      [seguidorPerfilId, seguidoPerfilId],
    );
    return (rowCount ?? 0) > 0;
  }

  async listarSeguidosIds(seguidorPerfilId: string): Promise<string[]> {
    const { rows } = await this.pool.query<SeguimentoRow>(
      `SELECT seguido_perfil_id FROM comunidade.seguimento WHERE seguidor_perfil_id = $1`,
      [seguidorPerfilId],
    );
    return rows.map((r) => r.seguido_perfil_id);
  }

  async contarSeguidores(perfilId: string): Promise<number> {
    const { rows } = await this.pool.query<{ n: string }>(
      `SELECT count(*)::int AS n FROM comunidade.seguimento WHERE seguido_perfil_id = $1`,
      [perfilId],
    );
    return Number(rows[0]?.n ?? 0);
  }

  async contarSeguindo(perfilId: string): Promise<number> {
    const { rows } = await this.pool.query<{ n: string }>(
      `SELECT count(*)::int AS n FROM comunidade.seguimento WHERE seguidor_perfil_id = $1`,
      [perfilId],
    );
    return Number(rows[0]?.n ?? 0);
  }
}

// ---------------------------------------------------------------------------
// Curtida
// ---------------------------------------------------------------------------

export class PostgresCurtidaRepository implements CurtidaRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(c: Curtida): Promise<void> {
    await this.pool.query(
      `INSERT INTO comunidade.curtida (id, perfil_id, publicacao_id, contexto, criado_em)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (perfil_id, publicacao_id) DO NOTHING`,
      [c.id, c.perfilId, c.publicacaoId, c.contexto, c.criadoEm],
    );
  }

  async remover(perfilId: string, publicacaoId: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM comunidade.curtida WHERE perfil_id = $1 AND publicacao_id = $2`,
      [perfilId, publicacaoId],
    );
  }

  async existe(perfilId: string, publicacaoId: string): Promise<boolean> {
    const { rowCount } = await this.pool.query(
      `SELECT 1 FROM comunidade.curtida WHERE perfil_id = $1 AND publicacao_id = $2`,
      [perfilId, publicacaoId],
    );
    return (rowCount ?? 0) > 0;
  }
}

// ---------------------------------------------------------------------------
// Comentário
// ---------------------------------------------------------------------------

interface ComentarioRow {
  id: string;
  perfil_id: string;
  publicacao_id: string;
  contexto: string;
  texto: string;
  criado_em: Date;
}

const mapearComentario = (r: ComentarioRow): Comentario =>
  Comentario.reconstituir({
    id: r.id,
    perfilId: r.perfil_id,
    publicacaoId: r.publicacao_id,
    contexto: r.contexto as ContextoDeApp,
    texto: r.texto,
    criadoEm: r.criado_em,
  });

export class PostgresComentarioRepository implements ComentarioRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(c: Comentario): Promise<void> {
    await this.pool.query(
      `INSERT INTO comunidade.comentario (id, perfil_id, publicacao_id, contexto, texto, criado_em)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [c.id, c.perfilId, c.publicacaoId, c.contexto, c.texto, c.criadoEm],
    );
  }

  async listarPorPublicacao(publicacaoId: string, limite: number): Promise<Comentario[]> {
    const { rows } = await this.pool.query<ComentarioRow>(
      `SELECT id, perfil_id, publicacao_id, contexto, texto, criado_em
         FROM comunidade.comentario
         WHERE publicacao_id = $1
         ORDER BY criado_em DESC
         LIMIT $2`,
      [publicacaoId, limite],
    );
    return rows.map(mapearComentario);
  }
}

// ---------------------------------------------------------------------------
// RegistroDeFork
// ---------------------------------------------------------------------------

export class PostgresRegistroDeForkRepository implements RegistroDeForkRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(r: RegistroDeFork): Promise<void> {
    await this.pool.query(
      `INSERT INTO comunidade.registro_de_fork
         (id, publicacao_origem_id, conteudo_origem_id, autor_original_perfil_id, forker_perfil_id, contexto, criado_em)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (forker_perfil_id, publicacao_origem_id) DO NOTHING`,
      [
        r.id,
        r.publicacaoOrigemId,
        r.conteudoOrigemId,
        r.autorOriginalPerfilId,
        r.forkerPerfilId,
        r.contexto,
        r.criadoEm,
      ],
    );
  }

  async existe(forkerPerfilId: string, publicacaoOrigemId: string): Promise<boolean> {
    const { rowCount } = await this.pool.query(
      `SELECT 1 FROM comunidade.registro_de_fork
         WHERE forker_perfil_id = $1 AND publicacao_origem_id = $2`,
      [forkerPerfilId, publicacaoOrigemId],
    );
    return (rowCount ?? 0) > 0;
  }

  async contarForksRecebidos(autorOriginalPerfilId: string): Promise<number> {
    const { rows } = await this.pool.query<{ n: string }>(
      `SELECT count(*)::int AS n FROM comunidade.registro_de_fork WHERE autor_original_perfil_id = $1`,
      [autorOriginalPerfilId],
    );
    return Number(rows[0]?.n ?? 0);
  }
}

// ---------------------------------------------------------------------------
// VisualizacaoDePerfil (contador agregado por dia)
// ---------------------------------------------------------------------------

export class PostgresVisualizacaoDePerfilRepository implements VisualizacaoDePerfilRepository {
  constructor(private readonly pool: Pool) {}

  async incrementar(perfilId: string, dia: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO comunidade.visualizacao_de_perfil (perfil_id, dia, total)
       VALUES ($1, $2, 1)
       ON CONFLICT (perfil_id, dia) DO UPDATE SET total = comunidade.visualizacao_de_perfil.total + 1`,
      [perfilId, dia],
    );
  }

  async total(perfilId: string): Promise<number> {
    const { rows } = await this.pool.query<{ n: string }>(
      `SELECT COALESCE(sum(total), 0)::int AS n FROM comunidade.visualizacao_de_perfil WHERE perfil_id = $1`,
      [perfilId],
    );
    return Number(rows[0]?.n ?? 0);
  }

  async porDia(perfilId: string, desdeDia: string): Promise<ContagemDiaria[]> {
    const { rows } = await this.pool.query<{ dia: string; total: number | string }>(
      `SELECT dia, total FROM comunidade.visualizacao_de_perfil
         WHERE perfil_id = $1 AND dia >= $2
         ORDER BY dia DESC`,
      [perfilId, desdeDia],
    );
    return rows.map((r) => ({ dia: r.dia, total: Number(r.total) }));
  }
}
