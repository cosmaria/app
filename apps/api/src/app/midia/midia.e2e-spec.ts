import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

/**
 * e2e de Mídia (repositórios EM MEMÓRIA, armazenamento em disco temporário).
 *
 * Exercita o upload multipart real, a URL assinada, a rota que serve os bytes e o
 * limite de tamanho por plano — que é o mesmo `LimiteDePlano` do Billing, não uma
 * regra própria da Mídia.
 */
describe('Mídia (e2e)', () => {
  let app: INestApplication;
  let diretorio = '';

  beforeAll(async () => {
    diretorio = await mkdtemp(join(tmpdir(), 'cosmaria-midia-e2e-'));

    process.env.AUTH_REPO = 'memory';
    process.env.ACCESS_TOKEN_SECRET = 'test-access';
    process.env.REFRESH_TOKEN_SECRET = 'test-refresh';
    process.env.MIDIA_DIRETORIO = diretorio;
    process.env.MIDIA_URL_SECRET = 'segredo-de-midia';
    process.env.MIDIA_URL_BASE = 'http://localhost/v1/arquivos';

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication({ rawBody: true });
    app.setGlobalPrefix('v1');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new DomainExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    delete process.env.MIDIA_DIRETORIO;
    delete process.env.MIDIA_URL_SECRET;
    delete process.env.MIDIA_URL_BASE;
    await app.close();
    await rm(diretorio, { recursive: true, force: true });
  });

  const server = () => app.getHttpServer();
  const cred = { email: 'midia@cosmaria.app', senha: 'senhaSegura123' };
  let token = '';
  let midiaId = '';

  const enviar = (conteudo: Buffer, nome: string, tipo: string, campos: Record<string, string>) => {
    const req = request(server())
      .post('/v1/midia')
      .set('Authorization', `Bearer ${token}`)
      .attach('arquivo', conteudo, { filename: nome, contentType: tipo });
    for (const [chave, valor] of Object.entries(campos)) {
      req.field(chave, valor);
    }
    return req;
  };

  it('prepara usuário autenticado', async () => {
    await request(server()).post('/v1/auth/register').send(cred);
    const login = await request(server()).post('/v1/auth/login').send(cred);
    token = login.body.accessToken;
    expect(token).toBeTruthy();
  });

  it('exige autenticação', async () => {
    await request(server()).post('/v1/midia').expect(401);
  });

  it('recusa requisição sem arquivo', async () => {
    const resposta = await request(server())
      .post('/v1/midia')
      .set('Authorization', `Bearer ${token}`)
      .field('modulo', 'grow')
      .field('tipoEntidade', 'planta')
      .expect(400);
    expect(resposta.body.code).toBe('ARQUIVO_AUSENTE');
  });

  it('sobe uma foto do Grow e nunca devolve a chave de armazenamento', async () => {
    const resposta = await enviar(Buffer.from('bytes-da-foto'), 'foto.jpg', 'image/jpeg', {
      modulo: 'grow',
      tipoEntidade: 'planta',
      entidadeId: 'planta-1',
    }).expect(201);

    expect(resposta.body.tipo).toBe('IMAGEM');
    expect(resposta.body.tamanhoBytes).toBe(13);
    expect(resposta.body).not.toHaveProperty('chaveDeArmazenamento');
    midiaId = resposta.body.midiaId;
  });

  it('sobe um exame do Med pela MESMA porta (capacidade do Core)', async () => {
    const resposta = await enviar(Buffer.from('%PDF-1.4'), 'exame.pdf', 'application/pdf', {
      modulo: 'med',
      tipoEntidade: 'tratamento',
      entidadeId: 'trat-1',
    }).expect(201);
    expect(resposta.body.tipo).toBe('DOCUMENTO');
  });

  it('recusa tipo de arquivo fora da lista fechada (415)', async () => {
    const resposta = await enviar(Buffer.from('<svg/>'), 'x.svg', 'image/svg+xml', {
      modulo: 'grow',
      tipoEntidade: 'planta',
    }).expect(415);
    expect(resposta.body.code).toBe('TIPO_DE_MIDIA_NAO_SUPORTADO');
  });

  it('recusa arquivo acima do limite do plano gratuito (402, gatilho do paywall)', async () => {
    const grande = Buffer.alloc(5 * 1024 * 1024 + 1);
    const resposta = await enviar(grande, 'gigante.png', 'image/png', {
      modulo: 'grow',
      tipoEntidade: 'planta',
    }).expect(402);
    expect(resposta.body.code).toBe('MIDIA_ACIMA_DO_LIMITE');
  });

  it('recusa módulo/tipoEntidade fora do padrão de identificador', async () => {
    await enviar(Buffer.from('x'), 'foto.jpg', 'image/jpeg', {
      modulo: 'GROW; DROP TABLE',
      tipoEntidade: 'planta',
    }).expect(400);
  });

  it('lista as mídias de uma entidade', async () => {
    const resposta = await request(server())
      .get('/v1/midia/entidade/grow/planta/planta-1')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(resposta.body).toHaveLength(1);
    expect(resposta.body[0].midiaId).toBe(midiaId);
  });

  describe('URL assinada', () => {
    let url = '';

    it('devolve uma URL temporária para o dono', async () => {
      const resposta = await request(server())
        .get(`/v1/midia/${midiaId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(resposta.body.expiraEmSegundos).toBeGreaterThan(0);
      url = resposta.body.url;
    });

    it('a URL assinada serve os bytes, sem Bearer', async () => {
      const caminho = new URL(url);
      const resposta = await request(server())
        .get(`${caminho.pathname}${caminho.search}`)
        .expect(200);
      expect(resposta.body.toString()).toBe('bytes-da-foto');
    });

    it('link com assinatura adulterada responde 404, igual a inexistente', async () => {
      const caminho = new URL(url);
      caminho.searchParams.set('assinatura', 'a'.repeat(64));
      await request(server()).get(`${caminho.pathname}${caminho.search}`).expect(404);
    });

    it('link para a chave de outro usuário não é servido', async () => {
      const caminho = new URL(url);
      caminho.searchParams.set('chave', 'outro-usuario/midia-x');
      await request(server()).get(`${caminho.pathname}${caminho.search}`).expect(404);
    });

    it('mídia de outro usuário responde 404, sem confirmar existência', async () => {
      const outro = { email: 'outro@cosmaria.app', senha: 'senhaSegura123' };
      await request(server()).post('/v1/auth/register').send(outro);
      const login = await request(server()).post('/v1/auth/login').send(outro);

      await request(server())
        .get(`/v1/midia/${midiaId}`)
        .set('Authorization', `Bearer ${login.body.accessToken}`)
        .expect(404);
    });
  });

  it('remover é idempotente e apaga o objeto', async () => {
    await request(server())
      .delete(`/v1/midia/${midiaId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);
    await request(server())
      .delete(`/v1/midia/${midiaId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    await request(server())
      .get(`/v1/midia/${midiaId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });
});
