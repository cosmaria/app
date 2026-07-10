import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Pool } from 'pg';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import { criarPgPool } from '@cosmaria/core-infrastructure';
import { NivelDeComplexidade } from '@cosmaria/core-domain';
import { COMPLEXIDADE_PUBLIC_API, type ComplexidadePublicApi } from '@cosmaria/core-public-api';
import { AppModule } from '../../apps/api/src/app/app.module';
import { DomainExceptionFilter } from '../../apps/api/src/app/auth/domain-exception.filter';
import { aplicarMigrations, iniciarPostgres, iniciarRedis } from './support/containers';

/**
 * Integração da Complexidade Progressiva (doc 02 §5.0) contra PostgreSQL real.
 *
 * Prova: a preferência é uma linha por Conta (UNIQUE), o array de campos habilitados
 * persiste, o CHECK do banco recusa nível inválido, e a COMPLEXIDADE_PUBLIC_API é o
 * contrato que Grow e Med usarão para decidir o que exibir.
 */
describe('Complexidade Progressiva contra Postgres real (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let complexidade: ComplexidadePublicApi;
  let usuarioId: string;
  let token = '';

  const CAMPOS = [
    { codigo: 'grow.checkin', nivel: NivelDeComplexidade.ESSENCIAL },
    { codigo: 'grow.ec', nivel: NivelDeComplexidade.AVANCADO },
    { codigo: 'grow.dli', nivel: NivelDeComplexidade.ESPECIALISTA },
    { codigo: 'med.sintoma', nivel: NivelDeComplexidade.ESSENCIAL },
    { codigo: 'med.concentracao', nivel: NivelDeComplexidade.ESPECIALISTA },
  ];

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
    complexidade = app.get<ComplexidadePublicApi>(COMPLEXIDADE_PUBLIC_API);

    const cred = { email: 'complexidade@cosmaria.app', senha: 'senhaSegura123' };
    const reg = await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    usuarioId = reg.body.usuarioId;
    const login = await request(app.getHttpServer()).post('/v1/auth/login').send(cred);
    token = login.body.accessToken;
  }, 180_000);

  afterAll(async () => {
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  const atualizar = (corpo: object) =>
    request(app.getHttpServer())
      .put('/v1/preferencia-complexidade')
      .set('Authorization', `Bearer ${token}`)
      .send(corpo);

  it('a preferência padrão é criada lazy e persiste como ESSENCIAL', async () => {
    await request(app.getHttpServer())
      .get('/v1/preferencia-complexidade')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const { rows } = await pool.query<{ nivel: string; campos_habilitados: string[] }>(
      `SELECT nivel, campos_habilitados FROM core.preferencia_de_complexidade WHERE usuario_id = $1`,
      [usuarioId],
    );
    expect(rows[0]).toEqual({ nivel: 'ESSENCIAL', campos_habilitados: [] });
  });

  it('a criação lazy concorrente converge para uma única linha (UNIQUE usuario_id)', async () => {
    await Promise.all([
      complexidade.obterPreferencia(usuarioId),
      complexidade.obterPreferencia(usuarioId),
      complexidade.obterPreferencia(usuarioId),
    ]);
    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM core.preferencia_de_complexidade WHERE usuario_id = $1`,
      [usuarioId],
    );
    expect(rows[0].total).toBe('1');
  });

  it('o iniciante só vê o essencial, em Grow e Med', async () => {
    const visiveis = await complexidade.filtrarCampos(usuarioId, CAMPOS);
    expect(visiveis).toEqual(['grow.checkin', 'med.sintoma']);
  });

  it('a habilitação progressiva persiste como array no banco', async () => {
    await atualizar({ habilitarCampos: ['grow.ec'] }).expect(200);

    const { rows } = await pool.query<{ campos_habilitados: string[] }>(
      `SELECT campos_habilitados FROM core.preferencia_de_complexidade WHERE usuario_id = $1`,
      [usuarioId],
    );
    expect(rows[0].campos_habilitados).toEqual(['grow.ec']);

    const visiveis = await complexidade.filtrarCampos(usuarioId, CAMPOS);
    expect(visiveis).toContain('grow.ec');
    expect(visiveis).not.toContain('grow.dli');
  });

  it('o Modo Especialista libera todos os parâmetros de uma vez', async () => {
    await atualizar({ nivel: 'ESPECIALISTA' }).expect(200);

    const visiveis = await complexidade.filtrarCampos(usuarioId, CAMPOS);
    expect(visiveis).toHaveLength(CAMPOS.length);

    const preferencia = await complexidade.obterPreferencia(usuarioId);
    expect(preferencia.modoEspecialista).toBe(true);
  });

  it('o banco recusa nível inválido (defesa em profundidade)', async () => {
    await expect(
      pool.query(
        `UPDATE core.preferencia_de_complexidade SET nivel = 'GURU' WHERE usuario_id = $1`,
        [usuarioId],
      ),
    ).rejects.toThrow(/ck_nivel_complexidade/);
  });

  it('a preferência some junto com a Conta (ON DELETE CASCADE)', async () => {
    await pool.query(`DELETE FROM core.usuario WHERE id = $1`, [usuarioId]);
    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM core.preferencia_de_complexidade WHERE usuario_id = $1`,
      [usuarioId],
    );
    expect(rows[0].total).toBe('0');
  });
});
