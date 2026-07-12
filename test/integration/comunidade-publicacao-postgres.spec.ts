import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Pool } from 'pg';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import { assinarPayloadWebhook, criarPgPool } from '@cosmaria/core-infrastructure';
import { AppModule } from '../../apps/api/src/app/app.module';
import { DomainExceptionFilter } from '../../apps/api/src/app/auth/domain-exception.filter';
import { aplicarMigrations, iniciarPostgres, iniciarRedis } from './support/containers';

/**
 * Integração da Comunidade (doc 06) contra PostgreSQL real.
 *
 * Prova: a projeção grava no schema `comunidade` a partir do evento de publicação do Grow;
 * o snapshot de dimensões volta do JSONB; a UNIQUE (modulo, conteudo_id) torna a projeção
 * idempotente; e o CHECK de contexto/escopo rejeita valores fora do catálogo.
 */
describe('Comunidade contra Postgres real (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let token = '';
  let tokenViewer = '';
  let usuarioId = '';
  const SEGREDO = 'segredo-com-integracao';

  beforeAll(async () => {
    pg = await iniciarPostgres();
    redis = await iniciarRedis();
    await aplicarMigrations(pg.getConnectionUri());

    process.env.AUTH_REPO = 'postgres';
    process.env.DATABASE_URL = pg.getConnectionUri();
    process.env.REDIS_URL = redis.getConnectionUrl();
    process.env.ACCESS_TOKEN_SECRET = 'test-access';
    process.env.REFRESH_TOKEN_SECRET = 'test-refresh';
    process.env.PAGAMENTO_WEBHOOK_SECRET = SEGREDO;

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ rawBody: true });
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    pool = criarPgPool(pg.getConnectionUri());

    const cred = { email: 'com-int@cosmaria.app', senha: 'senhaSegura123' };
    const reg = await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    usuarioId = reg.body.usuarioId;
    token = (await request(app.getHttpServer()).post('/v1/auth/login').send(cred)).body.accessToken;

    const credViewer = { email: 'com-int-viewer@cosmaria.app', senha: 'senhaSegura123' };
    await request(app.getHttpServer()).post('/v1/auth/register').send(credViewer);
    tokenViewer = (await request(app.getHttpServer()).post('/v1/auth/login').send(credViewer)).body
      .accessToken;
  }, 180_000);

  afterAll(async () => {
    delete process.env.PAGAMENTO_WEBHOOK_SECRET;
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });
  const server = () => app.getHttpServer();

  let ambienteId = '';

  // Um único ambiente reaproveitado (free tier: 2 ambientes simultâneos).
  const publicarNovoCiclo = async (nome: string, corpo: Record<string, unknown>) => {
    if (!ambienteId) {
      const ambiente = await request(server())
        .post('/v1/ambientes')
        .set(auth())
        .send({ nome: 'Ambiente de integração', tipo: 'INDOOR' });
      ambienteId = ambiente.body.ambienteId;
    }
    const ciclo = await request(server()).post('/v1/ciclos').set(auth()).send({ ambienteId, nome });
    await request(server())
      .post(`/v1/ciclos/${ciclo.body.cicloId}/publicar`)
      .set(auth())
      .send(corpo)
      .expect(201);
    return ciclo.body.cicloId as string;
  };

  it('projeta a publicação no schema comunidade com dimensões em JSONB', async () => {
    const cicloId = await publicarNovoCiclo('Cultivo Postgres', {
      escopo: 'PUBLICO',
      titulo: 'LED Samsung',
      dimensoes: { led: 'Samsung LM301', genetica: 'Gelato' },
    });

    const { rows } = await pool.query(
      `SELECT contexto, modulo, escopo, titulo, dimensoes
         FROM comunidade.publicacao WHERE conteudo_id = $1`,
      [cicloId],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].contexto).toBe('GROW');
    expect(rows[0].escopo).toBe('PUBLICO');
    expect(rows[0].dimensoes).toEqual({ led: 'Samsung LM301', genetica: 'Gelato' });

    const feed = await request(server())
      .get('/v1/comunidade/feed?contexto=grow')
      .set(auth())
      .expect(200);
    expect(feed.body.some((p: { conteudoId: string }) => p.conteudoId === cicloId)).toBe(true);
  });

  it('republicar não duplica (UNIQUE modulo + conteudo_id)', async () => {
    const cicloId = await publicarNovoCiclo('Cultivo idempotente', { escopo: 'PUBLICO' });
    await request(server())
      .post(`/v1/ciclos/${cicloId}/publicar`)
      .set(auth())
      .send({ escopo: 'SEGUIDORES', titulo: 'Reeditado' })
      .expect(201);

    const { rows } = await pool.query(
      `SELECT escopo, titulo FROM comunidade.publicacao WHERE conteudo_id = $1`,
      [cicloId],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].escopo).toBe('SEGUIDORES');
    expect(rows[0].titulo).toBe('Reeditado');
  });

  it('busca estruturada casa dimensão via JSONB (->> ILIKE)', async () => {
    const cicloId = await publicarNovoCiclo('Cultivo indexado', {
      escopo: 'PUBLICO',
      dimensoes: { genetica: 'Northern Lights' },
    });
    const achou = await request(server())
      .get('/v1/comunidade/busca?contexto=grow&chave=genetica&valor=northern')
      .set(auth())
      .expect(200);
    expect(achou.body.some((p: { conteudoId: string }) => p.conteudoId === cicloId)).toBe(true);
  });

  it('curtir/comentar mexem nos contadores denormalizados e no CASCADE', async () => {
    const cicloId = await publicarNovoCiclo('Cultivo interagido', { escopo: 'PUBLICO' });
    const feed = await request(server())
      .get('/v1/comunidade/feed?contexto=grow')
      .set(auth())
      .expect(200);
    const pubId = feed.body.find((p: { conteudoId: string }) => p.conteudoId === cicloId)
      .publicacaoId as string;

    await request(server())
      .post(`/v1/comunidade/publicacoes/${pubId}/curtir`)
      .set(auth())
      .expect(204);
    await request(server())
      .post(`/v1/comunidade/publicacoes/${pubId}/comentarios`)
      .set(auth())
      .send({ texto: 'contra Postgres' })
      .expect(201);

    const contadores = await pool.query(
      `SELECT curtidas, comentarios FROM comunidade.publicacao WHERE id = $1`,
      [pubId],
    );
    expect(Number(contadores.rows[0].curtidas)).toBe(1);
    expect(Number(contadores.rows[0].comentarios)).toBe(1);

    // CASCADE: apagar a publicação remove curtidas e comentários.
    await pool.query(`DELETE FROM comunidade.publicacao WHERE id = $1`, [pubId]);
    const curtidas = await pool.query(`SELECT 1 FROM comunidade.curtida WHERE publicacao_id = $1`, [
      pubId,
    ]);
    const comentarios = await pool.query(
      `SELECT 1 FROM comunidade.comentario WHERE publicacao_id = $1`,
      [pubId],
    );
    expect(curtidas.rowCount).toBe(0);
    expect(comentarios.rowCount).toBe(0);
  });

  it('forkar registra a atribuição no schema comunidade', async () => {
    const cicloId = await publicarNovoCiclo('Cultivo para fork', {
      escopo: 'PUBLICO',
      titulo: 'Base',
    });
    const feed = await request(server())
      .get('/v1/comunidade/feed?contexto=grow')
      .set(auth())
      .expect(200);
    const pubId = feed.body.find((p: { conteudoId: string }) => p.conteudoId === cicloId)
      .publicacaoId as string;

    const fork = await request(server())
      .post(`/v1/comunidade/publicacoes/${pubId}/fork`)
      .set(auth())
      .expect(201);
    expect(fork.body.conteudoOrigemId).toBe(cicloId);

    const { rows } = await pool.query(
      `SELECT conteudo_origem_id, contexto FROM comunidade.registro_de_fork WHERE publicacao_origem_id = $1`,
      [pubId],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].conteudo_origem_id).toBe(cicloId);
    expect(rows[0].contexto).toBe('GROW');
  });

  it('reputação agrega os contadores do perfil via Postgres', async () => {
    const cicloId = await publicarNovoCiclo('Cultivo reputado', { escopo: 'PUBLICO' });
    const feed = await request(server())
      .get('/v1/comunidade/feed?contexto=grow')
      .set(auth())
      .expect(200);
    const pub = feed.body.find((p: { conteudoId: string }) => p.conteudoId === cicloId);
    const perfilId = pub.perfilPublicoId as string;

    await request(server())
      .post(`/v1/comunidade/publicacoes/${pub.publicacaoId}/curtir`)
      .set(auth())
      .expect(204);

    const rep = await request(server())
      .get(`/v1/comunidade/perfis/${perfilId}/reputacao`)
      .set(auth())
      .expect(200);
    expect(rep.body.publicacoes).toBeGreaterThan(0);
    expect(rep.body.curtidasRecebidas).toBeGreaterThanOrEqual(1);
    expect(rep.body.pontuacao).toBeGreaterThan(0);
  });

  it('o CHECK impede seguir a si mesmo', async () => {
    await expect(
      pool.query(
        `INSERT INTO comunidade.seguimento (id, seguidor_perfil_id, seguido_perfil_id, contexto, criado_em)
         VALUES (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'GROW', now())`,
      ),
    ).rejects.toThrow();
  });

  it('estatísticas de perfil: visita agregada em Postgres + gate Premium', async () => {
    const cicloId = await publicarNovoCiclo('Cultivo com estatística', { escopo: 'PUBLICO' });
    const feed = await request(server())
      .get('/v1/comunidade/feed?contexto=grow')
      .set(auth())
      .expect(200);
    const perfilId = feed.body.find((p: { conteudoId: string }) => p.conteudoId === cicloId)
      .perfilPublicoId as string;

    const viewer = () => ({ Authorization: `Bearer ${tokenViewer}` });
    await request(server())
      .post(`/v1/comunidade/perfis/${perfilId}/visualizacao`)
      .set(viewer())
      .expect(204);

    const { rows } = await pool.query(
      `SELECT total FROM comunidade.visualizacao_de_perfil WHERE perfil_id = $1`,
      [perfilId],
    );
    expect(rows).toHaveLength(1);
    expect(Number(rows[0].total)).toBeGreaterThanOrEqual(1);

    // Dono gratuito: 402.
    await request(server())
      .get(`/v1/comunidade/perfis/${perfilId}/estatisticas`)
      .set(auth())
      .expect(402);

    // Concede Premium pelo webhook assinado e lê as estatísticas.
    const corpo = JSON.stringify({
      id: 'evt-com-int-premium',
      tipo: 'PAGAMENTO_RECEBIDO',
      usuarioId,
      vigenteAte: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    });
    await request(server())
      .post('/v1/webhooks/pagamento')
      .set('Content-Type', 'application/json')
      .set('x-cosmaria-assinatura', assinarPayloadWebhook(Buffer.from(corpo), SEGREDO))
      .send(corpo)
      .expect(200);

    const stats = await request(server())
      .get(`/v1/comunidade/perfis/${perfilId}/estatisticas`)
      .set(auth())
      .expect(200);
    expect(stats.body.visualizacoesTotais).toBeGreaterThanOrEqual(1);
  });

  it('o CHECK de escopo rejeita valor fora do catálogo', async () => {
    await expect(
      pool.query(
        `INSERT INTO comunidade.publicacao
           (id, perfil_publico_id, contexto, modulo, tipo_conteudo, conteudo_id, escopo, dimensoes, publicado_em, atualizado_em)
         VALUES (gen_random_uuid(), gen_random_uuid(), 'GROW', 'grow', 'ciclo', gen_random_uuid(), 'INVALIDO', '{}'::jsonb, now(), now())`,
      ),
    ).rejects.toThrow();
  });
});
