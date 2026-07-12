import type { Pool } from 'pg';
import type {
  EfeitoRepository,
  ModeloDeTratamentoRepository,
  ProdutoRepository,
  RegistroDeUsoRepository,
  SessaoAntesDepoisRepository,
  SintomaDiarioRepository,
  TratamentoRepository,
} from '@cosmaria/med-application';
import {
  ModeloDeTratamento,
  Produto,
  RegistroDeEfeito,
  RegistroDeSintomaDiario,
  RegistroDeUso,
  SessaoAntesDepois,
  type StatusDoTratamento,
  type TipoDeEfeito,
  type TipoDeProduto,
  Tratamento,
  type UnidadeDeDose,
  type ViaDeAdministracao,
} from '@cosmaria/med-domain';

// ---------------------------------------------------------------------------
// Tratamento
// ---------------------------------------------------------------------------

interface TratamentoRow {
  id: string;
  usuario_id: string;
  condicao: string;
  objetivo: string | null;
  medico_responsavel: string | null;
  status: string;
  iniciado_em: Date;
  encerrado_em: Date | null;
  criado_em: Date;
  atualizado_em: Date;
}

const COLUNAS_TRATAMENTO =
  'id, usuario_id, condicao, objetivo, medico_responsavel, status, iniciado_em, encerrado_em, criado_em, atualizado_em';

const mapearTratamento = (r: TratamentoRow): Tratamento =>
  Tratamento.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    condicao: r.condicao,
    objetivo: r.objetivo,
    medicoResponsavel: r.medico_responsavel,
    status: r.status as StatusDoTratamento,
    iniciadoEm: r.iniciado_em,
    encerradoEm: r.encerrado_em,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
  });

export class PostgresTratamentoRepository implements TratamentoRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(t: Tratamento): Promise<void> {
    await this.pool.query(
      `INSERT INTO med.tratamento (${COLUNAS_TRATAMENTO})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE
         SET condicao = EXCLUDED.condicao,
             objetivo = EXCLUDED.objetivo,
             medico_responsavel = EXCLUDED.medico_responsavel,
             status = EXCLUDED.status,
             encerrado_em = EXCLUDED.encerrado_em,
             atualizado_em = EXCLUDED.atualizado_em`,
      [
        t.id,
        t.usuarioId,
        t.condicao,
        t.objetivo,
        t.medicoResponsavel,
        t.status,
        t.iniciadoEm,
        t.encerradoEm,
        t.criadoEm,
        t.atualizadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<Tratamento | null> {
    const { rows } = await this.pool.query<TratamentoRow>(
      `SELECT ${COLUNAS_TRATAMENTO} FROM med.tratamento WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearTratamento(rows[0]) : null;
  }

  async listarPorUsuario(usuarioId: string, apenasAtivos = false): Promise<Tratamento[]> {
    const { rows } = await this.pool.query<TratamentoRow>(
      `SELECT ${COLUNAS_TRATAMENTO} FROM med.tratamento
        WHERE usuario_id = $1 ${apenasAtivos ? `AND status = 'ATIVO'` : ''}
        ORDER BY criado_em DESC`,
      [usuarioId],
    );
    return rows.map(mapearTratamento);
  }

  async remover(id: string): Promise<void> {
    await this.pool.query('DELETE FROM med.tratamento WHERE id = $1', [id]);
  }

  async possuiProdutos(tratamentoId: string): Promise<boolean> {
    const { rows } = await this.pool.query(
      'SELECT 1 FROM med.produto WHERE tratamento_id = $1 LIMIT 1',
      [tratamentoId],
    );
    return rows.length > 0;
  }
}

// ---------------------------------------------------------------------------
// Produto
// ---------------------------------------------------------------------------

interface ProdutoRow {
  id: string;
  usuario_id: string;
  tratamento_id: string;
  nome: string;
  tipo: string;
  concentracao_cbd: string | null;
  concentracao_thc: string | null;
  fabricante: string | null;
  lote_id: string | null;
  criado_em: Date;
  atualizado_em: Date;
}

const COLUNAS_PRODUTO =
  'id, usuario_id, tratamento_id, nome, tipo, concentracao_cbd, concentracao_thc, fabricante, lote_id, criado_em, atualizado_em';

const mapearProduto = (r: ProdutoRow): Produto =>
  Produto.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    tratamentoId: r.tratamento_id,
    nome: r.nome,
    tipo: r.tipo as TipoDeProduto,
    concentracaoCbd: r.concentracao_cbd,
    concentracaoThc: r.concentracao_thc,
    fabricante: r.fabricante,
    loteId: r.lote_id,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
  });

export class PostgresProdutoRepository implements ProdutoRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(p: Produto): Promise<void> {
    await this.pool.query(
      `INSERT INTO med.produto (${COLUNAS_PRODUTO})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (id) DO UPDATE
         SET nome = EXCLUDED.nome,
             tipo = EXCLUDED.tipo,
             concentracao_cbd = EXCLUDED.concentracao_cbd,
             concentracao_thc = EXCLUDED.concentracao_thc,
             fabricante = EXCLUDED.fabricante,
             lote_id = EXCLUDED.lote_id,
             atualizado_em = EXCLUDED.atualizado_em`,
      [
        p.id,
        p.usuarioId,
        p.tratamentoId,
        p.nome,
        p.tipo,
        p.concentracaoCbd,
        p.concentracaoThc,
        p.fabricante,
        p.loteId,
        p.criadoEm,
        p.atualizadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<Produto | null> {
    const { rows } = await this.pool.query<ProdutoRow>(
      `SELECT ${COLUNAS_PRODUTO} FROM med.produto WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearProduto(rows[0]) : null;
  }

  async listarPorTratamento(tratamentoId: string): Promise<Produto[]> {
    const { rows } = await this.pool.query<ProdutoRow>(
      `SELECT ${COLUNAS_PRODUTO} FROM med.produto
        WHERE tratamento_id = $1 ORDER BY criado_em ASC`,
      [tratamentoId],
    );
    return rows.map(mapearProduto);
  }

  async remover(id: string): Promise<void> {
    await this.pool.query('DELETE FROM med.produto WHERE id = $1', [id]);
  }

  async possuiRegistros(produtoId: string): Promise<boolean> {
    const { rows } = await this.pool.query(
      'SELECT 1 FROM med.registro_uso WHERE produto_id = $1 LIMIT 1',
      [produtoId],
    );
    return rows.length > 0;
  }
}

// ---------------------------------------------------------------------------
// RegistroDeUso (série de doses — append-only)
// ---------------------------------------------------------------------------

interface RegistroDeUsoRow {
  id: string;
  usuario_id: string;
  produto_id: string;
  quantidade: string;
  unidade: string;
  via: string;
  usado_em: Date;
  observacoes: string | null;
  criado_em: Date;
}

const COLUNAS_REGISTRO =
  'id, usuario_id, produto_id, quantidade, unidade, via, usado_em, observacoes, criado_em';

const mapearRegistro = (r: RegistroDeUsoRow): RegistroDeUso =>
  RegistroDeUso.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    produtoId: r.produto_id,
    // NUMERIC volta como string do driver `pg`; converte na fronteira.
    quantidade: Number(r.quantidade),
    unidade: r.unidade as UnidadeDeDose,
    via: r.via as ViaDeAdministracao,
    usadoEm: r.usado_em,
    observacoes: r.observacoes,
    criadoEm: r.criado_em,
  });

export class PostgresRegistroDeUsoRepository implements RegistroDeUsoRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(r: RegistroDeUso): Promise<void> {
    // Sem ON CONFLICT: a série é append-only, nunca reescrita.
    await this.pool.query(
      `INSERT INTO med.registro_uso (${COLUNAS_REGISTRO})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        r.id,
        r.usuarioId,
        r.produtoId,
        r.quantidade,
        r.unidade,
        r.via,
        r.usadoEm,
        r.observacoes,
        r.criadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<RegistroDeUso | null> {
    const { rows } = await this.pool.query<RegistroDeUsoRow>(
      `SELECT ${COLUNAS_REGISTRO} FROM med.registro_uso WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearRegistro(rows[0]) : null;
  }

  async listarPorProduto(produtoId: string): Promise<RegistroDeUso[]> {
    const { rows } = await this.pool.query<RegistroDeUsoRow>(
      `SELECT ${COLUNAS_REGISTRO} FROM med.registro_uso
        WHERE produto_id = $1 ORDER BY usado_em DESC, criado_em DESC`,
      [produtoId],
    );
    return rows.map(mapearRegistro);
  }

  async listarPorTratamento(tratamentoId: string): Promise<RegistroDeUso[]> {
    const { rows } = await this.pool.query<RegistroDeUsoRow>(
      `SELECT ${COLUNAS_REGISTRO.split(', ')
        .map((c) => `ru.${c}`)
        .join(', ')}
         FROM med.registro_uso ru
         JOIN med.produto p ON p.id = ru.produto_id
        WHERE p.tratamento_id = $1
        ORDER BY ru.usado_em DESC, ru.criado_em DESC`,
      [tratamentoId],
    );
    return rows.map(mapearRegistro);
  }
}

// ---------------------------------------------------------------------------
// SessãoAntesDepois
// ---------------------------------------------------------------------------

interface SessaoRow {
  id: string;
  usuario_id: string;
  registro_uso_id: string;
  sintoma_alvo: string;
  intensidade_antes: number;
  intensidade_depois: number | null;
  intervalo_minutos: number;
  registrada_depois_em: Date | null;
  criado_em: Date;
  atualizado_em: Date;
}

const COLUNAS_SESSAO =
  'id, usuario_id, registro_uso_id, sintoma_alvo, intensidade_antes, intensidade_depois, intervalo_minutos, registrada_depois_em, criado_em, atualizado_em';

const mapearSessao = (r: SessaoRow): SessaoAntesDepois =>
  SessaoAntesDepois.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    registroDeUsoId: r.registro_uso_id,
    sintomaAlvo: r.sintoma_alvo,
    intensidadeAntes: r.intensidade_antes,
    intensidadeDepois: r.intensidade_depois,
    intervaloMinutos: r.intervalo_minutos,
    registradaDepoisEm: r.registrada_depois_em,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
  });

export class PostgresSessaoAntesDepoisRepository implements SessaoAntesDepoisRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(s: SessaoAntesDepois): Promise<void> {
    await this.pool.query(
      `INSERT INTO med.sessao_antes_depois (${COLUNAS_SESSAO})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (id) DO UPDATE
         SET intensidade_depois = EXCLUDED.intensidade_depois,
             registrada_depois_em = EXCLUDED.registrada_depois_em,
             atualizado_em = EXCLUDED.atualizado_em`,
      [
        s.id,
        s.usuarioId,
        s.registroDeUsoId,
        s.sintomaAlvo,
        s.intensidadeAntes,
        s.intensidadeDepois,
        s.intervaloMinutos,
        s.registradaDepoisEm,
        s.criadoEm,
        s.atualizadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<SessaoAntesDepois | null> {
    const { rows } = await this.pool.query<SessaoRow>(
      `SELECT ${COLUNAS_SESSAO} FROM med.sessao_antes_depois WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearSessao(rows[0]) : null;
  }

  async buscarPorRegistroDeUso(registroDeUsoId: string): Promise<SessaoAntesDepois | null> {
    const { rows } = await this.pool.query<SessaoRow>(
      `SELECT ${COLUNAS_SESSAO} FROM med.sessao_antes_depois WHERE registro_uso_id = $1`,
      [registroDeUsoId],
    );
    return rows[0] ? mapearSessao(rows[0]) : null;
  }

  async listarPorTratamento(tratamentoId: string): Promise<SessaoAntesDepois[]> {
    const { rows } = await this.pool.query<SessaoRow>(
      `SELECT ${COLUNAS_SESSAO.split(', ')
        .map((c) => `s.${c}`)
        .join(', ')}
         FROM med.sessao_antes_depois s
         JOIN med.registro_uso ru ON ru.id = s.registro_uso_id
         JOIN med.produto p ON p.id = ru.produto_id
        WHERE p.tratamento_id = $1
        ORDER BY s.criado_em DESC`,
      [tratamentoId],
    );
    return rows.map(mapearSessao);
  }
}

// ---------------------------------------------------------------------------
// RegistroDeSintomaDiario (linha de base — append-only)
// ---------------------------------------------------------------------------

interface SintomaDiarioRow {
  id: string;
  usuario_id: string;
  humor: number | null;
  ansiedade: number | null;
  dor: number | null;
  sono: number | null;
  apetite: number | null;
  registrado_em: Date;
  observacoes: string | null;
  criado_em: Date;
}

const COLUNAS_SINTOMA =
  'id, usuario_id, humor, ansiedade, dor, sono, apetite, registrado_em, observacoes, criado_em';

const mapearSintoma = (r: SintomaDiarioRow): RegistroDeSintomaDiario =>
  RegistroDeSintomaDiario.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    humor: r.humor,
    ansiedade: r.ansiedade,
    dor: r.dor,
    sono: r.sono,
    apetite: r.apetite,
    registradoEm: r.registrado_em,
    observacoes: r.observacoes,
    criadoEm: r.criado_em,
  });

export class PostgresSintomaDiarioRepository implements SintomaDiarioRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(r: RegistroDeSintomaDiario): Promise<void> {
    // Append-only: sem ON CONFLICT.
    await this.pool.query(
      `INSERT INTO med.sintoma_diario (${COLUNAS_SINTOMA})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        r.id,
        r.usuarioId,
        r.humor,
        r.ansiedade,
        r.dor,
        r.sono,
        r.apetite,
        r.registradoEm,
        r.observacoes,
        r.criadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<RegistroDeSintomaDiario | null> {
    const { rows } = await this.pool.query<SintomaDiarioRow>(
      `SELECT ${COLUNAS_SINTOMA} FROM med.sintoma_diario WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearSintoma(rows[0]) : null;
  }

  async listarPorUsuario(
    usuarioId: string,
    janela?: { de?: Date; ate?: Date },
  ): Promise<RegistroDeSintomaDiario[]> {
    const filtros = ['usuario_id = $1'];
    const params: unknown[] = [usuarioId];
    if (janela?.de) {
      params.push(janela.de);
      filtros.push(`registrado_em >= $${params.length}`);
    }
    if (janela?.ate) {
      params.push(janela.ate);
      filtros.push(`registrado_em <= $${params.length}`);
    }
    const { rows } = await this.pool.query<SintomaDiarioRow>(
      `SELECT ${COLUNAS_SINTOMA} FROM med.sintoma_diario
        WHERE ${filtros.join(' AND ')} ORDER BY registrado_em DESC`,
      params,
    );
    return rows.map(mapearSintoma);
  }
}

// ---------------------------------------------------------------------------
// RegistroDeEfeito (append-only, 0—N por dose)
// ---------------------------------------------------------------------------

interface EfeitoRow {
  id: string;
  usuario_id: string;
  registro_uso_id: string;
  tipo: string;
  descricao: string;
  intensidade: number | null;
  duracao_minutos: number | null;
  registrado_em: Date;
  criado_em: Date;
}

const COLUNAS_EFEITO =
  'id, usuario_id, registro_uso_id, tipo, descricao, intensidade, duracao_minutos, registrado_em, criado_em';

const mapearEfeito = (r: EfeitoRow): RegistroDeEfeito =>
  RegistroDeEfeito.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    registroDeUsoId: r.registro_uso_id,
    tipo: r.tipo as TipoDeEfeito,
    descricao: r.descricao,
    intensidade: r.intensidade,
    duracaoMinutos: r.duracao_minutos,
    registradoEm: r.registrado_em,
    criadoEm: r.criado_em,
  });

export class PostgresEfeitoRepository implements EfeitoRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(e: RegistroDeEfeito): Promise<void> {
    await this.pool.query(
      `INSERT INTO med.efeito (${COLUNAS_EFEITO})
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        e.id,
        e.usuarioId,
        e.registroDeUsoId,
        e.tipo,
        e.descricao,
        e.intensidade,
        e.duracaoMinutos,
        e.registradoEm,
        e.criadoEm,
      ],
    );
  }

  async buscarPorId(id: string): Promise<RegistroDeEfeito | null> {
    const { rows } = await this.pool.query<EfeitoRow>(
      `SELECT ${COLUNAS_EFEITO} FROM med.efeito WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearEfeito(rows[0]) : null;
  }

  async listarPorRegistroDeUso(registroDeUsoId: string): Promise<RegistroDeEfeito[]> {
    const { rows } = await this.pool.query<EfeitoRow>(
      `SELECT ${COLUNAS_EFEITO} FROM med.efeito
        WHERE registro_uso_id = $1 ORDER BY registrado_em DESC`,
      [registroDeUsoId],
    );
    return rows.map(mapearEfeito);
  }

  async listarPorTratamento(tratamentoId: string): Promise<RegistroDeEfeito[]> {
    const { rows } = await this.pool.query<EfeitoRow>(
      `SELECT ${COLUNAS_EFEITO.split(', ')
        .map((c) => `ef.${c}`)
        .join(', ')}
         FROM med.efeito ef
         JOIN med.registro_uso ru ON ru.id = ef.registro_uso_id
         JOIN med.produto p ON p.id = ru.produto_id
        WHERE p.tratamento_id = $1
        ORDER BY ef.registrado_em DESC`,
      [tratamentoId],
    );
    return rows.map(mapearEfeito);
  }
}

// ---------------------------------------------------------------------------
// ModeloDeTratamento (Premium)
// ---------------------------------------------------------------------------

interface ModeloRow {
  id: string;
  usuario_id: string;
  nome: string;
  condicao_padrao: string | null;
  objetivo_padrao: string | null;
  notas: string | null;
  criado_em: Date;
}

const COLUNAS_MODELO = 'id, usuario_id, nome, condicao_padrao, objetivo_padrao, notas, criado_em';

const mapearModelo = (r: ModeloRow): ModeloDeTratamento =>
  ModeloDeTratamento.reconstituir({
    id: r.id,
    usuarioId: r.usuario_id,
    nome: r.nome,
    condicaoPadrao: r.condicao_padrao,
    objetivoPadrao: r.objetivo_padrao,
    notas: r.notas,
    criadoEm: r.criado_em,
  });

export class PostgresModeloDeTratamentoRepository implements ModeloDeTratamentoRepository {
  constructor(private readonly pool: Pool) {}

  async salvar(m: ModeloDeTratamento): Promise<void> {
    await this.pool.query(
      `INSERT INTO med.modelo_tratamento (${COLUNAS_MODELO})
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (id) DO UPDATE
         SET nome = EXCLUDED.nome,
             condicao_padrao = EXCLUDED.condicao_padrao,
             objetivo_padrao = EXCLUDED.objetivo_padrao,
             notas = EXCLUDED.notas`,
      [m.id, m.usuarioId, m.nome, m.condicaoPadrao, m.objetivoPadrao, m.notas, m.criadoEm],
    );
  }

  async buscarPorId(id: string): Promise<ModeloDeTratamento | null> {
    const { rows } = await this.pool.query<ModeloRow>(
      `SELECT ${COLUNAS_MODELO} FROM med.modelo_tratamento WHERE id = $1`,
      [id],
    );
    return rows[0] ? mapearModelo(rows[0]) : null;
  }

  async listarPorUsuario(usuarioId: string): Promise<ModeloDeTratamento[]> {
    const { rows } = await this.pool.query<ModeloRow>(
      `SELECT ${COLUNAS_MODELO} FROM med.modelo_tratamento
        WHERE usuario_id = $1 ORDER BY criado_em DESC`,
      [usuarioId],
    );
    return rows.map(mapearModelo);
  }

  async remover(id: string): Promise<void> {
    await this.pool.query('DELETE FROM med.modelo_tratamento WHERE id = $1', [id]);
  }
}
