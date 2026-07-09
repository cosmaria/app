import type { Pool } from 'pg';
import type {
  AssinaturaRepository,
  CatalogoDeCobrancaRepository,
  CupomRepository,
  LimiteDePlanoRepository,
} from '@cosmaria/core-application';
import {
  AssinaturaPremium,
  type CicloDeCobranca,
  CupomOuPromocao,
  LimiteDePlano,
  PeriodoGratuitoConfiguracao,
  type Plano,
  PrecoRegional,
  type StatusAssinatura,
  type TipoDeDesconto,
} from '@cosmaria/core-domain';

interface AssinaturaRow {
  id: string;
  usuario_id: string;
  plano: string;
  status: string;
  moeda: string | null;
  ciclo_de_cobranca: string | null;
  cupom_id: string | null;
  preco_regional_id: string | null;
  vigente_ate: Date | null;
  iniciada_em: Date | null;
  cancelada_em: Date | null;
  criado_em: Date;
  atualizado_em: Date;
}

const COLUNAS_ASSINATURA =
  'id, usuario_id, plano, status, moeda, ciclo_de_cobranca, cupom_id, preco_regional_id, vigente_ate, iniciada_em, cancelada_em, criado_em, atualizado_em';

/**
 * Repositório Postgres da AssinaturaPremium (schema `core`, doc 08 §12.6).
 * O upsert é pela chave natural `usuario_id` (UNIQUE): sob concorrência, a criação lazy
 * da assinatura gratuita converge para uma única linha — o caso de uso relê depois.
 */
export class PostgresAssinaturaRepository implements AssinaturaRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(a: AssinaturaPremium): Promise<void> {
    await this.pool.query(
      `INSERT INTO core.assinatura_premium (${COLUNAS_ASSINATURA})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       ON CONFLICT (usuario_id) DO UPDATE
         SET plano = EXCLUDED.plano,
             status = EXCLUDED.status,
             moeda = EXCLUDED.moeda,
             ciclo_de_cobranca = EXCLUDED.ciclo_de_cobranca,
             cupom_id = EXCLUDED.cupom_id,
             preco_regional_id = EXCLUDED.preco_regional_id,
             vigente_ate = EXCLUDED.vigente_ate,
             iniciada_em = EXCLUDED.iniciada_em,
             cancelada_em = EXCLUDED.cancelada_em,
             atualizado_em = EXCLUDED.atualizado_em`,
      [
        a.id,
        a.usuarioId,
        a.plano,
        a.status,
        a.moeda,
        a.cicloDeCobranca,
        a.cupomId,
        a.precoRegionalId,
        a.vigenteAte,
        a.iniciadaEm,
        a.canceladaEm,
        a.criadoEm,
        a.atualizadoEm,
      ],
    );
  }

  async buscarPorUsuario(usuarioId: string): Promise<AssinaturaPremium | null> {
    const { rows } = await this.pool.query<AssinaturaRow>(
      `SELECT ${COLUNAS_ASSINATURA} FROM core.assinatura_premium WHERE usuario_id = $1`,
      [usuarioId],
    );
    const row = rows[0];
    if (!row) {
      return null;
    }
    return AssinaturaPremium.reconstituir({
      id: row.id,
      usuarioId: row.usuario_id,
      plano: row.plano as Plano,
      status: row.status as StatusAssinatura,
      moeda: row.moeda,
      cicloDeCobranca: row.ciclo_de_cobranca as CicloDeCobranca | null,
      cupomId: row.cupom_id,
      precoRegionalId: row.preco_regional_id,
      vigenteAte: row.vigente_ate,
      iniciadaEm: row.iniciada_em,
      canceladaEm: row.cancelada_em,
      criadoEm: row.criado_em,
      atualizadoEm: row.atualizado_em,
    });
  }
}

interface LimiteRow {
  id: string;
  chave: string;
  plano: string;
  valor: number | null;
  vigente_de: Date;
}

const mapearLimite = (row: LimiteRow): LimiteDePlano =>
  LimiteDePlano.reconstituir({
    id: row.id,
    chave: row.chave,
    plano: row.plano as Plano,
    valor: row.valor,
    vigenteDe: row.vigente_de,
  });

/** LimiteDePlano é configuração: só leitura em runtime; escrita é migration/admin. */
export class PostgresLimiteDePlanoRepository implements LimiteDePlanoRepository {
  constructor(private readonly pool: Pool) {}

  async buscar(plano: Plano, chave: string): Promise<LimiteDePlano | null> {
    const { rows } = await this.pool.query<LimiteRow>(
      `SELECT id, chave, plano, valor, vigente_de FROM core.limite_de_plano
        WHERE plano = $1 AND chave = $2 AND vigente_de <= now()`,
      [plano, chave],
    );
    return rows[0] ? mapearLimite(rows[0]) : null;
  }

  async listarPorPlano(plano: Plano): Promise<LimiteDePlano[]> {
    const { rows } = await this.pool.query<LimiteRow>(
      `SELECT id, chave, plano, valor, vigente_de FROM core.limite_de_plano
        WHERE plano = $1 AND vigente_de <= now() ORDER BY chave`,
      [plano],
    );
    return rows.map(mapearLimite);
  }
}

interface CupomRow {
  id: string;
  codigo: string;
  tipo_de_desconto: string;
  valor: number;
  moeda: string | null;
  valido_de: Date;
  valido_ate: Date | null;
  usos_maximos: number | null;
  usos_realizados: number;
  ativo: boolean;
}

export class PostgresCupomRepository implements CupomRepository {
  constructor(private readonly pool: Pool) {}

  async buscarPorCodigo(codigo: string): Promise<CupomOuPromocao | null> {
    const { rows } = await this.pool.query<CupomRow>(
      `SELECT id, codigo, tipo_de_desconto, valor, moeda, valido_de, valido_ate,
              usos_maximos, usos_realizados, ativo
         FROM core.cupom_ou_promocao WHERE codigo = $1`,
      [codigo],
    );
    const row = rows[0];
    if (!row) {
      return null;
    }
    return CupomOuPromocao.reconstituir({
      id: row.id,
      codigo: row.codigo,
      tipoDeDesconto: row.tipo_de_desconto as TipoDeDesconto,
      valor: row.valor,
      moeda: row.moeda,
      validoDe: row.valido_de,
      validoAte: row.valido_ate,
      usosMaximos: row.usos_maximos,
      usosRealizados: row.usos_realizados,
      ativo: row.ativo,
    });
  }

  async salvar(cupom: CupomOuPromocao): Promise<void> {
    await this.pool.query(
      `INSERT INTO core.cupom_ou_promocao
         (id, codigo, tipo_de_desconto, valor, moeda, valido_de, valido_ate, usos_maximos, usos_realizados, ativo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE
         SET usos_realizados = EXCLUDED.usos_realizados,
             ativo = EXCLUDED.ativo`,
      [
        cupom.id,
        cupom.codigo,
        cupom.tipoDeDesconto,
        cupom.valor,
        cupom.moeda,
        cupom.validoDe,
        cupom.validoAte,
        cupom.usosMaximos,
        cupom.usosRealizados,
        cupom.ativo,
      ],
    );
  }
}

interface PeriodoRow {
  id: string;
  plano: string;
  duracao_dias: number;
  ativo: boolean;
}

interface PrecoRow {
  id: string;
  pais: string;
  moeda: string;
  plano: string;
  ciclo: string;
  valor_centavos: number;
}

export class PostgresCatalogoDeCobrancaRepository implements CatalogoDeCobrancaRepository {
  constructor(private readonly pool: Pool) {}

  async buscarPeriodoGratuito(plano: Plano): Promise<PeriodoGratuitoConfiguracao | null> {
    const { rows } = await this.pool.query<PeriodoRow>(
      `SELECT id, plano, duracao_dias, ativo FROM core.periodo_gratuito_configuracao
        WHERE plano = $1`,
      [plano],
    );
    const row = rows[0];
    return row
      ? PeriodoGratuitoConfiguracao.reconstituir({
          id: row.id,
          plano: row.plano as Plano,
          duracaoDias: row.duracao_dias,
          ativo: row.ativo,
        })
      : null;
  }

  async buscarPrecoRegional(
    pais: string,
    plano: Plano,
    ciclo: CicloDeCobranca,
  ): Promise<PrecoRegional | null> {
    const { rows } = await this.pool.query<PrecoRow>(
      `SELECT id, pais, moeda, plano, ciclo, valor_centavos FROM core.preco_regional
        WHERE pais = $1 AND plano = $2 AND ciclo = $3`,
      [pais, plano, ciclo],
    );
    const row = rows[0];
    return row
      ? PrecoRegional.reconstituir({
          id: row.id,
          pais: row.pais,
          moeda: row.moeda,
          plano: row.plano as Plano,
          ciclo: row.ciclo as CicloDeCobranca,
          valorCentavos: row.valor_centavos,
        })
      : null;
  }
}
