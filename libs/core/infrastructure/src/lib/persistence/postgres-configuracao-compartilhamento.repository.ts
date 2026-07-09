import type { Pool } from 'pg';
import type { ConfiguracaoDeCompartilhamentoRepository } from '@cosmaria/core-application';
import { ConfiguracaoDeCompartilhamento, type Escopo } from '@cosmaria/core-domain';

interface ConfiguracaoRow {
  id: string;
  autor_id: string;
  modulo: string;
  tipo_conteudo: string;
  conteudo_id: string;
  escopo_padrao: string;
  dimensoes: Record<string, string> | null;
  criado_em: Date;
  atualizado_em: Date;
}

/**
 * Repositório Postgres da ConfiguraçãoDeCompartilhamento (schema `core`, doc 08 §12.1).
 * O mapa dimensão → escopo é persistido como JSONB. Upsert pela chave natural do
 * conteúdo (um conteúdo tem no máximo uma configuração).
 */
export class PostgresConfiguracaoCompartilhamentoRepository implements ConfiguracaoDeCompartilhamentoRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(config: ConfiguracaoDeCompartilhamento): Promise<void> {
    const dimensoes = JSON.stringify(Object.fromEntries(config.dimensoesConfiguradas()));
    await this.pool.query(
      `INSERT INTO core.configuracao_de_compartilhamento
         (id, autor_id, modulo, tipo_conteudo, conteudo_id, escopo_padrao, dimensoes, criado_em, atualizado_em)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
       ON CONFLICT (modulo, tipo_conteudo, conteudo_id) DO UPDATE
         SET escopo_padrao = EXCLUDED.escopo_padrao,
             dimensoes = EXCLUDED.dimensoes,
             atualizado_em = EXCLUDED.atualizado_em`,
      [
        config.id,
        config.autorId,
        config.modulo,
        config.tipoConteudo,
        config.conteudoId,
        config.escopoPadrao,
        dimensoes,
        config.criadoEm,
        config.atualizadoEm,
      ],
    );
  }

  async buscarPorConteudo(
    modulo: string,
    tipoConteudo: string,
    conteudoId: string,
  ): Promise<ConfiguracaoDeCompartilhamento | null> {
    const { rows } = await this.pool.query<ConfiguracaoRow>(
      `SELECT id, autor_id, modulo, tipo_conteudo, conteudo_id, escopo_padrao, dimensoes, criado_em, atualizado_em
         FROM core.configuracao_de_compartilhamento
        WHERE modulo = $1 AND tipo_conteudo = $2 AND conteudo_id = $3`,
      [modulo, tipoConteudo, conteudoId],
    );
    return rows[0] ? this.mapear(rows[0]) : null;
  }

  private mapear(row: ConfiguracaoRow): ConfiguracaoDeCompartilhamento {
    const dimensoes = new Map<string, Escopo>(
      Object.entries(row.dimensoes ?? {}).map(([codigo, escopo]) => [codigo, escopo as Escopo]),
    );
    return ConfiguracaoDeCompartilhamento.reconstituir({
      id: row.id,
      autorId: row.autor_id,
      modulo: row.modulo,
      tipoConteudo: row.tipo_conteudo,
      conteudoId: row.conteudo_id,
      escopoPadrao: row.escopo_padrao as Escopo,
      dimensoes,
      criadoEm: row.criado_em,
      atualizadoEm: row.atualizado_em,
    });
  }
}
