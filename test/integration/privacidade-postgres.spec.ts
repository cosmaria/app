import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { Pool } from 'pg';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { StartedRedisContainer } from '@testcontainers/redis';
import { criarPgPool } from '@cosmaria/core-infrastructure';
import { Escopo } from '@cosmaria/core-domain';
import { PRIVACIDADE_PUBLIC_API, type PrivacidadePublicApi } from '@cosmaria/core-public-api';
import { AppModule } from '../../apps/api/src/app/app.module';
import { DomainExceptionFilter } from '../../apps/api/src/app/auth/domain-exception.filter';
import { aplicarMigrations, iniciarPostgres, iniciarRedis } from './support/containers';

/**
 * Integração do Motor de Privacidade (doc 04 §12) contra PostgreSQL real.
 * Sobe a app inteira, resolve a PRIVACIDADE_PUBLIC_API (o contrato que Comunidade
 * usará) e prova: config persiste como JSONB, dimensões são filtradas por
 * visualizador, e só o autor edita.
 */
describe('Motor de Privacidade contra Postgres real (integração)', () => {
  let pg: StartedPostgreSqlContainer;
  let redis: StartedRedisContainer;
  let app: INestApplication;
  let pool: Pool;
  let privacidade: PrivacidadePublicApi;
  let autorId: string;

  const ref = { modulo: 'grow', tipoConteudo: 'growlog', conteudoId: 'ciclo-1' };
  const anon = { ehAutor: false, ehSeguidor: false, ehAmigo: false, possuiLink: false };
  const seguidor = { ehAutor: false, ehSeguidor: true, ehAmigo: false, possuiLink: false };
  const autor = { ehAutor: true, ehSeguidor: false, ehAmigo: false, possuiLink: false };
  const dados = { fotos: 'foto.jpg', genetica: 'OG Kush', localizacao: 'Lisboa' };

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
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();

    pool = criarPgPool(pg.getConnectionUri());
    privacidade = app.get<PrivacidadePublicApi>(PRIVACIDADE_PUBLIC_API);

    // O autor precisa existir (FK autor_id → core.usuario).
    const reg = await request(app.getHttpServer())
      .post('/v1/auth/register')
      .send({ email: 'autor@cosmaria.app', senha: 'senhaSegura123' });
    autorId = reg.body.usuarioId;
  }, 180_000);

  afterAll(async () => {
    await pool?.end();
    await app?.close();
    await pg?.stop();
    await redis?.stop();
  });

  it('define o compartilhamento e persiste como JSONB no banco', async () => {
    await privacidade.definirCompartilhamento({
      ...ref,
      autorId,
      dimensoes: [
        { codigo: 'fotos', escopo: Escopo.PUBLICO },
        { codigo: 'genetica', escopo: Escopo.SEGUIDORES },
        { codigo: 'localizacao', escopo: Escopo.PRIVADO },
      ],
    });

    const { rows } = await pool.query<{ escopo_padrao: string; dimensoes: Record<string, string> }>(
      `SELECT escopo_padrao, dimensoes FROM core.configuracao_de_compartilhamento
        WHERE modulo=$1 AND tipo_conteudo=$2 AND conteudo_id=$3`,
      [ref.modulo, ref.tipoConteudo, ref.conteudoId],
    );
    expect(rows[0].escopo_padrao).toBe('PRIVADO');
    expect(rows[0].dimensoes).toEqual({
      fotos: 'PUBLICO',
      genetica: 'SEGUIDORES',
      localizacao: 'PRIVADO',
    });
  });

  it('filtra as dimensões conforme o visualizador', async () => {
    expect(await privacidade.filtrar(ref, anon, dados)).toEqual({ fotos: 'foto.jpg' });
    expect(await privacidade.filtrar(ref, seguidor, dados)).toEqual({
      fotos: 'foto.jpg',
      genetica: 'OG Kush',
    });
    expect(await privacidade.filtrar(ref, autor, dados)).toEqual(dados);
  });

  it('dimensoesVisiveis reflete o escopo por visualizador', async () => {
    const candidatas = ['fotos', 'genetica', 'localizacao'];
    expect(await privacidade.dimensoesVisiveis(ref, anon, candidatas)).toEqual(['fotos']);
    expect(await privacidade.dimensoesVisiveis(ref, seguidor, candidatas)).toEqual([
      'fotos',
      'genetica',
    ]);
  });

  it('só o autor pode alterar a configuração (ownership)', async () => {
    await expect(
      privacidade.definirCompartilhamento({ ...ref, autorId: 'outro-usuario-id' }),
    ).rejects.toThrow();
  });
});
