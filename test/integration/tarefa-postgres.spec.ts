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
 * Integração de Tarefas (doc 02 §5.10) contra PostgreSQL real.
 *
 * Prova: os CHECKs de catálogo/coerência; a recorrência gerando a próxima ocorrência; e o
 * CASCADE junto do ciclo no schema grow.
 */
describe('Tarefas contra Postgres real (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let token = '';
  let cicloId = '';

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

    const cred = { email: 'tarefas@cosmaria.app', senha: 'senhaSegura123' };
    await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    token = (await request(app.getHttpServer()).post('/v1/auth/login').send(cred)).body.accessToken;
    const auth = { Authorization: `Bearer ${token}` };

    const a = await request(app.getHttpServer())
      .post('/v1/ambientes')
      .set(auth)
      .send({ nome: 'E1', tipo: 'INDOOR' });
    const c = await request(app.getHttpServer())
      .post('/v1/ciclos')
      .set(auth)
      .send({ ambienteId: a.body.ambienteId, nome: 'Ciclo 1' });
    cicloId = c.body.cicloId;
  }, 180_000);

  afterAll(async () => {
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });
  const server = () => app.getHttpServer();

  it('a tarefa persiste pendente no schema grow', async () => {
    const r = await request(server())
      .post('/v1/tarefas')
      .set(auth())
      .send({ cicloId, titulo: 'Regar', tipo: 'REGA', recorrenciaDias: 2 })
      .expect(201);

    const { rows } = await pool.query<{ status: string; concluida_em: Date | null }>(
      `SELECT status, concluida_em FROM grow.tarefa WHERE id = $1`,
      [r.body.tarefaId],
    );
    expect(rows[0].status).toBe('PENDENTE');
    expect(rows[0].concluida_em).toBeNull();
  });

  it('o banco recusa tipo de tarefa fora do catálogo', async () => {
    await expect(
      pool.query(
        `INSERT INTO grow.tarefa (id, usuario_id, ciclo_id, titulo, tipo, origem, status)
         VALUES (gen_random_uuid(), gen_random_uuid(), $1, 'x', 'MAGIA', 'MANUAL', 'PENDENTE')`,
        [cicloId],
      ),
    ).rejects.toThrow(/ck_tarefa_tipo/);
  });

  it('o banco recusa uma tarefa CONCLUIDA sem data de conclusão', async () => {
    await expect(
      pool.query(
        `INSERT INTO grow.tarefa (id, usuario_id, ciclo_id, titulo, tipo, origem, status)
         VALUES (gen_random_uuid(), gen_random_uuid(), $1, 'x', 'REGA', 'MANUAL', 'CONCLUIDA')`,
        [cicloId],
      ),
    ).rejects.toThrow(/ck_tarefa_conclusao/);
  });

  it('concluir a recorrente grava a conclusão e cria a próxima ocorrência pendente', async () => {
    const criada = await request(server())
      .post('/v1/tarefas')
      .set(auth())
      .send({ cicloId, titulo: 'Fertilizar', tipo: 'FERTILIZACAO', recorrenciaDias: 3 })
      .expect(201);

    const r = await request(server())
      .post(`/v1/tarefas/${criada.body.tarefaId}/concluir`)
      .set(auth())
      .expect(201);
    expect(r.body.proximaTarefa).not.toBeNull();

    const concluida = await pool.query<{ status: string }>(
      `SELECT status FROM grow.tarefa WHERE id = $1`,
      [criada.body.tarefaId],
    );
    expect(concluida.rows[0].status).toBe('CONCLUIDA');

    const pendentes = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM grow.tarefa
        WHERE ciclo_id = $1 AND status = 'PENDENTE' AND titulo = 'Fertilizar'`,
      [cicloId],
    );
    expect(pendentes.rows[0].total).toBe('1');
  });

  it('as tarefas somem junto com o ciclo (CASCADE no schema grow)', async () => {
    await pool.query(`DELETE FROM grow.ciclo_cultivo WHERE id = $1`, [cicloId]);
    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM grow.tarefa WHERE ciclo_id = $1`,
      [cicloId],
    );
    expect(rows[0].total).toBe('0');
  });
});
