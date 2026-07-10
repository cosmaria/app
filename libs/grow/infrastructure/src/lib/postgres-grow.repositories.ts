import type { Pool } from 'pg';
import type {
  AmbienteRepository,
  CicloRepository,
  GeneticaRepository,
  PlantaRepository,
} from '@cosmaria/grow-application';
import {
  Ambiente,
  CicloCultivo,
  type FaseDeVida,
  Genetica,
  type OrigemDoMaterial,
  Planta,
  type TipoDeAmbiente,
  type TipoDeGenetica,
} from '@cosmaria/grow-domain';

// ---------------------------------------------------------------------------
// Genética
// ---------------------------------------------------------------------------

interface GeneticaRow {
  id: string;
  usuario_id: string;
  nome: string;
  tipo: string;
  linhagem: string | null;
  breeder: string | null;
  caracteristicas_esperadas: string | null;
  criado_em: Date;
  atualizado_em: Date;
}

const COLUNAS_GENETICA =
  'id, usuario_id, nome, tipo, linhagem, breeder, caracteristicas_esperadas, criado_em, atualizado_em';

const mapearGenetica = (r: GeneticaRow): Genetica =>
  Genetica.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    nome: r.nome,
    tipo: r.tipo as TipoDeGenetica,
    linhagem: r.linhagem,
    breeder: r.breeder,
    caracteristicasEsperadas: r.caracteristicas_esperadas,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
  });

export class PostgresGeneticaRepository implements GeneticaRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(g: Genetica): Promise<void> {
    await this.pool.query(
      `INSERT INTO grow.genetica (${COLUNAS_GENETICA})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE
         SET nome = EXCLUDED.nome,
             tipo = EXCLUDED.tipo,
             linhagem = EXCLUDED.linhagem,
             breeder = EXCLUDED.breeder,
             caracteristicas_esperadas = EXCLUDED.caracteristicas_esperadas,
             atualizado_em = EXCLUDED.atualizado_em`,
      [
        g.id,
        g.usuarioId,
        g.nome,
        g.tipo,
        g.linhagem,
        g.breeder,
        g.caracteristicasEsperadas,
        g.criadoEm,
        g.atualizadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<Genetica | null> {
    const { rows } = await this.pool.query<GeneticaRow>(
      `SELECT ${COLUNAS_GENETICA} FROM grow.genetica WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearGenetica(rows[0]) : null;
  }

  async listarPorUsuario(usuarioId: string): Promise<Genetica[]> {
    const { rows } = await this.pool.query<GeneticaRow>(
      `SELECT ${COLUNAS_GENETICA} FROM grow.genetica WHERE usuario_id = $1 ORDER BY nome`,
      [usuarioId],
    );
    return rows.map(mapearGenetica);
  }

  async remover(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM grow.genetica WHERE id = $1`, [id]);
  }

  async possuiPlantas(geneticaId: string): Promise<boolean> {
    const { rows } = await this.pool.query<{ existe: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM grow.planta WHERE genetica_id = $1) AS existe`,
      [geneticaId],
    );
    return rows[0].existe;
  }
}

// ---------------------------------------------------------------------------
// Ambiente
// ---------------------------------------------------------------------------

interface AmbienteRow {
  id: string;
  usuario_id: string;
  nome: string;
  tipo: string;
  largura_cm: number | null;
  comprimento_cm: number | null;
  altura_cm: number | null;
  capacidade_plantas: number | null;
  criado_em: Date;
  atualizado_em: Date;
}

const COLUNAS_AMBIENTE =
  'id, usuario_id, nome, tipo, largura_cm, comprimento_cm, altura_cm, capacidade_plantas, criado_em, atualizado_em';

const mapearAmbiente = (r: AmbienteRow): Ambiente =>
  Ambiente.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    nome: r.nome,
    tipo: r.tipo as TipoDeAmbiente,
    larguraCm: r.largura_cm,
    comprimentoCm: r.comprimento_cm,
    alturaCm: r.altura_cm,
    capacidadePlantas: r.capacidade_plantas,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
  });

export class PostgresAmbienteRepository implements AmbienteRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(a: Ambiente): Promise<void> {
    await this.pool.query(
      `INSERT INTO grow.ambiente (${COLUNAS_AMBIENTE})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE
         SET nome = EXCLUDED.nome,
             tipo = EXCLUDED.tipo,
             largura_cm = EXCLUDED.largura_cm,
             comprimento_cm = EXCLUDED.comprimento_cm,
             altura_cm = EXCLUDED.altura_cm,
             capacidade_plantas = EXCLUDED.capacidade_plantas,
             atualizado_em = EXCLUDED.atualizado_em`,
      [
        a.id,
        a.usuarioId,
        a.nome,
        a.tipo,
        a.larguraCm,
        a.comprimentoCm,
        a.alturaCm,
        a.capacidadePlantas,
        a.criadoEm,
        a.atualizadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<Ambiente | null> {
    const { rows } = await this.pool.query<AmbienteRow>(
      `SELECT ${COLUNAS_AMBIENTE} FROM grow.ambiente WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearAmbiente(rows[0]) : null;
  }

  async listarPorUsuario(usuarioId: string): Promise<Ambiente[]> {
    const { rows } = await this.pool.query<AmbienteRow>(
      `SELECT ${COLUNAS_AMBIENTE} FROM grow.ambiente WHERE usuario_id = $1 ORDER BY criado_em`,
      [usuarioId],
    );
    return rows.map(mapearAmbiente);
  }

  async remover(id: string): Promise<void> {
    await this.pool.query(`DELETE FROM grow.ambiente WHERE id = $1`, [id]);
  }

  async contarPorUsuario(usuarioId: string): Promise<number> {
    const { rows } = await this.pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM grow.ambiente WHERE usuario_id = $1`,
      [usuarioId],
    );
    return Number(rows[0].total);
  }

  async possuiCiclos(ambienteId: string): Promise<boolean> {
    const { rows } = await this.pool.query<{ existe: boolean }>(
      `SELECT EXISTS(SELECT 1 FROM grow.ciclo_cultivo WHERE ambiente_id = $1) AS existe`,
      [ambienteId],
    );
    return rows[0].existe;
  }
}

// ---------------------------------------------------------------------------
// Ciclo de Cultivo
// ---------------------------------------------------------------------------

interface TransicaoRow {
  fase: string;
  ocorridaEm: string;
}

interface CicloRow {
  id: string;
  usuario_id: string;
  ambiente_id: string;
  nome: string;
  fase_atual: string;
  transicoes: TransicaoRow[] | null;
  iniciado_em: Date;
  encerrado_em: Date | null;
  criado_em: Date;
  atualizado_em: Date;
}

const COLUNAS_CICLO =
  'id, usuario_id, ambiente_id, nome, fase_atual, transicoes, iniciado_em, encerrado_em, criado_em, atualizado_em';

const mapearCiclo = (r: CicloRow): CicloCultivo =>
  CicloCultivo.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    ambienteId: r.ambiente_id,
    nome: r.nome,
    faseAtual: r.fase_atual as FaseDeVida,
    // O JSONB guarda a data como texto ISO; reidratar para Date é responsabilidade daqui.
    transicoes: (r.transicoes ?? []).map((t) => ({
      fase: t.fase as FaseDeVida,
      ocorridaEm: new Date(t.ocorridaEm),
    })),
    iniciadoEm: r.iniciado_em,
    encerradoEm: r.encerrado_em,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
  });

export class PostgresCicloRepository implements CicloRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(c: CicloCultivo): Promise<void> {
    const transicoes = JSON.stringify(
      c.transicoes().map((t) => ({ fase: t.fase, ocorridaEm: t.ocorridaEm.toISOString() })),
    );
    await this.pool.query(
      `INSERT INTO grow.ciclo_cultivo (${COLUNAS_CICLO})
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE
         SET nome = EXCLUDED.nome,
             fase_atual = EXCLUDED.fase_atual,
             transicoes = EXCLUDED.transicoes,
             encerrado_em = EXCLUDED.encerrado_em,
             atualizado_em = EXCLUDED.atualizado_em`,
      [
        c.id,
        c.usuarioId,
        c.ambienteId,
        c.nome,
        c.faseAtual,
        transicoes,
        c.iniciadoEm,
        c.encerradoEm,
        c.criadoEm,
        c.atualizadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<CicloCultivo | null> {
    const { rows } = await this.pool.query<CicloRow>(
      `SELECT ${COLUNAS_CICLO} FROM grow.ciclo_cultivo WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearCiclo(rows[0]) : null;
  }

  async listarPorUsuario(usuarioId: string, apenasAtivos = false): Promise<CicloCultivo[]> {
    const { rows } = await this.pool.query<CicloRow>(
      `SELECT ${COLUNAS_CICLO} FROM grow.ciclo_cultivo
        WHERE usuario_id = $1 ${apenasAtivos ? 'AND encerrado_em IS NULL' : ''}
        ORDER BY iniciado_em DESC`,
      [usuarioId],
    );
    return rows.map(mapearCiclo);
  }
}

// ---------------------------------------------------------------------------
// Planta
// ---------------------------------------------------------------------------

interface PlantaRow {
  id: string;
  usuario_id: string;
  ciclo_id: string;
  genetica_id: string;
  nome: string;
  origem: string;
  planta_mae_id: string | null;
  fase_atual: string;
  germinada_em: Date | null;
  criado_em: Date;
  atualizado_em: Date;
}

const COLUNAS_PLANTA =
  'id, usuario_id, ciclo_id, genetica_id, nome, origem, planta_mae_id, fase_atual, germinada_em, criado_em, atualizado_em';

const mapearPlanta = (r: PlantaRow): Planta =>
  Planta.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    cicloId: r.ciclo_id,
    geneticaId: r.genetica_id,
    nome: r.nome,
    origem: r.origem as OrigemDoMaterial,
    plantaMaeId: r.planta_mae_id,
    faseAtual: r.fase_atual as FaseDeVida,
    germinadaEm: r.germinada_em,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
  });

export class PostgresPlantaRepository implements PlantaRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(p: Planta): Promise<void> {
    await this.pool.query(
      `INSERT INTO grow.planta (${COLUNAS_PLANTA})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE
         SET nome = EXCLUDED.nome,
             fase_atual = EXCLUDED.fase_atual,
             germinada_em = EXCLUDED.germinada_em,
             atualizado_em = EXCLUDED.atualizado_em`,
      [
        p.id,
        p.usuarioId,
        p.cicloId,
        p.geneticaId,
        p.nome,
        p.origem,
        p.plantaMaeId,
        p.faseAtual,
        p.germinadaEm,
        p.criadoEm,
        p.atualizadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<Planta | null> {
    const { rows } = await this.pool.query<PlantaRow>(
      `SELECT ${COLUNAS_PLANTA} FROM grow.planta WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearPlanta(rows[0]) : null;
  }

  async listarPorCiclo(cicloId: string): Promise<Planta[]> {
    const { rows } = await this.pool.query<PlantaRow>(
      `SELECT ${COLUNAS_PLANTA} FROM grow.planta WHERE ciclo_id = $1 ORDER BY criado_em`,
      [cicloId],
    );
    return rows.map(mapearPlanta);
  }
}
