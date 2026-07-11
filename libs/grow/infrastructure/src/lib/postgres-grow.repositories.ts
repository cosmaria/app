import type { Pool } from 'pg';
import type {
  AmbienteRepository,
  CicloRepository,
  ColheitaRepository,
  CuraRepository,
  EventoManejoRepository,
  EventoSanidadeRepository,
  FiltroDeTarefas,
  GeneticaRepository,
  LoteRepository,
  PaginaDeRegistros,
  PlantaRepository,
  RegistroAmbientalRepository,
  SecagemRepository,
  TarefaRepository,
} from '@cosmaria/grow-application';
import {
  Ambiente,
  arredondar,
  CicloCultivo,
  Colheita,
  Cura,
  EventoManejo,
  EventoSanidade,
  type FaseDeVida,
  Genetica,
  Lote,
  type OrigemDaTarefa,
  type OrigemDoMaterial,
  type OrigemDoRegistro,
  Planta,
  RegistroAmbiental,
  type ResumoAmbiental,
  Secagem,
  type Severidade,
  type StatusDaTarefa,
  Tarefa,
  type TipoDeAmbiente,
  type TipoDeGenetica,
  type TipoDeManejo,
  type TipoDeSanidade,
  type TipoDeTarefa,
} from '@cosmaria/grow-domain';

/** Média vinda de `AVG` (string ou null), convertida e arredondada na fronteira. */
const mediaArredondada = (valor: string | null): number | null =>
  valor === null ? null : arredondar(Number(valor), 2);

/**
 * `NUMERIC` volta do driver `pg` como **string**, para não perder precisão. Converter
 * aqui, na fronteira, evita que o domínio receba `"25.00"` onde espera `25` — e que uma
 * comparação numérica vire comparação de texto lá dentro.
 */
const numeroOuNulo = (valor: string | number | null): number | null =>
  valor === null ? null : Number(valor);

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

// ---------------------------------------------------------------------------
// Registro Ambiental (série temporal, append-only)
// ---------------------------------------------------------------------------

interface RegistroRow {
  id: string;
  usuario_id: string;
  ciclo_id: string;
  planta_id: string | null;
  registrado_em: Date;
  origem: string;
  temperatura_c: string | null;
  umidade_relativa: string | null;
  ph: string | null;
  ec: string | null;
  ppfd: string | null;
  horas_de_luz: string | null;
  vpd_kpa: string | null;
  dli: string | null;
  observacoes: string | null;
}

const COLUNAS_REGISTRO =
  'id, usuario_id, ciclo_id, planta_id, registrado_em, origem, temperatura_c, umidade_relativa, ph, ec, ppfd, horas_de_luz, vpd_kpa, dli, observacoes';

const mapearRegistro = (r: RegistroRow): RegistroAmbiental =>
  RegistroAmbiental.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    cicloId: r.ciclo_id,
    plantaId: r.planta_id,
    registradoEm: r.registrado_em,
    origem: r.origem as OrigemDoRegistro,
    temperaturaC: numeroOuNulo(r.temperatura_c),
    umidadeRelativa: numeroOuNulo(r.umidade_relativa),
    ph: numeroOuNulo(r.ph),
    ec: numeroOuNulo(r.ec),
    ppfd: numeroOuNulo(r.ppfd),
    horasDeLuz: numeroOuNulo(r.horas_de_luz),
    vpdKpa: numeroOuNulo(r.vpd_kpa),
    dli: numeroOuNulo(r.dli),
    observacoes: r.observacoes,
  });

/**
 * Série temporal no schema `grow`. **Append-only**: só `INSERT`. Não há `ON CONFLICT`
 * nem `UPDATE` — a ausência dessas operações é a garantia de que o histórico não é
 * reescrito, e não apenas uma convenção da camada de aplicação.
 */
export class PostgresRegistroAmbientalRepository implements RegistroAmbientalRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(r: RegistroAmbiental): Promise<void> {
    await this.pool.query(
      `INSERT INTO grow.registro_ambiental (${COLUNAS_REGISTRO})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        r.id,
        r.usuarioId,
        r.cicloId,
        r.plantaId,
        r.registradoEm,
        r.origem,
        r.temperaturaC,
        r.umidadeRelativa,
        r.ph,
        r.ec,
        r.ppfd,
        r.horasDeLuz,
        r.vpdKpa,
        r.dli,
        r.observacoes,
      ],
    );
  }

  async buscarPorId(id: string): Promise<RegistroAmbiental | null> {
    const { rows } = await this.pool.query<RegistroRow>(
      `SELECT ${COLUNAS_REGISTRO} FROM grow.registro_ambiental WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearRegistro(rows[0]) : null;
  }

  async listarPorCiclo(
    cicloId: string,
    parametros: { limite: number; deslocamento: number },
  ): Promise<PaginaDeRegistros> {
    const { rows } = await this.pool.query<RegistroRow>(
      `SELECT ${COLUNAS_REGISTRO} FROM grow.registro_ambiental
        WHERE ciclo_id = $1 ORDER BY registrado_em DESC LIMIT $2 OFFSET $3`,
      [cicloId, parametros.limite, parametros.deslocamento],
    );
    const contagem = await this.pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM grow.registro_ambiental WHERE ciclo_id = $1`,
      [cicloId],
    );
    return { itens: rows.map(mapearRegistro), total: Number(contagem.rows[0].total) };
  }

  async resumoAmbientalPorCiclo(cicloId: string): Promise<ResumoAmbiental> {
    // AVG ignora NULLs por definição: a média é sobre as medições efetivamente registradas.
    const { rows } = await this.pool.query<{
      total: string;
      temperatura: string | null;
      umidade: string | null;
      vpd: string | null;
      dli: string | null;
      ph: string | null;
      ec: string | null;
    }>(
      `SELECT count(*) AS total,
              avg(temperatura_c)    AS temperatura,
              avg(umidade_relativa) AS umidade,
              avg(vpd_kpa)          AS vpd,
              avg(dli)              AS dli,
              avg(ph)               AS ph,
              avg(ec)               AS ec
         FROM grow.registro_ambiental WHERE ciclo_id = $1`,
      [cicloId],
    );
    const r = rows[0];
    return {
      totalRegistros: Number(r.total),
      temperaturaMedia: mediaArredondada(r.temperatura),
      umidadeMedia: mediaArredondada(r.umidade),
      vpdMedio: mediaArredondada(r.vpd),
      dliMedio: mediaArredondada(r.dli),
      phMedio: mediaArredondada(r.ph),
      ecMedio: mediaArredondada(r.ec),
    };
  }
}

// ---------------------------------------------------------------------------
// Eventos de cultivo: Manejo e Sanidade
// ---------------------------------------------------------------------------

interface ManejoRow {
  id: string;
  usuario_id: string;
  ciclo_id: string;
  planta_id: string | null;
  tipo: string;
  ocorrido_em: Date;
  observacoes: string | null;
  criado_em: Date;
}

const COLUNAS_MANEJO =
  'id, usuario_id, ciclo_id, planta_id, tipo, ocorrido_em, observacoes, criado_em';

const mapearManejo = (r: ManejoRow): EventoManejo =>
  EventoManejo.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    cicloId: r.ciclo_id,
    plantaId: r.planta_id,
    tipo: r.tipo as TipoDeManejo,
    ocorridoEm: r.ocorrido_em,
    observacoes: r.observacoes,
    criadoEm: r.criado_em,
  });

/** Histórico imutável: só `INSERT`. A ausência de `UPDATE` é a garantia. */
export class PostgresEventoManejoRepository implements EventoManejoRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(e: EventoManejo): Promise<void> {
    await this.pool.query(
      `INSERT INTO grow.evento_manejo (${COLUNAS_MANEJO}) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [e.id, e.usuarioId, e.cicloId, e.plantaId, e.tipo, e.ocorridoEm, e.observacoes, e.criadoEm],
    );
  }

  async listarPorCiclo(cicloId: string): Promise<EventoManejo[]> {
    const { rows } = await this.pool.query<ManejoRow>(
      `SELECT ${COLUNAS_MANEJO} FROM grow.evento_manejo
        WHERE ciclo_id = $1 ORDER BY ocorrido_em DESC`,
      [cicloId],
    );
    return rows.map(mapearManejo);
  }
}

interface SanidadeRow {
  id: string;
  usuario_id: string;
  ciclo_id: string;
  planta_id: string | null;
  tipo: string;
  severidade: string;
  descricao: string | null;
  tratamento_aplicado: string | null;
  ocorrido_em: Date;
  resolvido_em: Date | null;
  criado_em: Date;
}

const COLUNAS_SANIDADE =
  'id, usuario_id, ciclo_id, planta_id, tipo, severidade, descricao, tratamento_aplicado, ocorrido_em, resolvido_em, criado_em';

const mapearSanidade = (r: SanidadeRow): EventoSanidade =>
  EventoSanidade.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    cicloId: r.ciclo_id,
    plantaId: r.planta_id,
    tipo: r.tipo as TipoDeSanidade,
    severidade: r.severidade as Severidade,
    descricao: r.descricao,
    tratamentoAplicado: r.tratamento_aplicado,
    ocorridoEm: r.ocorrido_em,
    resolvidoEm: r.resolvido_em,
    criadoEm: r.criado_em,
  });

/**
 * O `ON CONFLICT` atualiza SÓ a resolução e o tratamento — as únicas mutações permitidas.
 * Tipo, severidade e descrição jamais mudam: uma observação revista é um novo evento.
 */
export class PostgresEventoSanidadeRepository implements EventoSanidadeRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(e: EventoSanidade): Promise<void> {
    await this.pool.query(
      `INSERT INTO grow.evento_sanidade (${COLUNAS_SANIDADE})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE
         SET resolvido_em = EXCLUDED.resolvido_em,
             tratamento_aplicado = EXCLUDED.tratamento_aplicado`,
      [
        e.id,
        e.usuarioId,
        e.cicloId,
        e.plantaId,
        e.tipo,
        e.severidade,
        e.descricao,
        e.tratamentoAplicado,
        e.ocorridoEm,
        e.resolvidoEm,
        e.criadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<EventoSanidade | null> {
    const { rows } = await this.pool.query<SanidadeRow>(
      `SELECT ${COLUNAS_SANIDADE} FROM grow.evento_sanidade WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearSanidade(rows[0]) : null;
  }

  async listarPorCiclo(cicloId: string, apenasAbertos = false): Promise<EventoSanidade[]> {
    const { rows } = await this.pool.query<SanidadeRow>(
      `SELECT ${COLUNAS_SANIDADE} FROM grow.evento_sanidade
        WHERE ciclo_id = $1 ${apenasAbertos ? 'AND resolvido_em IS NULL' : ''}
        ORDER BY ocorrido_em DESC`,
      [cicloId],
    );
    return rows.map(mapearSanidade);
  }
}

// ---------------------------------------------------------------------------
// Pós-colheita: Colheita, Secagem, Cura, Lote
// ---------------------------------------------------------------------------

interface ColheitaRow {
  id: string;
  usuario_id: string;
  ciclo_id: string;
  plantas: string[];
  peso_umido_gramas: string | null;
  colhido_em: Date;
  observacoes: string | null;
  criado_em: Date;
}

const COLUNAS_COLHEITA =
  'id, usuario_id, ciclo_id, plantas, peso_umido_gramas, colhido_em, observacoes, criado_em';

const mapearColheita = (r: ColheitaRow): Colheita =>
  Colheita.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    cicloId: r.ciclo_id,
    plantaIds: r.plantas,
    pesoUmidoGramas: numeroOuNulo(r.peso_umido_gramas),
    colhidoEm: r.colhido_em,
    observacoes: r.observacoes,
    criadoEm: r.criado_em,
  });

/** Colheita — histórico imutável: só `INSERT` (Arquétipo B). */
export class PostgresColheitaRepository implements ColheitaRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(c: Colheita): Promise<void> {
    await this.pool.query(
      `INSERT INTO grow.colheita (${COLUNAS_COLHEITA}) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        c.id,
        c.usuarioId,
        c.cicloId,
        c.plantaIds,
        c.pesoUmidoGramas,
        c.colhidoEm,
        c.observacoes,
        c.criadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<Colheita | null> {
    const { rows } = await this.pool.query<ColheitaRow>(
      `SELECT ${COLUNAS_COLHEITA} FROM grow.colheita WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearColheita(rows[0]) : null;
  }

  async listarPorCiclo(cicloId: string): Promise<Colheita[]> {
    const { rows } = await this.pool.query<ColheitaRow>(
      `SELECT ${COLUNAS_COLHEITA} FROM grow.colheita WHERE ciclo_id = $1 ORDER BY colhido_em DESC`,
      [cicloId],
    );
    return rows.map(mapearColheita);
  }
}

interface SecagemRow {
  id: string;
  usuario_id: string;
  colheita_id: string;
  iniciada_em: Date;
  finalizada_em: Date | null;
  temperatura_c: string | null;
  umidade_relativa: string | null;
  observacoes: string | null;
  criado_em: Date;
}

const COLUNAS_SECAGEM =
  'id, usuario_id, colheita_id, iniciada_em, finalizada_em, temperatura_c, umidade_relativa, observacoes, criado_em';

const mapearSecagem = (r: SecagemRow): Secagem =>
  Secagem.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    colheitaId: r.colheita_id,
    iniciadaEm: r.iniciada_em,
    finalizadaEm: r.finalizada_em,
    temperaturaC: numeroOuNulo(r.temperatura_c),
    umidadeRelativa: numeroOuNulo(r.umidade_relativa),
    observacoes: r.observacoes,
    criadoEm: r.criado_em,
  });

/** Secagem — 1—1 com a Colheita. O `ON CONFLICT` grava só a finalização (única mutação). */
export class PostgresSecagemRepository implements SecagemRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(s: Secagem): Promise<void> {
    await this.pool.query(
      `INSERT INTO grow.secagem (${COLUNAS_SECAGEM})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET finalizada_em = EXCLUDED.finalizada_em`,
      [
        s.id,
        s.usuarioId,
        s.colheitaId,
        s.iniciadaEm,
        s.finalizadaEm,
        s.temperaturaC,
        s.umidadeRelativa,
        s.observacoes,
        s.criadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<Secagem | null> {
    const { rows } = await this.pool.query<SecagemRow>(
      `SELECT ${COLUNAS_SECAGEM} FROM grow.secagem WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearSecagem(rows[0]) : null;
  }

  async buscarPorColheita(colheitaId: string): Promise<Secagem | null> {
    const { rows } = await this.pool.query<SecagemRow>(
      `SELECT ${COLUNAS_SECAGEM} FROM grow.secagem WHERE colheita_id = $1`,
      [colheitaId],
    );
    return rows[0] ? mapearSecagem(rows[0]) : null;
  }
}

interface CuraRow {
  id: string;
  usuario_id: string;
  secagem_id: string;
  iniciada_em: Date;
  finalizada_em: Date | null;
  temperatura_c: string | null;
  umidade_relativa: string | null;
  burping: string | null;
  observacoes: string | null;
  criado_em: Date;
}

const COLUNAS_CURA =
  'id, usuario_id, secagem_id, iniciada_em, finalizada_em, temperatura_c, umidade_relativa, burping, observacoes, criado_em';

const mapearCura = (r: CuraRow): Cura =>
  Cura.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    secagemId: r.secagem_id,
    iniciadaEm: r.iniciada_em,
    finalizadaEm: r.finalizada_em,
    temperaturaC: numeroOuNulo(r.temperatura_c),
    umidadeRelativa: numeroOuNulo(r.umidade_relativa),
    burping: r.burping,
    observacoes: r.observacoes,
    criadoEm: r.criado_em,
  });

/** Cura — 1—1 com a Secagem. Mesma forma da secagem. */
export class PostgresCuraRepository implements CuraRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(c: Cura): Promise<void> {
    await this.pool.query(
      `INSERT INTO grow.cura (${COLUNAS_CURA})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE SET finalizada_em = EXCLUDED.finalizada_em`,
      [
        c.id,
        c.usuarioId,
        c.secagemId,
        c.iniciadaEm,
        c.finalizadaEm,
        c.temperaturaC,
        c.umidadeRelativa,
        c.burping,
        c.observacoes,
        c.criadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<Cura | null> {
    const { rows } = await this.pool.query<CuraRow>(
      `SELECT ${COLUNAS_CURA} FROM grow.cura WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearCura(rows[0]) : null;
  }

  async buscarPorSecagem(secagemId: string): Promise<Cura | null> {
    const { rows } = await this.pool.query<CuraRow>(
      `SELECT ${COLUNAS_CURA} FROM grow.cura WHERE secagem_id = $1`,
      [secagemId],
    );
    return rows[0] ? mapearCura(rows[0]) : null;
  }
}

interface LoteRow {
  id: string;
  usuario_id: string;
  cura_id: string;
  codigo: string;
  peso_seco_gramas: string;
  observacoes: string | null;
  gerado_em: Date;
}

const COLUNAS_LOTE = 'id, usuario_id, cura_id, codigo, peso_seco_gramas, observacoes, gerado_em';

const mapearLote = (r: LoteRow): Lote =>
  Lote.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    curaId: r.cura_id,
    codigo: r.codigo,
    pesoSecoGramas: Number(r.peso_seco_gramas),
    observacoes: r.observacoes,
    geradoEm: r.gerado_em,
  });

/** Lote — unidade terminal, 1—1 com a Cura. Só `INSERT`: um lote gerado não se reescreve. */
export class PostgresLoteRepository implements LoteRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(l: Lote): Promise<void> {
    await this.pool.query(`INSERT INTO grow.lote (${COLUNAS_LOTE}) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [
      l.id,
      l.usuarioId,
      l.curaId,
      l.codigo,
      l.pesoSecoGramas,
      l.observacoes,
      l.geradoEm,
    ]);
  }

  async buscarPorId(id: string): Promise<Lote | null> {
    const { rows } = await this.pool.query<LoteRow>(
      `SELECT ${COLUNAS_LOTE} FROM grow.lote WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearLote(rows[0]) : null;
  }

  async buscarPorCura(curaId: string): Promise<Lote | null> {
    const { rows } = await this.pool.query<LoteRow>(
      `SELECT ${COLUNAS_LOTE} FROM grow.lote WHERE cura_id = $1`,
      [curaId],
    );
    return rows[0] ? mapearLote(rows[0]) : null;
  }
}

// ---------------------------------------------------------------------------
// Tarefa
// ---------------------------------------------------------------------------

interface TarefaRow {
  id: string;
  usuario_id: string;
  ciclo_id: string;
  planta_id: string | null;
  titulo: string;
  tipo: string;
  origem: string;
  status: string;
  prevista_para: Date | null;
  recorrencia_dias: number | null;
  concluida_em: Date | null;
  alerta_id: string | null;
  criado_em: Date;
  atualizado_em: Date;
}

const COLUNAS_TAREFA =
  'id, usuario_id, ciclo_id, planta_id, titulo, tipo, origem, status, prevista_para, recorrencia_dias, concluida_em, alerta_id, criado_em, atualizado_em';

const mapearTarefa = (r: TarefaRow): Tarefa =>
  Tarefa.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    cicloId: r.ciclo_id,
    plantaId: r.planta_id,
    titulo: r.titulo,
    tipo: r.tipo as TipoDeTarefa,
    origem: r.origem as OrigemDaTarefa,
    status: r.status as StatusDaTarefa,
    previstaPara: r.prevista_para,
    recorrenciaDias: r.recorrencia_dias,
    concluidaEm: r.concluida_em,
    alertaId: r.alerta_id,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
  });

/**
 * Tarefa — operacional (Arquétipo A). O `ON CONFLICT` atualiza os campos mutáveis: título,
 * tipo, status, data prevista, recorrência e conclusão. Origem, ciclo e alerta de origem
 * nunca mudam.
 */
export class PostgresTarefaRepository implements TarefaRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(t: Tarefa): Promise<void> {
    await this.pool.query(
      `INSERT INTO grow.tarefa (${COLUNAS_TAREFA})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       ON CONFLICT (id) DO UPDATE
         SET titulo = EXCLUDED.titulo,
             tipo = EXCLUDED.tipo,
             status = EXCLUDED.status,
             prevista_para = EXCLUDED.prevista_para,
             recorrencia_dias = EXCLUDED.recorrencia_dias,
             concluida_em = EXCLUDED.concluida_em,
             atualizado_em = EXCLUDED.atualizado_em`,
      [
        t.id,
        t.usuarioId,
        t.cicloId,
        t.plantaId,
        t.titulo,
        t.tipo,
        t.origem,
        t.status,
        t.previstaPara,
        t.recorrenciaDias,
        t.concluidaEm,
        t.alertaId,
        t.criadoEm,
        t.atualizadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<Tarefa | null> {
    const { rows } = await this.pool.query<TarefaRow>(
      `SELECT ${COLUNAS_TAREFA} FROM grow.tarefa WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearTarefa(rows[0]) : null;
  }

  async listarPorUsuario(usuarioId: string, filtro?: FiltroDeTarefas): Promise<Tarefa[]> {
    const condicoes = ['usuario_id = $1'];
    const params: unknown[] = [usuarioId];
    if (filtro?.cicloId) {
      params.push(filtro.cicloId);
      condicoes.push(`ciclo_id = $${params.length}`);
    }
    if (filtro?.apenasPendentes) {
      condicoes.push(`status = 'PENDENTE'`);
    }
    // Pendentes com data mais próxima primeiro; sem data ao fim; concluídas por último critério.
    const { rows } = await this.pool.query<TarefaRow>(
      `SELECT ${COLUNAS_TAREFA} FROM grow.tarefa
        WHERE ${condicoes.join(' AND ')}
        ORDER BY prevista_para ASC NULLS LAST, criado_em DESC`,
      params,
    );
    return rows.map(mapearTarefa);
  }
}
