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
 * Integração de Estatísticas (doc 02 §5.12) contra PostgreSQL real.
 *
 * Prova o essencial que não dá para validar em memória: o `AVG` do resumo ambiental
 * agregado no banco (ignorando NULLs), e o rendimento consolidado andando pelo schema.
 */
describe('Estatísticas contra Postgres real (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let token = '';
  let geneticaId = '';
  let ambienteId = '';

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

    const cred = { email: 'estatisticas@cosmaria.app', senha: 'senhaSegura123' };
    await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    token = (await request(app.getHttpServer()).post('/v1/auth/login').send(cred)).body.accessToken;
    const auth = { Authorization: `Bearer ${token}` };
    geneticaId = (
      await request(app.getHttpServer())
        .post('/v1/geneticas')
        .set(auth)
        .send({ nome: 'OG', tipo: 'FOTOPERIODICA' })
    ).body.geneticaId;
    ambienteId = (
      await request(app.getHttpServer())
        .post('/v1/ambientes')
        .set(auth)
        .send({ nome: 'E1', tipo: 'INDOOR' })
    ).body.ambienteId;
  }, 180_000);

  afterAll(async () => {
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });
  const server = () => app.getHttpServer();

  it('o AVG do resumo ambiental agrega no banco ignorando medições ausentes', async () => {
    const c = await request(server())
      .post('/v1/ciclos')
      .set(auth())
      .send({ ambienteId, nome: 'Ciclo AVG' });
    const cicloId = c.body.cicloId;

    // Três check-ins: temperatura 20, 24 e um sem temperatura (só umidade).
    await request(server())
      .post('/v1/registros-ambientais')
      .set(auth())
      .send({ cicloId, temperaturaC: 20, umidadeRelativa: 50 });
    await request(server())
      .post('/v1/registros-ambientais')
      .set(auth())
      .send({ cicloId, temperaturaC: 24, umidadeRelativa: 70 });
    await request(server())
      .post('/v1/registros-ambientais')
      .set(auth())
      .send({ cicloId, umidadeRelativa: 60 });

    const r = await request(server())
      .get(`/v1/ciclos/${cicloId}/relatorio`)
      .set(auth())
      .expect(200);

    expect(r.body.ambiente.totalRegistros).toBe(3);
    // Média só das duas temperaturas presentes: (20 + 24) / 2 = 22.
    expect(r.body.ambiente.temperaturaMedia).toBe(22);
    // Umidade de todos os três: (50 + 70 + 60) / 3 = 60.
    expect(r.body.ambiente.umidadeMedia).toBe(60);
  });

  it('consolida o rendimento andando Colheita → Secagem → Cura → Lote no schema', async () => {
    const c = await request(server())
      .post('/v1/ciclos')
      .set(auth())
      .send({ ambienteId, nome: 'Ciclo Rendimento' });
    const cicloId = c.body.cicloId;
    const p = await request(server())
      .post('/v1/plantas')
      .set(auth())
      .send({ cicloId, geneticaId, nome: 'P1', origem: 'SEMENTE' });
    const col = await request(server())
      .post('/v1/colheitas')
      .set(auth())
      .send({ cicloId, plantaIds: [p.body.plantaId] });
    const sec = await request(server())
      .post('/v1/secagens')
      .set(auth())
      .send({ colheitaId: col.body.colheitaId });
    const cur = await request(server())
      .post('/v1/curas')
      .set(auth())
      .send({ secagemId: sec.body.secagemId });
    await request(server())
      .post('/v1/lotes')
      .set(auth())
      .send({ curaId: cur.body.curaId, codigo: 'R1', pesoSecoGramas: 200 });

    const r = await request(server())
      .get(`/v1/ciclos/${cicloId}/relatorio`)
      .set(auth())
      .expect(200);
    expect(r.body.colheita.pesoSecoTotalGramas).toBe(200);
    expect(r.body.colheita.gramasPorPlanta).toBe(200);
  });
});
