import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Pool } from 'pg';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import { assinarPayloadWebhook, criarPgPool } from '@cosmaria/core-infrastructure';
import { CACHE_PORT, type CachePort } from '@cosmaria/core-application';
import { ChavesDeLimite } from '@cosmaria/core-domain';
import { PREMIUM_PUBLIC_API, type PremiumPublicApi } from '@cosmaria/core-public-api';
import { AppModule } from '../../apps/api/src/app/app.module';
import { DomainExceptionFilter } from '../../apps/api/src/app/auth/domain-exception.filter';
import { aplicarMigrations, iniciarPostgres, iniciarRedis } from './support/containers';

const SEGREDO = 'segredo-de-integracao';
const CABECALHO = 'x-cosmaria-assinatura';

/**
 * Integração de Billing & Premium (doc 07) contra PostgreSQL e Redis reais.
 *
 * Prova o que só o ambiente real prova: a configuração de `LimiteDePlano` vem da
 * migration (não de constante de código), a idempotência do webhook usa o `SET NX` do
 * Redis, e a mudança de status da assinatura deixa rastro na TrilhaDeAuditoria via
 * barramento de eventos (EDA ponta a ponta).
 */
describe('Billing & Premium contra Postgres/Redis reais (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let premium: PremiumPublicApi;
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
    premium = app.get<PremiumPublicApi>(PREMIUM_PUBLIC_API);

    const cred = { email: 'billing@cosmaria.app', senha: 'senhaSegura123' };
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

  const enviarWebhook = (payload: object, segredo = SEGREDO) => {
    const corpoTexto = JSON.stringify(payload);
    return request(app.getHttpServer())
      .post('/v1/webhooks/pagamento')
      .set('Content-Type', 'application/json')
      .set(CABECALHO, assinarPayloadWebhook(Buffer.from(corpoTexto), segredo))
      .send(corpoTexto);
  };

  it('a migration entrega a configuração de limites — não uma constante de código', async () => {
    const { rows } = await pool.query<{ plano: string; valor: number | null }>(
      `SELECT plano, valor FROM core.limite_de_plano WHERE chave = $1 ORDER BY plano`,
      [ChavesDeLimite.GROW_AMBIENTES_SIMULTANEOS],
    );
    expect(rows).toEqual([
      { plano: 'GRATUITO', valor: 2 },
      { plano: 'PREMIUM', valor: null },
    ]);
  });

  it('o trial nasce desligado (decisão de negócio, não de arquitetura)', async () => {
    const { rows } = await pool.query<{ ativo: boolean; duracao_dias: number }>(
      `SELECT ativo, duracao_dias FROM core.periodo_gratuito_configuracao WHERE plano = 'PREMIUM'`,
    );
    expect(rows[0]).toEqual({ ativo: false, duracao_dias: 0 });
  });

  it('a assinatura gratuita é criada lazy e persiste no schema core', async () => {
    await request(app.getHttpServer())
      .get('/v1/assinatura')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((r) => expect(r.body.plano).toBe('GRATUITO'));

    const { rows } = await pool.query<{ plano: string; status: string }>(
      `SELECT plano, status FROM core.assinatura_premium WHERE usuario_id = $1`,
      [usuarioId],
    );
    expect(rows).toEqual([{ plano: 'GRATUITO', status: 'ATIVA' }]);
  });

  it('a criação lazy concorrente converge para uma única linha (UNIQUE usuario_id)', async () => {
    await Promise.all([
      premium.ehPremium(usuarioId),
      premium.ehPremium(usuarioId),
      premium.ehPremium(usuarioId),
    ]);
    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM core.assinatura_premium WHERE usuario_id = $1`,
      [usuarioId],
    );
    expect(rows[0].total).toBe('1');
  });

  it('sem PrecoRegional configurado, o upgrade recusa em vez de arbitrar um valor', async () => {
    await request(app.getHttpServer())
      .post('/v1/assinatura/upgrade')
      .set('Authorization', `Bearer ${token}`)
      .send({ ciclo: 'MENSAL', pais: 'BR' })
      .expect(400)
      .expect((r) => expect(r.body.code).toBe('PRECO_NAO_CONFIGURADO'));
  });

  it('configurar o preço é um INSERT — nenhum deploy, nenhuma migration nova', async () => {
    await pool.query(
      `INSERT INTO core.preco_regional (id, pais, moeda, plano, ciclo, valor_centavos)
       VALUES (gen_random_uuid(), 'BR', 'BRL', 'PREMIUM', 'MENSAL', 2990)`,
    );

    const resposta = await request(app.getHttpServer())
      .post('/v1/assinatura/upgrade')
      .set('Authorization', `Bearer ${token}`)
      .send({ ciclo: 'MENSAL', pais: 'BR' })
      .expect(202);

    expect(resposta.body.checkout.urlCheckout).toContain('valor=2990');
    // Upgrade NÃO concede Premium: o gateway ainda não confirmou nada.
    expect(resposta.body.assinatura.status).toBe('PENDENTE_PAGAMENTO');
    expect(resposta.body.assinatura.premiumAtivo).toBe(false);
    expect(await premium.ehPremium(usuarioId)).toBe(false);
  });

  it('o gate de limites usa o plano efetivo, não o contratado', async () => {
    const resultado = await premium.verificarLimite(
      usuarioId,
      ChavesDeLimite.GROW_AMBIENTES_SIMULTANEOS,
      2,
    );
    expect(resultado.permitido).toBe(false);
    expect(resultado.limite).toBe(2);
  });

  it('o webhook assinado concede Premium e o desbloqueio vale para todos os apps', async () => {
    await enviarWebhook({
      id: 'evt-integ-1',
      tipo: 'PAGAMENTO_RECEBIDO',
      usuarioId,
      vigenteAte: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    })
      .expect(200)
      .expect((r) => expect(r.body.processado).toBe(true));

    expect(await premium.ehPremium(usuarioId)).toBe(true);

    const semLimite = await premium.verificarLimite(
      usuarioId,
      ChavesDeLimite.GROW_AMBIENTES_SIMULTANEOS,
      9999,
    );
    expect(semLimite.permitido).toBe(true);
    expect(semLimite.limite).toBeNull();
  });

  it('a reentrega do mesmo evento é barrada pelo SET NX do Redis real', async () => {
    const { rows: antes } = await pool.query<{ vigente_ate: Date }>(
      `SELECT vigente_ate FROM core.assinatura_premium WHERE usuario_id = $1`,
      [usuarioId],
    );

    await enviarWebhook({
      id: 'evt-integ-1',
      tipo: 'PAGAMENTO_RECEBIDO',
      usuarioId,
      vigenteAte: new Date(Date.now() + 60 * 86_400_000).toISOString(),
    })
      .expect(200)
      .expect((r) => expect(r.body.processado).toBe(false));

    const { rows: depois } = await pool.query<{ vigente_ate: Date }>(
      `SELECT vigente_ate FROM core.assinatura_premium WHERE usuario_id = $1`,
      [usuarioId],
    );
    // A reentrega NÃO estendeu a assinatura por mais 30 dias.
    expect(depois[0].vigente_ate).toEqual(antes[0].vigente_ate);
  });

  it('a chave de idempotência vive no Redis real, não em memória do processo', async () => {
    const cache = app.get<CachePort>(CACHE_PORT);
    expect(await cache.get('idempotencia:pagamento:evt-integ-1')).toBe('1');
  });

  it('toda mudança de status da assinatura deixa rastro na TrilhaDeAuditoria', async () => {
    const { rows } = await pool.query<{ acao: string; detalhe: Record<string, unknown> }>(
      `SELECT acao, detalhe FROM core.trilha_de_auditoria
        WHERE entidade_afetada = 'AssinaturaPremium' ORDER BY registrado_em`,
    );
    const acoes = rows.map((r) => r.acao);
    expect(acoes).toContain('STATUS_PENDENTE_PAGAMENTO');
    expect(acoes).toContain('STATUS_ATIVA');
    expect(rows[rows.length - 1].detalhe).toHaveProperty('plano', 'PREMIUM');
  });

  it('cancelar mantém o período pago; falha de pagamento suspende', async () => {
    await request(app.getHttpServer())
      .post('/v1/assinatura/cancelar')
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect((r) => {
        expect(r.body.status).toBe('CANCELADA');
        expect(r.body.premiumAtivo).toBe(true);
      });

    await enviarWebhook({
      id: 'evt-integ-2',
      tipo: 'PAGAMENTO_FALHOU',
      usuarioId,
      motivo: 'cartao_recusado',
    }).expect(200);

    expect(await premium.ehPremium(usuarioId)).toBe(false);
  });

  it('a assinatura é apagada junto com a Conta (ON DELETE CASCADE)', async () => {
    await pool.query(`DELETE FROM core.usuario WHERE id = $1`, [usuarioId]);
    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM core.assinatura_premium WHERE usuario_id = $1`,
      [usuarioId],
    );
    expect(rows[0].total).toBe('0');
  });
});
