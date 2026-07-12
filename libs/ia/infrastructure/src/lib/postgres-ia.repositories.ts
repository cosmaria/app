import type { Pool } from 'pg';
import type { JanelaTemporal, PontoDeSerieRepository } from '@cosmaria/ia-application';
import { type DominioDeDado, type Fator, PontoDeSerie } from '@cosmaria/ia-domain';

interface PontoRow {
  id: string;
  usuario_id: string;
  dominio: string;
  fator: string;
  valor: string;
  ocorrido_em: Date;
  origem_id: string;
  criado_em: Date;
}

const COLUNAS = 'id, usuario_id, dominio, fator, valor, ocorrido_em, origem_id, criado_em';

const mapear = (r: PontoRow): PontoDeSerie =>
  PontoDeSerie.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    dominio: r.dominio as DominioDeDado,
    fator: r.fator as Fator,
    // NUMERIC volta como string do driver `pg`; converte na fronteira.
    valor: Number(r.valor),
    ocorridoEm: r.ocorrido_em,
    origemId: r.origem_id,
    criadoEm: r.criado_em,
  });

export class PostgresPontoDeSerieRepository implements PontoDeSerieRepository {
  constructor(private readonly pool: Pool) {}

  async salvarVarios(pontos: PontoDeSerie[]): Promise<void> {
    if (pontos.length === 0) return;
    // Um único INSERT multi-linha (append-only, sem ON CONFLICT).
    const valores: unknown[] = [];
    const linhas = pontos.map((p, i) => {
      const b = i * 8;
      valores.push(
        p.id,
        p.usuarioId,
        p.dominio,
        p.fator,
        p.valor,
        p.ocorridoEm,
        p.origemId,
        p.criadoEm,
      );
      return `($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7},$${b + 8})`;
    });
    await this.pool.query(
      `INSERT INTO ia.ponto_serie (${COLUNAS}) VALUES ${linhas.join(', ')}`,
      valores,
    );
  }

  async listarPorFator(
    usuarioId: string,
    dominio: DominioDeDado,
    fator: Fator,
    janela?: JanelaTemporal,
  ): Promise<PontoDeSerie[]> {
    const filtros = ['usuario_id = $1', 'dominio = $2', 'fator = $3'];
    const params: unknown[] = [usuarioId, dominio, fator];
    if (janela?.de) {
      params.push(janela.de);
      filtros.push(`ocorrido_em >= $${params.length}`);
    }
    if (janela?.ate) {
      params.push(janela.ate);
      filtros.push(`ocorrido_em <= $${params.length}`);
    }
    const { rows } = await this.pool.query<PontoRow>(
      `SELECT ${COLUNAS} FROM ia.ponto_serie
        WHERE ${filtros.join(' AND ')} ORDER BY ocorrido_em ASC`,
      params,
    );
    return rows.map(mapear);
  }

  async contarPorFator(usuarioId: string, dominio: DominioDeDado, fator: Fator): Promise<number> {
    const { rows } = await this.pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM ia.ponto_serie
        WHERE usuario_id = $1 AND dominio = $2 AND fator = $3`,
      [usuarioId, dominio, fator],
    );
    return Number(rows[0].total);
  }

  async ultimoPorFator(
    usuarioId: string,
    dominio: DominioDeDado,
    fator: Fator,
  ): Promise<PontoDeSerie | null> {
    const { rows } = await this.pool.query<PontoRow>(
      `SELECT ${COLUNAS} FROM ia.ponto_serie
        WHERE usuario_id = $1 AND dominio = $2 AND fator = $3
        ORDER BY ocorrido_em DESC LIMIT 1`,
      [usuarioId, dominio, fator],
    );
    return rows[0] ? mapear(rows[0]) : null;
  }
}
