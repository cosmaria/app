import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Pool } from 'pg';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import { assinarPayloadWebhook, criarPgPool } from '@cosmaria/core-infrastructure';
import { AppModule } from '../../apps/api/src/app/app.module';
import { DomainExceptionFilter } from '../../apps/api/src/app/auth/domain-exception.filter';
import {
  aguardarAte,
  aplicarMigrations,
  iniciarPostgres,
  iniciarRedis,
} from './support/containers';

const SEGREDO = 'segredo-de-integracao';

/**
 * Integração de Notificações (doc 04 §15) contra PostgreSQL e Redis reais.
 *
 * Prova o que só o ambiente real prova: preferências e notificações persistem no schema
 * `core` (JSONB e arrays), o anti-spam usa o `SET NX` do Redis, e o evento de Billing
 * atravessa o barramento até virar linha em `core.notificacao`.
 */
describe('Notificações contra Postgres/Redis reais (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
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
    process.env.OUTBOX_POLL_MS = '50'; // efeitos de consumidores de eventos são assíncronos
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

    const cred = { email: 'notif@cosmaria.app', senha: 'senhaSegura123' };
    const reg = await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    usuarioId = reg.body.usuarioId;
    const login = await request(app.getHttpServer()).post('/v1/auth/login').send(cred);
    token = login.body.accessToken;
  }, 180_000);

  afterAll(async () => {
    delete process.env.PAGAMENTO_WEBHOOK_SECRET;
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  const enviarWebhook = (payload: object) => {
    const corpo = JSON.stringify(payload);
    return request(app.getHttpServer())
      .post('/v1/webhooks/pagamento')
      .set('Content-Type', 'application/json')
      .set('x-cosmaria-assinatura', assinarPayloadWebhook(Buffer.from(corpo), SEGREDO))
      .send(corpo);
  };

  it('a preferência padrão é criada lazy e persiste com fuso UTC', async () => {
    await request(app.getHttpServer())
      .get('/v1/preferencia-notificacao')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const { rows } = await pool.query<{ fuso_horario: string; modo_discreto: boolean }>(
      `SELECT fuso_horario, modo_discreto FROM core.preferencia_de_notificacao WHERE usuario_id = $1`,
      [usuarioId],
    );
    expect(rows[0]).toEqual({ fuso_horario: 'UTC', modo_discreto: false });
  });

  it('canais por categoria persistem como JSONB', async () => {
    await request(app.getHttpServer())
      .put('/v1/preferencia-notificacao')
      .set('Authorization', `Bearer ${token}`)
      .send({
        fusoHorario: 'America/Sao_Paulo',
        canaisPorCategoria: [{ categoria: 'BILLING', canais: ['IN_APP', 'PUSH'] }],
      })
      .expect(200);

    const { rows } = await pool.query<{ canais_por_categoria: Record<string, string[]> }>(
      `SELECT canais_por_categoria FROM core.preferencia_de_notificacao WHERE usuario_id = $1`,
      [usuarioId],
    );
    expect(rows[0].canais_por_categoria).toEqual({ BILLING: ['IN_APP', 'PUSH'] });
  });

  it('o banco recusa horário de silêncio fora do dia (defesa em profundidade)', async () => {
    await expect(
      pool.query(
        `UPDATE core.preferencia_de_notificacao SET silencio_inicio_minutos = 1440 WHERE usuario_id = $1`,
        [usuarioId],
      ),
    ).rejects.toThrow(/ck_silencio_inicio/);
  });

  it('o evento do webhook atravessa o barramento e vira linha em core.notificacao', async () => {
    await enviarWebhook({
      id: 'evt-notif-integ-1',
      tipo: 'PAGAMENTO_RECEBIDO',
      usuarioId,
      vigenteAte: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    }).expect(200);

    // A notificação nasce de um evento (PagamentoRecebido) entregue de forma assíncrona (outbox).
    const consultar = () =>
      pool.query<{
        categoria: string;
        titulo: string;
        status: string;
        canais_despachados: string[];
      }>(
        `SELECT categoria, titulo, status, canais_despachados FROM core.notificacao
          WHERE usuario_id = $1`,
        [usuarioId],
      );
    await aguardarAte(async () => (await consultar()).rows.length === 1);

    const { rows } = await consultar();
    expect(rows).toHaveLength(1);
    expect(rows[0].categoria).toBe('BILLING');
    expect(rows[0].titulo).toContain('Premium está ativo');
    // A preferência habilitou PUSH para BILLING, e o despachante de dev o suporta.
    expect(rows[0].canais_despachados).toEqual(['PUSH']);
    expect(rows[0].status).toBe('ENVIADA');
  });

  it('o anti-spam do Redis real impede o segundo envio externo, mas registra na Central', async () => {
    // Mesma chave de agrupamento (assinatura:ATIVA) dentro da janela.
    await enviarWebhook({
      id: 'evt-notif-integ-2',
      tipo: 'PAGAMENTO_RECEBIDO',
      usuarioId,
      vigenteAte: new Date(Date.now() + 60 * 86_400_000).toISOString(),
    }).expect(200);

    const consultar = () =>
      pool.query<{ status: string }>(`SELECT status FROM core.notificacao WHERE usuario_id = $1`, [
        usuarioId,
      ]);
    await aguardarAte(async () => (await consultar()).rows.length === 2);

    const { rows } = await consultar();
    // Duas notificações registradas; só a primeira saiu por canal externo.
    expect(rows).toHaveLength(2);
    expect(rows.filter((r) => r.status === 'ENVIADA')).toHaveLength(1);
    expect(rows.filter((r) => r.status === 'SILENCIADA')).toHaveLength(1);
  });

  it('a Central pagina e conta as não lidas pelo índice parcial', async () => {
    const central = () =>
      request(app.getHttpServer())
        .get('/v1/notificacoes?limite=1')
        .set('Authorization', `Bearer ${token}`);
    await aguardarAte(async () => (await central()).body.naoLidas === 2);

    const resposta = await central().expect(200);
    expect(resposta.body.itens).toHaveLength(1);
    expect(resposta.body.naoLidas).toBe(2);
  });

  it('marcar como lida persiste lida_em', async () => {
    const central = await request(app.getHttpServer())
      .get('/v1/notificacoes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const id = central.body.itens[0].notificacaoId;

    await request(app.getHttpServer())
      .post(`/v1/notificacoes/${id}/ler`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const { rows } = await pool.query<{ lida_em: Date | null }>(
      `SELECT lida_em FROM core.notificacao WHERE id = $1`,
      [id],
    );
    expect(rows[0].lida_em).not.toBeNull();
  });

  it('notificações e preferências somem junto com a Conta (ON DELETE CASCADE)', async () => {
    await pool.query(`DELETE FROM core.usuario WHERE id = $1`, [usuarioId]);

    const notificacoes = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM core.notificacao WHERE usuario_id = $1`,
      [usuarioId],
    );
    const preferencias = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM core.preferencia_de_notificacao WHERE usuario_id = $1`,
      [usuarioId],
    );
    expect(notificacoes.rows[0].total).toBe('0');
    expect(preferencias.rows[0].total).toBe('0');
  });
});
