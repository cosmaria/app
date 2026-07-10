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
 * Integração do fluxo pós-colheita (doc 02 §5.11) contra PostgreSQL real.
 *
 * Prova: a colheita persiste com o array de plantas; os CHECKs e UNIQUE de 1—1; e que
 * todo o pós-colheita some junto com o ciclo pelo CASCADE encadeado do schema grow.
 */
describe('Pós-colheita contra Postgres real (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let token = '';
  let cicloId = '';
  let plantaA = '';
  let plantaB = '';

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

    const cred = { email: 'poscolheita@cosmaria.app', senha: 'senhaSegura123' };
    await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    token = (await request(app.getHttpServer()).post('/v1/auth/login').send(cred)).body.accessToken;
    const auth = { Authorization: `Bearer ${token}` };

    const g = await request(app.getHttpServer())
      .post('/v1/geneticas')
      .set(auth)
      .send({ nome: 'OG', tipo: 'FOTOPERIODICA' });
    const a = await request(app.getHttpServer())
      .post('/v1/ambientes')
      .set(auth)
      .send({ nome: 'E1', tipo: 'INDOOR' });
    const c = await request(app.getHttpServer())
      .post('/v1/ciclos')
      .set(auth)
      .send({ ambienteId: a.body.ambienteId, nome: 'Ciclo 1' });
    cicloId = c.body.cicloId;
    const p1 = await request(app.getHttpServer())
      .post('/v1/plantas')
      .set(auth)
      .send({ cicloId, geneticaId: g.body.geneticaId, nome: 'P1', origem: 'SEMENTE' });
    const p2 = await request(app.getHttpServer())
      .post('/v1/plantas')
      .set(auth)
      .send({ cicloId, geneticaId: g.body.geneticaId, nome: 'P2', origem: 'SEMENTE' });
    plantaA = p1.body.plantaId;
    plantaB = p2.body.plantaId;
  }, 180_000);

  afterAll(async () => {
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });
  const server = () => app.getHttpServer();

  let colheitaId = '';
  let curaId = '';

  it('a colheita persiste com o array de plantas no schema grow', async () => {
    const r = await request(server())
      .post('/v1/colheitas')
      .set(auth())
      .send({ cicloId, plantaIds: [plantaA, plantaB], pesoUmidoGramas: 800 })
      .expect(201);
    colheitaId = r.body.colheitaId;

    const { rows } = await pool.query<{ plantas: string[]; peso_umido_gramas: string }>(
      `SELECT plantas, peso_umido_gramas FROM grow.colheita WHERE id = $1`,
      [colheitaId],
    );
    expect(rows[0].plantas).toHaveLength(2);
    expect(Number(rows[0].peso_umido_gramas)).toBe(800);
  });

  it('o banco recusa colheita sem nenhuma planta', async () => {
    await expect(
      pool.query(
        `INSERT INTO grow.colheita (id, usuario_id, ciclo_id, plantas)
         VALUES (gen_random_uuid(), gen_random_uuid(), $1, ARRAY[]::uuid[])`,
        [cicloId],
      ),
    ).rejects.toThrow(/ck_colheita_plantas/);
  });

  it('percorre secagem → cura → lote e deriva o rendimento por planta', async () => {
    const s = await request(server())
      .post('/v1/secagens')
      .set(auth())
      .send({ colheitaId })
      .expect(201);

    const cura = await request(server())
      .post('/v1/curas')
      .set(auth())
      .send({ secagemId: s.body.secagemId })
      .expect(201);
    curaId = cura.body.curaId;

    const lote = await request(server())
      .post('/v1/lotes')
      .set(auth())
      .send({ curaId, codigo: 'OG-2026-01', pesoSecoGramas: 200 })
      .expect(201);

    // 200g / 2 plantas
    expect(lote.body.gramasPorPlanta).toBe(100);

    const relido = await request(server())
      .get(`/v1/lotes/${lote.body.loteId}`)
      .set(auth())
      .expect(200);
    expect(relido.body.gramasPorPlanta).toBe(100);
  });

  it('o UNIQUE do banco garante 1—1 (segunda cura para a mesma secagem é barrada)', async () => {
    const s = await pool.query<{ id: string }>(
      `SELECT id FROM grow.secagem WHERE colheita_id = $1`,
      [colheitaId],
    );
    await expect(
      pool.query(
        `INSERT INTO grow.cura (id, usuario_id, secagem_id)
         VALUES (gen_random_uuid(), gen_random_uuid(), $1)`,
        [s.rows[0].id],
      ),
    ).rejects.toThrow(/secagem_id/);
  });

  it('todo o pós-colheita some junto com o ciclo (CASCADE encadeado)', async () => {
    await pool.query(`DELETE FROM grow.ciclo_cultivo WHERE id = $1`, [cicloId]);

    for (const tabela of ['colheita', 'secagem', 'cura', 'lote']) {
      const { rows } = await pool.query<{ total: string }>(
        `SELECT count(*) AS total FROM grow.${tabela}`,
      );
      expect(rows[0].total).toBe('0');
    }
  });
});
