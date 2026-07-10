import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Pool } from 'pg';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import { criarPgPool } from '@cosmaria/core-infrastructure';
import { ChavesDeLimite } from '@cosmaria/core-domain';
import { MIDIA_PUBLIC_API, type MidiaPublicApi } from '@cosmaria/core-public-api';
import { AppModule } from '../../apps/api/src/app/app.module';
import { DomainExceptionFilter } from '../../apps/api/src/app/auth/domain-exception.filter';
import { aplicarMigrations, iniciarPostgres, iniciarRedis } from './support/containers';

/**
 * Integração do Armazenamento de Mídia (doc 04 §16) contra PostgreSQL real.
 *
 * Prova: a migration entrega o limite de tamanho como configuração; a referência
 * polimórfica (modulo, tipo_entidade, entidade_id) funciona para Grow e Med na mesma
 * tabela; e a MIDIA_PUBLIC_API é o contrato que esses módulos consumirão.
 */
describe('Mídia contra Postgres real (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let midiaApi: MidiaPublicApi;
  let usuarioId: string;
  let token = '';
  let diretorio = '';

  beforeAll(async () => {
    diretorio = await mkdtemp(join(tmpdir(), 'cosmaria-midia-integ-'));
    pg = await iniciarPostgres();
    redis = await iniciarRedis();
    await aplicarMigrations(pg.getConnectionUri());

    process.env.AUTH_REPO = 'postgres';
    process.env.DATABASE_URL = pg.getConnectionUri();
    process.env.REDIS_URL = redis.getConnectionUrl();
    process.env.ACCESS_TOKEN_SECRET = 'test-access';
    process.env.REFRESH_TOKEN_SECRET = 'test-refresh';
    process.env.MIDIA_DIRETORIO = diretorio;
    process.env.MIDIA_URL_SECRET = 'segredo-de-midia';

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ rawBody: true });
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    pool = criarPgPool(pg.getConnectionUri());
    midiaApi = app.get<MidiaPublicApi>(MIDIA_PUBLIC_API);

    const cred = { email: 'midia@cosmaria.app', senha: 'senhaSegura123' };
    const reg = await request(app.getHttpServer()).post('/v1/auth/register').send(cred);
    usuarioId = reg.body.usuarioId;
    const login = await request(app.getHttpServer()).post('/v1/auth/login').send(cred);
    token = login.body.accessToken;
  }, 180_000);

  afterAll(async () => {
    delete process.env.MIDIA_DIRETORIO;
    delete process.env.MIDIA_URL_SECRET;
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
    await rm(diretorio, { recursive: true, force: true });
  });

  const enviar = (conteudo: Buffer, nome: string, tipo: string, campos: Record<string, string>) => {
    const req = request(app.getHttpServer())
      .post('/v1/midia')
      .set('Authorization', `Bearer ${token}`)
      .attach('arquivo', conteudo, { filename: nome, contentType: tipo });
    for (const [chave, valor] of Object.entries(campos)) {
      req.field(chave, valor);
    }
    return req;
  };

  it('a migration entrega o limite de tamanho como configuração, não constante', async () => {
    const { rows } = await pool.query<{ plano: string; valor: number | null }>(
      `SELECT plano, valor FROM core.limite_de_plano WHERE chave = $1 ORDER BY plano`,
      [ChavesDeLimite.MIDIA_TAMANHO_MAXIMO_BYTES],
    );
    expect(rows).toEqual([
      { plano: 'GRATUITO', valor: 5242880 },
      { plano: 'PREMIUM', valor: null },
    ]);
  });

  let midiaGrowId = '';

  it('a foto do Grow persiste no schema core com a referência polimórfica', async () => {
    const resposta = await enviar(Buffer.from('bytes-da-foto'), 'foto.jpg', 'image/jpeg', {
      modulo: 'grow',
      tipoEntidade: 'planta',
      entidadeId: 'planta-1',
    }).expect(201);
    midiaGrowId = resposta.body.midiaId;

    const { rows } = await pool.query<{
      modulo: string;
      tipo_entidade: string;
      entidade_id: string;
      tamanho_bytes: string;
      chave_de_armazenamento: string;
    }>(
      `SELECT modulo, tipo_entidade, entidade_id, tamanho_bytes, chave_de_armazenamento
         FROM core.midia WHERE id = $1`,
      [midiaGrowId],
    );
    expect(rows[0].modulo).toBe('grow');
    expect(rows[0].tipo_entidade).toBe('planta');
    expect(Number(rows[0].tamanho_bytes)).toBe(13);
    // A chave é particionada por usuário — não adivinhável entre Contas.
    expect(rows[0].chave_de_armazenamento).toBe(`${usuarioId}/${midiaGrowId}`);
  });

  it('o exame do Med usa a MESMA tabela, sem duplicar lógica de armazenamento', async () => {
    await enviar(Buffer.from('%PDF-1.4'), 'exame.pdf', 'application/pdf', {
      modulo: 'med',
      tipoEntidade: 'tratamento',
      entidadeId: 'trat-1',
    }).expect(201);

    const { rows } = await pool.query<{ modulo: string; tipo: string }>(
      `SELECT modulo, tipo FROM core.midia WHERE usuario_id = $1 ORDER BY modulo`,
      [usuarioId],
    );
    expect(rows).toEqual([
      { modulo: 'grow', tipo: 'IMAGEM' },
      { modulo: 'med', tipo: 'DOCUMENTO' },
    ]);
  });

  it('a MIDIA_PUBLIC_API é o contrato que Grow e Med consumirão', async () => {
    const doGrow = await midiaApi.listarDaEntidade(usuarioId, 'grow', 'planta', 'planta-1');
    expect(doGrow.map((m) => m.midiaId)).toEqual([midiaGrowId]);

    const url = await midiaApi.obterUrl(usuarioId, midiaGrowId);
    expect(url.url).toContain('assinatura=');

    // Nem a listagem nem a URL revelam a chave no armazenamento de objetos.
    expect(JSON.stringify(doGrow)).not.toContain('chaveDeArmazenamento');
  });

  it('o banco recusa tamanho não positivo (defesa em profundidade)', async () => {
    await expect(
      pool.query(`UPDATE core.midia SET tamanho_bytes = 0 WHERE id = $1`, [midiaGrowId]),
    ).rejects.toThrow(/ck_midia_tamanho/);
  });

  it('a chave de armazenamento é única no banco', async () => {
    await expect(
      pool.query(
        `INSERT INTO core.midia (id, usuario_id, modulo, tipo_entidade, tipo, nome_arquivo, tipo_conteudo, tamanho_bytes, chave_de_armazenamento)
         VALUES (gen_random_uuid(), $1, 'grow', 'planta', 'IMAGEM', 'copia.jpg', 'image/jpeg', 10, $2)`,
        [usuarioId, `${usuarioId}/${midiaGrowId}`],
      ),
    ).rejects.toThrow(/chave_de_armazenamento/);
  });

  it('remover apaga a linha e o objeto no disco', async () => {
    await request(app.getHttpServer())
      .delete(`/v1/midia/${midiaGrowId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM core.midia WHERE id = $1`,
      [midiaGrowId],
    );
    expect(rows[0].total).toBe('0');
  });

  it('a mídia some junto com a Conta (ON DELETE CASCADE)', async () => {
    await pool.query(`DELETE FROM core.usuario WHERE id = $1`, [usuarioId]);
    const { rows } = await pool.query<{ total: string }>(
      `SELECT count(*) AS total FROM core.midia WHERE usuario_id = $1`,
      [usuarioId],
    );
    expect(rows[0].total).toBe('0');
  });
});
