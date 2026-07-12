import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Pool } from 'pg';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import { criarPgPool } from '@cosmaria/core-infrastructure';
import { AppModule } from '../../apps/api/src/app/app.module';
import { DomainExceptionFilter } from '../../apps/api/src/app/auth/domain-exception.filter';
import { aplicarMigrations, iniciarPostgres, iniciarRedis } from './support/containers';

/**
 * Integração do núcleo do Med (doc 03 §5.1-5.3) contra PostgreSQL real.
 *
 * Prova: persistência no schema `med`; os CHECKs de catálogo/coerência; a série de doses
 * append-only; e o CASCADE encadeado tratamento → produto → registro_uso.
 */
describe('Med núcleo contra Postgres real (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let token = '';

  beforeAll(async () => {
    pg = await iniciarPostgres();
    redis = await iniciarRedis();
    await aplicarMigrations(pg.getConnectionUri());

    process.env.AUTH_REPO = 'postgres';
    process.env.DATABASE_URL = pg.getConnectionUri();
    process.env.REDIS_URL = redis.getConnectionUrl();
    process.env.ACCESS_TOKEN_SECRET = 'test-access';
    process.env.REFRESH_TOKEN_SECRET = 'test-refresh';

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ rawBody: true });
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    pool = criarPgPool(pg.getConnectionUri());

    const cred = { email: 'paciente@cosmaria.app', senha: 'senhaSegura123' };
    await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    token = (await request(app.getHttpServer()).post('/v1/auth/login').send(cred)).body.accessToken;
  }, 180_000);

  afterAll(async () => {
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });
  const server = () => app.getHttpServer();

  const criarTratamentoProdutoDose = async () => {
    const t = await request(server())
      .post('/v1/tratamentos')
      .set(auth())
      .send({ condicao: 'Ansiedade' })
      .expect(201);
    const p = await request(server())
      .post('/v1/produtos')
      .set(auth())
      .send({ tratamentoId: t.body.tratamentoId, nome: 'Óleo CBD', tipo: 'OLEO' })
      .expect(201);
    const r = await request(server())
      .post('/v1/registros-uso')
      .set(auth())
      .send({ produtoId: p.body.produtoId, quantidade: 2.5, unidade: 'ML', via: 'ORAL' })
      .expect(201);
    return {
      tratamentoId: t.body.tratamentoId,
      produtoId: p.body.produtoId,
      doseId: r.body.registroDeUsoId,
    };
  };

  it('persiste tratamento/produto/dose no schema med', async () => {
    const { tratamentoId, produtoId, doseId } = await criarTratamentoProdutoDose();

    const t = await pool.query<{ status: string }>(
      `SELECT status FROM med.tratamento WHERE id = $1`,
      [tratamentoId],
    );
    expect(t.rows[0].status).toBe('ATIVO');

    const p = await pool.query<{ lote_id: string | null }>(
      `SELECT lote_id FROM med.produto WHERE id = $1`,
      [produtoId],
    );
    expect(p.rows[0].lote_id).toBeNull(); // vínculo com o Grow é V2, inerte

    // NUMERIC preserva a quantidade fracionária.
    const r = await pool.query<{ quantidade: string }>(
      `SELECT quantidade FROM med.registro_uso WHERE id = $1`,
      [doseId],
    );
    expect(Number(r.rows[0].quantidade)).toBe(2.5);
  });

  it('o banco recusa tipo de produto fora do catálogo', async () => {
    const t = await request(server())
      .post('/v1/tratamentos')
      .set(auth())
      .send({ condicao: 'x' })
      .expect(201);
    await expect(
      pool.query(
        `INSERT INTO med.produto (id, usuario_id, tratamento_id, nome, tipo)
         VALUES (gen_random_uuid(), gen_random_uuid(), $1, 'x', 'POCAO')`,
        [t.body.tratamentoId],
      ),
    ).rejects.toThrow(/ck_produto_tipo/);
  });

  it('o banco recusa uma via de administração fora do catálogo', async () => {
    const { produtoId } = await criarTratamentoProdutoDose();
    await expect(
      pool.query(
        `INSERT INTO med.registro_uso (id, usuario_id, produto_id, quantidade, unidade, via)
         VALUES (gen_random_uuid(), gen_random_uuid(), $1, 1, 'MG', 'INTRAVENOSA')`,
        [produtoId],
      ),
    ).rejects.toThrow(/ck_registro_uso_via/);
  });

  it('o banco recusa tratamento ENCERRADO sem data de encerramento (coerência de estado)', async () => {
    await expect(
      pool.query(
        `INSERT INTO med.tratamento (id, usuario_id, condicao, status)
         VALUES (gen_random_uuid(), gen_random_uuid(), 'x', 'ENCERRADO')`,
      ),
    ).rejects.toThrow(/ck_tratamento_encerramento/);
  });

  it('a série de doses é append-only na prática (várias doses coexistem)', async () => {
    const { produtoId } = await criarTratamentoProdutoDose();
    await request(server())
      .post('/v1/registros-uso')
      .set(auth())
      .send({ produtoId, quantidade: 5, unidade: 'GOTAS', via: 'SUBLINGUAL' })
      .expect(201);
    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM med.registro_uso WHERE produto_id = $1`,
      [produtoId],
    );
    expect(Number(rows[0].total)).toBe(2);
  });

  it('excluir o tratamento leva produtos e doses juntos (CASCADE encadeado)', async () => {
    const { tratamentoId, produtoId } = await criarTratamentoProdutoDose();
    await pool.query(`DELETE FROM med.tratamento WHERE id = $1`, [tratamentoId]);

    const produtos = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM med.produto WHERE id = $1`,
      [produtoId],
    );
    expect(produtos.rows[0].total).toBe('0');

    const doses = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM med.registro_uso WHERE produto_id = $1`,
      [produtoId],
    );
    expect(doses.rows[0].total).toBe('0');
  });

  it('a sessão antes/depois persiste e é 0—1 por dose (UNIQUE registro_uso_id)', async () => {
    const { doseId } = await criarTratamentoProdutoDose();
    const s = await request(server())
      .post('/v1/sessoes')
      .set(auth())
      .send({
        registroDeUsoId: doseId,
        sintomaAlvo: 'Dor',
        intensidadeAntes: 8,
        intervaloMinutos: 60,
      })
      .expect(201);

    const persistida = await pool.query<{ intensidade_antes: number }>(
      `SELECT intensidade_antes FROM med.sessao_antes_depois WHERE id = $1`,
      [s.body.sessaoId],
    );
    expect(persistida.rows[0].intensidade_antes).toBe(8);

    // Segunda sessão para a mesma dose viola o UNIQUE.
    await expect(
      pool.query(
        `INSERT INTO med.sessao_antes_depois
           (id, usuario_id, registro_uso_id, sintoma_alvo, intensidade_antes, intervalo_minutos)
         VALUES (gen_random_uuid(), gen_random_uuid(), $1, 'Dor', 5, 30)`,
        [doseId],
      ),
    ).rejects.toThrow(/sessao_antes_depois_registro_uso_id_key|duplicate key/);
  });

  it('o banco recusa intensidade fora da escala 0–10', async () => {
    const { doseId } = await criarTratamentoProdutoDose();
    await expect(
      pool.query(
        `INSERT INTO med.sessao_antes_depois
           (id, usuario_id, registro_uso_id, sintoma_alvo, intensidade_antes, intervalo_minutos)
         VALUES (gen_random_uuid(), gen_random_uuid(), $1, 'Dor', 15, 30)`,
        [doseId],
      ),
    ).rejects.toThrow(/ck_sessao_intensidade_antes/);
  });

  it('a sessão some junto com a dose (CASCADE)', async () => {
    const { doseId } = await criarTratamentoProdutoDose();
    await request(server())
      .post('/v1/sessoes')
      .set(auth())
      .send({
        registroDeUsoId: doseId,
        sintomaAlvo: 'Dor',
        intensidadeAntes: 6,
        intervaloMinutos: 45,
      })
      .expect(201);
    await pool.query(`DELETE FROM med.registro_uso WHERE id = $1`, [doseId]);
    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM med.sessao_antes_depois WHERE registro_uso_id = $1`,
      [doseId],
    );
    expect(rows[0].total).toBe('0');
  });

  it('o check-in de linha de base persiste e o banco recusa um vazio', async () => {
    const r = await request(server())
      .post('/v1/sintomas-diarios')
      .set(auth())
      .send({ humor: 6, dor: 3 })
      .expect(201);
    const persistido = await pool.query<{ humor: number | null }>(
      `SELECT humor FROM med.sintoma_diario WHERE id = $1`,
      [r.body.registroId],
    );
    expect(persistido.rows[0].humor).toBe(6);

    // Check-in com todas as dimensões nulas viola o CHECK.
    await expect(
      pool.query(
        `INSERT INTO med.sintoma_diario (id, usuario_id) VALUES (gen_random_uuid(), gen_random_uuid())`,
      ),
    ).rejects.toThrow(/ck_sintoma_ao_menos_uma/);
  });

  it('o efeito persiste, respeita o catálogo e some com a dose (CASCADE)', async () => {
    const { doseId } = await criarTratamentoProdutoDose();
    await request(server())
      .post('/v1/efeitos')
      .set(auth())
      .send({ registroDeUsoId: doseId, tipo: 'ADVERSO', descricao: 'Boca seca' })
      .expect(201);

    await expect(
      pool.query(
        `INSERT INTO med.efeito (id, usuario_id, registro_uso_id, tipo, descricao)
         VALUES (gen_random_uuid(), gen_random_uuid(), $1, 'NEUTRO', 'x')`,
        [doseId],
      ),
    ).rejects.toThrow(/ck_efeito_tipo/);

    await pool.query(`DELETE FROM med.registro_uso WHERE id = $1`, [doseId]);
    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM med.efeito WHERE registro_uso_id = $1`,
      [doseId],
    );
    expect(rows[0].total).toBe('0');
  });

  it('a tabela de modelos de tratamento existe e persiste um registro', async () => {
    const { rows } = await pool.query<{ nome: string }>(
      `INSERT INTO med.modelo_tratamento (id, usuario_id, nome, condicao_padrao)
       VALUES (gen_random_uuid(), gen_random_uuid(), 'Protocolo X', 'Dor')
       RETURNING nome`,
    );
    expect(rows[0].nome).toBe('Protocolo X');
  });
});
