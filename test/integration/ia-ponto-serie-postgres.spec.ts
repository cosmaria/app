import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Pool } from 'pg';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import { criarPgPool } from '@cosmaria/core-infrastructure';
import { AppModule } from '../../apps/api/src/app/app.module';
import { DomainExceptionFilter } from '../../apps/api/src/app/auth/domain-exception.filter';
import {
  aguardarAte,
  aplicarMigrations,
  iniciarPostgres,
  iniciarRedis,
} from './support/containers';

/**
 * Integração da IA (doc 05 §6) contra PostgreSQL real.
 *
 * Prova o pipeline end-to-end persistido: eventos de Med → Adaptador de Ingestão → schema
 * `ia.ponto_serie` → Motor de Correlação lendo do banco.
 */
describe('IA série temporal contra Postgres real (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let token = '';
  let produtoId = '';

  beforeAll(async () => {
    pg = await iniciarPostgres();
    redis = await iniciarRedis();
    await aplicarMigrations(pg.getConnectionUri());

    process.env.AUTH_REPO = 'postgres';
    process.env.DATABASE_URL = pg.getConnectionUri();
    process.env.REDIS_URL = redis.getConnectionUrl();
    process.env.ACCESS_TOKEN_SECRET = 'test-access';
    process.env.REFRESH_TOKEN_SECRET = 'test-refresh';
    process.env.OUTBOX_POLL_MS = '50'; // entrega assíncrona rápida no teste

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ rawBody: true });
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    pool = criarPgPool(pg.getConnectionUri());

    const cred = { email: 'ia@cosmaria.app', senha: 'senhaSegura123' };
    await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    token = (await request(app.getHttpServer()).post('/v1/auth/login').send(cred)).body.accessToken;
    const auth = { Authorization: `Bearer ${token}` };
    const t = await request(app.getHttpServer())
      .post('/v1/tratamentos')
      .set(auth)
      .send({ condicao: 'Dor' });
    const p = await request(app.getHttpServer())
      .post('/v1/produtos')
      .set(auth)
      .send({ tratamentoId: t.body.tratamentoId, nome: 'Óleo', tipo: 'OLEO' });
    produtoId = p.body.produtoId;
  }, 180_000);

  afterAll(async () => {
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });
  const server = () => app.getHttpServer();
  const dia = (d: number) => `2026-06-${String(d).padStart(2, '0')}T08:00:00.000Z`;

  it('a ingestão grava pontos no schema ia a partir dos eventos do Med', async () => {
    for (let d = 1; d <= 8; d++) {
      await request(server())
        .post('/v1/registros-uso')
        .set(auth())
        .send({ produtoId, quantidade: d, unidade: 'GOTAS', via: 'SUBLINGUAL', usadoEm: dia(d) })
        .expect(201);
      await request(server())
        .post('/v1/sintomas-diarios')
        .set(auth())
        .send({ dor: 10 - d, registradoEm: dia(d) })
        .expect(201);
    }

    // Entrega assíncrona (outbox): a ingestão acontece um tick depois da escrita.
    const contar = async (fator: string): Promise<number> => {
      const { rows } = await pool.query<{ total: string }>(
        `SELECT count(*) AS total FROM ia.ponto_serie WHERE fator = $1`,
        [fator],
      );
      return Number(rows[0].total);
    };
    await aguardarAte(async () => (await contar('DOSE')) === 8 && (await contar('DOR')) === 8);

    expect(await contar('DOSE')).toBe(8);
    expect(await contar('DOR')).toBe(8);

    // Toda linha do outbox foi entregue (nenhuma pendente/morta).
    const pendentes = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM core.outbox WHERE status <> 'ENTREGUE'`,
    );
    expect(Number(pendentes.rows[0].total)).toBe(0);
  });

  it('o banco recusa domínio fora do catálogo', async () => {
    await expect(
      pool.query(
        `INSERT INTO ia.ponto_serie (id, usuario_id, dominio, fator, valor, ocorrido_em, origem_id)
         VALUES (gen_random_uuid(), gen_random_uuid(), 'COMUNIDADE', 'X', 1, now(), gen_random_uuid())`,
      ),
    ).rejects.toThrow(/ck_ponto_dominio/);
  });

  it('o Motor de Correlação lê do banco e conclui dose × dor (negativa)', async () => {
    const r = await request(server())
      .get('/v1/ia/correlacoes?dominio=MED&fatorA=DOSE&fatorB=DOR')
      .set(auth())
      .expect(200);
    expect(r.body.suficiente).toBe(true);
    expect(r.body.correlacao.direcao).toBe('NEGATIVA');
    expect(r.body.correlacao.tamanhoAmostra).toBe(8);
  });
});
