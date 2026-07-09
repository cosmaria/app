import type { Pool } from 'pg';
import type {
  ConsentimentoRepository,
  SolicitacaoExportacaoRepository,
  TrilhaDeAuditoriaRepository,
} from '@cosmaria/core-application';
import {
  ConsentimentoRegistro,
  SolicitacaoDeExportacao,
  type StatusExportacao,
  type TipoConsentimento,
  TrilhaDeAuditoria,
} from '@cosmaria/core-domain';

interface ConsentimentoRow {
  id: string;
  usuario_id: string;
  tipo: string;
  versao_texto: string;
  concedido_em: Date;
  revogado_em: Date | null;
}

/** Repositório Postgres de ConsentimentoRegistro (schema `core`). */
export class PostgresConsentimentoRepository implements ConsentimentoRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(registro: ConsentimentoRegistro): Promise<void> {
    await this.pool.query(
      `INSERT INTO core.consentimento_registro (id, usuario_id, tipo, versao_texto, concedido_em, revogado_em)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET revogado_em = EXCLUDED.revogado_em`,
      [
        registro.id,
        registro.usuarioId,
        registro.tipo,
        registro.versaoTexto,
        registro.concedidoEm,
        registro.revogadoEm,
      ],
    );
  }

  async listarPorUsuario(usuarioId: string): Promise<ConsentimentoRegistro[]> {
    const { rows } = await this.pool.query<ConsentimentoRow>(
      `SELECT id, usuario_id, tipo, versao_texto, concedido_em, revogado_em
         FROM core.consentimento_registro WHERE usuario_id = $1 ORDER BY concedido_em`,
      [usuarioId],
    );
    return rows.map((r) => this.mapear(r));
  }

  async buscarVigente(
    usuarioId: string,
    tipo: TipoConsentimento,
  ): Promise<ConsentimentoRegistro | null> {
    const { rows } = await this.pool.query<ConsentimentoRow>(
      `SELECT id, usuario_id, tipo, versao_texto, concedido_em, revogado_em
         FROM core.consentimento_registro
        WHERE usuario_id = $1 AND tipo = $2 AND revogado_em IS NULL
        LIMIT 1`,
      [usuarioId, tipo],
    );
    return rows[0] ? this.mapear(rows[0]) : null;
  }

  private mapear(row: ConsentimentoRow): ConsentimentoRegistro {
    return ConsentimentoRegistro.reconstituir({
      id: row.id,
      usuarioId: row.usuario_id,
      tipo: row.tipo as TipoConsentimento,
      versaoTexto: row.versao_texto,
      concedidoEm: row.concedido_em,
      revogadoEm: row.revogado_em,
    });
  }
}

interface TrilhaRow {
  id: string;
  entidade_afetada: string;
  entidade_id: string | null;
  acao: string;
  autor_id: string | null;
  detalhe: Record<string, unknown> | null;
  registrado_em: Date;
}

/** Repositório Postgres de TrilhaDeAuditoria (append-only; sobrevive à exclusão de conta). */
export class PostgresTrilhaDeAuditoriaRepository implements TrilhaDeAuditoriaRepository {
  constructor(private readonly pool: Pool) {}

  async registrar(entrada: TrilhaDeAuditoria): Promise<void> {
    await this.pool.query(
      `INSERT INTO core.trilha_de_auditoria (id, entidade_afetada, entidade_id, acao, autor_id, detalhe, registrado_em)
       VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
      [
        entrada.id,
        entrada.entidadeAfetada,
        entrada.entidadeId,
        entrada.acao,
        entrada.autorId,
        JSON.stringify(entrada.detalhe),
        entrada.registradoEm,
      ],
    );
  }

  async listar(limite: number): Promise<TrilhaDeAuditoria[]> {
    const { rows } = await this.pool.query<TrilhaRow>(
      `SELECT id, entidade_afetada, entidade_id, acao, autor_id, detalhe, registrado_em
         FROM core.trilha_de_auditoria ORDER BY registrado_em DESC LIMIT $1`,
      [limite],
    );
    return rows.map((r) =>
      TrilhaDeAuditoria.reconstituir({
        id: r.id,
        entidadeAfetada: r.entidade_afetada,
        entidadeId: r.entidade_id,
        acao: r.acao,
        autorId: r.autor_id,
        detalhe: r.detalhe ?? {},
        registradoEm: r.registrado_em,
      }),
    );
  }
}

interface ExportacaoRow {
  id: string;
  usuario_id: string;
  status: string;
  url_download: string | null;
  solicitado_em: Date;
  concluido_em: Date | null;
}

/** Repositório Postgres de SolicitacaoDeExportacao (schema `core`). */
export class PostgresSolicitacaoExportacaoRepository implements SolicitacaoExportacaoRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(solicitacao: SolicitacaoDeExportacao): Promise<void> {
    await this.pool.query(
      `INSERT INTO core.solicitacao_exportacao (id, usuario_id, status, url_download, solicitado_em, concluido_em)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE
         SET status = EXCLUDED.status,
             url_download = EXCLUDED.url_download,
             concluido_em = EXCLUDED.concluido_em`,
      [
        solicitacao.id,
        solicitacao.usuarioId,
        solicitacao.status,
        solicitacao.urlDownload,
        solicitacao.solicitadoEm,
        solicitacao.concluidoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<SolicitacaoDeExportacao | null> {
    const { rows } = await this.pool.query<ExportacaoRow>(
      `SELECT id, usuario_id, status, url_download, solicitado_em, concluido_em
         FROM core.solicitacao_exportacao WHERE id = $1`,
      [id],
    );
    const row = rows[0];
    if (!row) {
      return null;
    }
    return SolicitacaoDeExportacao.reconstituir({
      id: row.id,
      usuarioId: row.usuario_id,
      status: row.status as StatusExportacao,
      urlDownload: row.url_download,
      solicitadoEm: row.solicitado_em,
      concluidoEm: row.concluido_em,
    });
  }
}
