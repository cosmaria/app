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
 * Integração fina Grow↔Med↔IA (doc 12 passo 5) contra PostgreSQL real — o payoff da
 * arquitetura. Prova o fluxo inteiro: o usuário cultiva (Grow gera um Lote e séries de VPD),
 * trata (Med gera séries de DOR), vincula opt-in um produto ao lote, e a IA — que ingeriu os
 * eventos dos dois apps na MESMA série do usuário — devolve a correlação cruzada Grow×Med.
 * Sem o opt-in, a análise cruzada é recusada (403, integração sempre opt-in, doc 00).
 */
describe('Grow×Med×IA — integração fina (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let token = '';
  let usuarioId = '';

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

    const cred = { email: 'integra@cosmaria.app', senha: 'senhaSegura123' };
    const reg = await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    usuarioId = reg.body.usuarioId;
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

  let loteId = '';
  let produtoId = '';

  it('monta um cultivo (Grow) até gerar o Lote', async () => {
    const g = await request(server())
      .post('/v1/geneticas')
      .set(auth())
      .send({ nome: 'OG', tipo: 'FOTOPERIODICA' });
    const a = await request(server())
      .post('/v1/ambientes')
      .set(auth())
      .send({ nome: 'Estufa', tipo: 'INDOOR' });
    const c = await request(server())
      .post('/v1/ciclos')
      .set(auth())
      .send({ ambienteId: a.body.ambienteId, nome: 'Ciclo 1' });
    const cicloId = c.body.cicloId as string;
    await request(server())
      .post('/v1/plantas')
      .set(auth())
      .send({ cicloId, geneticaId: g.body.geneticaId, nome: 'P1', origem: 'SEMENTE' });

    // 8 dias de check-in ambiental → série GROW/VPD (VPD é derivado de temp+umidade).
    for (let i = 1; i <= 8; i++) {
      await request(server())
        .post('/v1/registros-ambientais')
        .set(auth())
        .send({
          cicloId,
          registradoEm: `2026-06-0${i}T12:00:00.000Z`,
          temperaturaC: 24,
          umidadeRelativa: 70 - i * 3,
        })
        .expect(201);
    }

    const plantas = await request(server()).get(`/v1/ciclos/${cicloId}/plantas`).set(auth());
    const colheitaReal = await request(server())
      .post('/v1/colheitas')
      .set(auth())
      .send({ cicloId, plantaIds: [plantas.body[0].plantaId], pesoUmidoGramas: 400 })
      .expect(201);
    const s = await request(server())
      .post('/v1/secagens')
      .set(auth())
      .send({ colheitaId: colheitaReal.body.colheitaId })
      .expect(201);
    await request(server())
      .post(`/v1/secagens/${s.body.secagemId}/finalizar`)
      .set(auth())
      .expect(201);
    const cura = await request(server())
      .post('/v1/curas')
      .set(auth())
      .send({ secagemId: s.body.secagemId })
      .expect(201);
    const lote = await request(server())
      .post('/v1/lotes')
      .set(auth())
      .send({ curaId: cura.body.curaId, codigo: 'OG-2026-01', pesoSecoGramas: 90 })
      .expect(201);
    loteId = lote.body.loteId;
    expect(loteId).toBeTruthy();
  });

  it('registra tratamento, produto e 8 dias de sintomas (Med)', async () => {
    const t = await request(server())
      .post('/v1/tratamentos')
      .set(auth())
      .send({ condicao: 'Dor crônica' });
    const p = await request(server())
      .post('/v1/produtos')
      .set(auth())
      .send({ tratamentoId: t.body.tratamentoId, nome: 'Óleo CBD', tipo: 'OLEO' });
    produtoId = p.body.produtoId;

    for (let i = 1; i <= 8; i++) {
      await request(server())
        .post('/v1/sintomas-diarios')
        .set(auth())
        .send({ registradoEm: `2026-06-0${i}T20:00:00.000Z`, dor: i })
        .expect(201);
    }
  });

  it('sem opt-in, a correlação cruzada é recusada (403)', async () => {
    await request(server())
      .get('/v1/ia/correlacoes/cruzada?fatorGrow=VPD&fatorMed=DOR')
      .set(auth())
      .expect(403);
  });

  it('após vincular o produto ao lote, a IA correlaciona Grow×Med', async () => {
    await request(server())
      .post(`/v1/produtos/${produtoId}/vincular-lote`)
      .set(auth())
      .send({ loteId })
      .expect(201);

    // O opt-in ficou registrado no schema ia.
    const vinc = await pool.query(
      `SELECT 1 FROM ia.vinculo_grow_med WHERE usuario_id = $1 AND produto_id = $2`,
      [usuarioId, produtoId],
    );
    expect(vinc.rowCount).toBe(1);

    const r = await request(server())
      .get('/v1/ia/correlacoes/cruzada?fatorGrow=VPD&fatorMed=DOR')
      .set(auth())
      .expect(200);
    expect(r.body.suficiente).toBe(true);
    expect(r.body.correlacao.tamanhoAmostra).toBe(8);
    expect(r.body.correlacao.fatorA).toBe('VPD');
    expect(r.body.correlacao.fatorB).toBe('DOR');
  });

  it('desvincular desabilita a correlação cruzada de novo (403)', async () => {
    await request(server())
      .delete(`/v1/produtos/${produtoId}/vincular-lote`)
      .set(auth())
      .expect(204);
    await request(server())
      .get('/v1/ia/correlacoes/cruzada?fatorGrow=VPD&fatorMed=DOR')
      .set(auth())
      .expect(403);
  });
});
