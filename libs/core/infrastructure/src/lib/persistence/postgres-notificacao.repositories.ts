import type { Pool } from 'pg';
import type {
  NotificacaoRepository,
  PaginaDeNotificacoes,
  PreferenciaDeNotificacaoRepository,
} from '@cosmaria/core-application';
import {
  type CanalDeNotificacao,
  type CategoriaDeNotificacao,
  Notificacao,
  PreferenciaDeNotificacao,
  type StatusNotificacao,
} from '@cosmaria/core-domain';

interface PreferenciaRow {
  id: string;
  usuario_id: string;
  canais_por_categoria: Record<string, string[]> | null;
  modo_discreto: boolean;
  silencio_inicio_minutos: number | null;
  silencio_fim_minutos: number | null;
  fuso_horario: string;
  atualizado_em: Date;
}

/** Preferência de notificação no schema `core` (Arquétipo D — uma linha por Usuário). */
export class PostgresPreferenciaDeNotificacaoRepository implements PreferenciaDeNotificacaoRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(preferencia: PreferenciaDeNotificacao): Promise<void> {
    const canais = JSON.stringify(Object.fromEntries(preferencia.canaisConfigurados()));
    await this.pool.query(
      `INSERT INTO core.preferencia_de_notificacao
         (id, usuario_id, canais_por_categoria, modo_discreto, silencio_inicio_minutos,
          silencio_fim_minutos, fuso_horario, atualizado_em)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8)
       ON CONFLICT (usuario_id) DO UPDATE
         SET canais_por_categoria = EXCLUDED.canais_por_categoria,
             modo_discreto = EXCLUDED.modo_discreto,
             silencio_inicio_minutos = EXCLUDED.silencio_inicio_minutos,
             silencio_fim_minutos = EXCLUDED.silencio_fim_minutos,
             fuso_horario = EXCLUDED.fuso_horario,
             atualizado_em = EXCLUDED.atualizado_em`,
      [
        preferencia.id,
        preferencia.usuarioId,
        canais,
        preferencia.modoDiscreto,
        preferencia.silencioInicioMinutos,
        preferencia.silencioFimMinutos,
        preferencia.fusoHorario,
        preferencia.atualizadoEm,
      ],
    );
  }

  async buscarPorUsuario(usuarioId: string): Promise<PreferenciaDeNotificacao | null> {
    const { rows } = await this.pool.query<PreferenciaRow>(
      `SELECT id, usuario_id, canais_por_categoria, modo_discreto, silencio_inicio_minutos,
              silencio_fim_minutos, fuso_horario, atualizado_em
         FROM core.preferencia_de_notificacao WHERE usuario_id = $1`,
      [usuarioId],
    );
    const row = rows[0];
    if (!row) {
      return null;
    }
    const canaisPorCategoria = new Map<CategoriaDeNotificacao, CanalDeNotificacao[]>(
      Object.entries(row.canais_por_categoria ?? {}).map(([categoria, canais]) => [
        categoria as CategoriaDeNotificacao,
        canais as CanalDeNotificacao[],
      ]),
    );
    return PreferenciaDeNotificacao.reconstituir({
      id: row.id,
      usuarioId: row.usuario_id,
      canaisPorCategoria,
      modoDiscreto: row.modo_discreto,
      silencioInicioMinutos: row.silencio_inicio_minutos,
      silencioFimMinutos: row.silencio_fim_minutos,
      fusoHorario: row.fuso_horario,
      atualizadoEm: row.atualizado_em,
    });
  }
}

interface NotificacaoRow {
  id: string;
  usuario_id: string;
  categoria: string;
  titulo: string;
  corpo: string;
  titulo_discreto: string;
  corpo_discreto: string;
  status: string;
  canais_despachados: string[];
  criado_em: Date;
  lida_em: Date | null;
}

const COLUNAS =
  'id, usuario_id, categoria, titulo, corpo, titulo_discreto, corpo_discreto, status, canais_despachados, criado_em, lida_em';

const mapear = (row: NotificacaoRow): Notificacao =>
  Notificacao.reconstituir({
    id: row.id,
    usuarioId: row.usuario_id,
    categoria: row.categoria as CategoriaDeNotificacao,
    titulo: row.titulo,
    corpo: row.corpo,
    tituloDiscreto: row.titulo_discreto,
    corpoDiscreto: row.corpo_discreto,
    status: row.status as StatusNotificacao,
    canaisDespachados: row.canais_despachados as CanalDeNotificacao[],
    criadoEm: row.criado_em,
    lidaEm: row.lida_em,
  });

/** Notificações no schema `core`. Lista sempre paginada (doc 09 §5). */
export class PostgresNotificacaoRepository implements NotificacaoRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(n: Notificacao): Promise<void> {
    await this.pool.query(
      `INSERT INTO core.notificacao (${COLUNAS})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::text[],$10,$11)
       ON CONFLICT (id) DO UPDATE
         SET status = EXCLUDED.status,
             canais_despachados = EXCLUDED.canais_despachados,
             lida_em = EXCLUDED.lida_em`,
      [
        n.id,
        n.usuarioId,
        n.categoria,
        n.titulo,
        n.corpo,
        n.tituloDiscreto,
        n.corpoDiscreto,
        n.status,
        n.canaisDespachados,
        n.criadoEm,
        n.lidaEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<Notificacao | null> {
    const { rows } = await this.pool.query<NotificacaoRow>(
      `SELECT ${COLUNAS} FROM core.notificacao WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapear(rows[0]) : null;
  }

  async listarPorUsuario(
    usuarioId: string,
    parametros: { limite: number; deslocamento: number },
  ): Promise<PaginaDeNotificacoes> {
    const { rows } = await this.pool.query<NotificacaoRow>(
      `SELECT ${COLUNAS} FROM core.notificacao
        WHERE usuario_id = $1 ORDER BY criado_em DESC LIMIT $2 OFFSET $3`,
      [usuarioId, parametros.limite, parametros.deslocamento],
    );
    const contagem = await this.pool.query<{ nao_lidas: string }>(
      `SELECT count(*) AS nao_lidas FROM core.notificacao
        WHERE usuario_id = $1 AND lida_em IS NULL`,
      [usuarioId],
    );
    return {
      itens: rows.map(mapear),
      naoLidas: Number(contagem.rows[0].nao_lidas),
    };
  }
}
