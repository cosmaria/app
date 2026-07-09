import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Pool } from 'pg';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import { criarPgPool } from '@cosmaria/core-infrastructure';
import { ContextoDeApp } from '@cosmaria/core-domain';
import { PERFIL_PUBLIC_API, type PerfilPublicApi } from '@cosmaria/core-public-api';
import { AppModule } from '../../apps/api/src/app/app.module';
import { DomainExceptionFilter } from '../../apps/api/src/app/auth/domain-exception.filter';
import { aplicarMigrations, iniciarPostgres, iniciarRedis } from './support/containers';

/**
 * Integração da Identidade Social (doc 06) contra PostgreSQL real.
 *
 * Prova, com o schema criado pela migration versionada: a chave natural
 * (usuario_id, contexto) tornando a criação lazy idempotente sob concorrência real; o
 * isolamento entre contextos; o vínculo de perfis com arrays Postgres; e o rastro na
 * TrilhaDeAuditoria produzido pelo barramento de eventos (EDA ponta a ponta).
 */
describe('Identidade Social contra Postgres real (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let perfis: PerfilPublicApi;
  let usuarioId: string;
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
    // Versão 2 ligada só neste teste, para exercitar o modelo já pronto (doc 06).
    process.env.FEATURE_VINCULO_DE_PERFIS = 'true';

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    pool = criarPgPool(pg.getConnectionUri());
    perfis = app.get<PerfilPublicApi>(PERFIL_PUBLIC_API);

    const cred = { email: 'social@cosmaria.app', senha: 'senhaSegura123' };
    const reg = await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    usuarioId = reg.body.usuarioId;
    const login = await request(app.getHttpServer()).post('/v1/auth/login').send(cred);
    token = login.body.accessToken;
  }, 180_000);

  afterAll(async () => {
    delete process.env.FEATURE_VINCULO_DE_PERFIS;
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  let perfilGrowId = '';
  let perfilMedId = '';

  it('cria o perfil lazy e persiste anônimo no schema core', async () => {
    const view = await perfis.obterOuCriar(usuarioId, ContextoDeApp.GROW);
    perfilGrowId = view.perfilId;

    const { rows } = await pool.query<{
      contexto: string;
      nome_exibicao: string | null;
      usuario_id: string;
    }>(`SELECT contexto, nome_exibicao, usuario_id FROM core.perfil_publico WHERE id = $1`, [
      perfilGrowId,
    ]);
    expect(rows[0].contexto).toBe('GROW');
    expect(rows[0].nome_exibicao).toBeNull();
    expect(rows[0].usuario_id).toBe(usuarioId);
  });

  it('a criação lazy concorrente é idempotente (chave natural usuario_id+contexto)', async () => {
    const resultados = await Promise.all([
      perfis.obterOuCriar(usuarioId, ContextoDeApp.GROW),
      perfis.obterOuCriar(usuarioId, ContextoDeApp.GROW),
      perfis.obterOuCriar(usuarioId, ContextoDeApp.GROW),
    ]);
    expect(new Set(resultados.map((r) => r.perfilId)).size).toBe(1);

    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM core.perfil_publico WHERE usuario_id = $1 AND contexto = 'GROW'`,
      [usuarioId],
    );
    expect(rows[0].total).toBe('1');
  });

  it('o perfil do Med é uma linha independente da mesma Conta', async () => {
    const view = await perfis.obterOuCriar(usuarioId, ContextoDeApp.MED);
    perfilMedId = view.perfilId;
    expect(perfilMedId).not.toBe(perfilGrowId);

    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM core.perfil_publico WHERE usuario_id = $1`,
      [usuarioId],
    );
    expect(rows[0].total).toBe('2');
  });

  it('sem vínculo, nenhuma consulta cruza contextos da mesma Conta (doc 06 §13)', async () => {
    await expect(perfis.perfisVinculadosPublicamente(perfilGrowId)).resolves.toEqual([]);
    await expect(perfis.perfisVinculadosPublicamente(perfilMedId)).resolves.toEqual([]);
  });

  it('edita o perfil do Grow via HTTP sem tocar no do Med', async () => {
    await request(app.getHttpServer())
      .put('/v1/comunidade/perfis/grow')
      .set('Authorization', `Bearer ${token}`)
      .send({ nomeExibicao: 'Cultivador Alpha' })
      .expect(200);

    const { rows } = await pool.query<{ contexto: string; nome_exibicao: string | null }>(
      `SELECT contexto, nome_exibicao FROM core.perfil_publico WHERE usuario_id = $1 ORDER BY contexto`,
      [usuarioId],
    );
    expect(rows).toEqual([
      { contexto: 'GROW', nome_exibicao: 'Cultivador Alpha' },
      { contexto: 'MED', nome_exibicao: null },
    ]);
  });

  let vinculoId = '';

  it('autoriza o vínculo, persiste os arrays e audita o evento', async () => {
    const resposta = await request(app.getHttpServer())
      .post('/v1/comunidade/vinculo-perfis')
      .set('Authorization', `Bearer ${token}`)
      .send({ perfilIds: [perfilGrowId, perfilMedId], visivelEm: ['MED'] })
      .expect(201);
    vinculoId = resposta.body.vinculoId;

    const { rows } = await pool.query<{ perfil_ids: string[]; visivel_em: string[] }>(
      `SELECT perfil_ids, visivel_em FROM core.registro_vinculo_perfis WHERE id = $1`,
      [vinculoId],
    );
    expect(rows[0].perfil_ids.sort()).toEqual([perfilGrowId, perfilMedId].sort());
    expect(rows[0].visivel_em).toEqual(['MED']);

    // EDA ponta a ponta: o evento chegou ao assinante de auditoria (doc 08 §7).
    const trilha = await pool.query<{ acao: string; detalhe: Record<string, unknown> }>(
      `SELECT acao, detalhe FROM core.trilha_de_auditoria
        WHERE entidade_afetada = 'RegistroDeVinculoDePerfis' AND entidade_id = $1`,
      [vinculoId],
    );
    expect(trilha.rows).toHaveLength(1);
    expect(trilha.rows[0].acao).toBe('AUTORIZADO');
    // A trilha guarda a quantidade, nunca os ids — ela própria não cruza contextos.
    expect(trilha.rows[0].detalhe).toEqual({ quantidadePerfis: 2 });
  });

  it('revelação parcial: o vínculo aparece no Med, nunca no Grow (doc 06 §18)', async () => {
    const doMed = await perfis.perfisVinculadosPublicamente(perfilMedId);
    expect(doMed.map((p) => p.perfilId)).toEqual([perfilGrowId]);

    const doGrow = await perfis.perfisVinculadosPublicamente(perfilGrowId);
    expect(doGrow).toEqual([]);
  });

  it('revogar apaga a revelação imediatamente e deixa rastro na trilha', async () => {
    await request(app.getHttpServer())
      .delete(`/v1/comunidade/vinculo-perfis/${vinculoId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    await expect(perfis.perfisVinculadosPublicamente(perfilMedId)).resolves.toEqual([]);

    const { rows } = await pool.query<{ acao: string }>(
      `SELECT acao FROM core.trilha_de_auditoria
        WHERE entidade_afetada = 'RegistroDeVinculoDePerfis' AND entidade_id = $1
        ORDER BY registrado_em`,
      [vinculoId],
    );
    expect(rows.map((r) => r.acao)).toEqual(['AUTORIZADO', 'REVOGADO']);
  });

  it('o perfil é apagado junto com a Conta (ON DELETE CASCADE)', async () => {
    await pool.query(`DELETE FROM core.usuario WHERE id = $1`, [usuarioId]);
    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM core.perfil_publico WHERE usuario_id = $1`,
      [usuarioId],
    );
    expect(rows[0].total).toBe('0');

    // A trilha de auditoria sobrevive à exclusão da conta (append-only, sem FK de autor).
    const trilha = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM core.trilha_de_auditoria WHERE autor_id = $1`,
      [usuarioId],
    );
    expect(Number(trilha.rows[0].total)).toBeGreaterThan(0);
  });
});
