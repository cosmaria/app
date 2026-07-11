import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { assinarPayloadWebhook } from '@cosmaria/core-infrastructure';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

const SEGREDO = 'segredo-de-teste';

/**
 * e2e de Modelos de Ciclo (repositórios EM MEMÓRIA).
 * Prova o gate de Premium (402 no gratuito, criação liberada após o webhook conceder
 * Premium), a leitura/exclusão sempre permitidas, e que `ciclos/modelos` não colide com
 * a rota paramétrica `ciclos/:id`.
 */
describe('Grow — modelos de ciclo (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.AUTH_REPO = 'memory';
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
  });

  afterAll(async () => {
    delete process.env.PAGAMENTO_WEBHOOK_SECRET;
    await app.close();
  });

  const server = () => app.getHttpServer();
  const cred = { email: 'modelos@cosmaria.app', senha: 'senhaSegura123' };
  let token = '';
  let usuarioId = '';
  const auth = () => ({ Authorization: `Bearer ${token}` });

  // Concede Premium pela única via legítima: o webhook de pagamento assinado (doc 09, API-7).
  const concederPremium = () => {
    const payload = {
      id: 'evt-modelos-1',
      tipo: 'PAGAMENTO_RECEBIDO',
      usuarioId,
      vigenteAte: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    };
    const corpo = JSON.stringify(payload);
    return request(server())
      .post('/v1/webhooks/pagamento')
      .set('Content-Type', 'application/json')
      .set('x-cosmaria-assinatura', assinarPayloadWebhook(Buffer.from(corpo), SEGREDO))
      .send(corpo);
  };

  it('prepara usuário gratuito', async () => {
    const reg = await request(server()).post('/v1/auth/register').send(cred);
    usuarioId = reg.body.usuarioId;
    token = (await request(server()).post('/v1/auth/login').send(cred)).body.accessToken;
  });

  it('exige autenticação', async () => {
    await request(server()).get('/v1/ciclos/modelos').expect(401);
  });

  it('usuário gratuito é barrado ao criar modelo (402, paywall)', async () => {
    await request(server())
      .post('/v1/ciclos/modelos')
      .set(auth())
      .send({ nome: 'Autoflor de verão' })
      .expect(402);
  });

  it('a lista começa vazia (leitura nunca é gated)', async () => {
    const r = await request(server()).get('/v1/ciclos/modelos').set(auth()).expect(200);
    expect(r.body).toEqual([]);
  });

  let modeloId = '';

  describe('após conceder Premium', () => {
    it('cria um modelo nomeado', async () => {
      await concederPremium().expect(200);
      const r = await request(server())
        .post('/v1/ciclos/modelos')
        .set(auth())
        .send({
          nome: 'Autoflor de verão',
          faseInicial: 'VEGETATIVO',
          rotinaPadrao: 'rega 2/2 dias',
        })
        .expect(201);
      expect(r.body.nome).toBe('Autoflor de verão');
      expect(r.body.faseInicial).toBe('VEGETATIVO');
      modeloId = r.body.modeloId;
    });

    it('lista os modelos do usuário', async () => {
      const r = await request(server()).get('/v1/ciclos/modelos').set(auth()).expect(200);
      expect(r.body).toHaveLength(1);
    });

    it('a rota ciclos/modelos não colide com ciclos/:id', async () => {
      // Um id de ciclo inexistente responde 404; "modelos" nunca cai aqui (senão daria 404).
      await request(server()).get('/v1/ciclos/id-inexistente').set(auth()).expect(404);
      await request(server()).get('/v1/ciclos/modelos').set(auth()).expect(200);
    });

    it('remove o modelo (204)', async () => {
      await request(server()).delete(`/v1/ciclos/modelos/${modeloId}`).set(auth()).expect(204);
      const r = await request(server()).get('/v1/ciclos/modelos').set(auth()).expect(200);
      expect(r.body).toEqual([]);
    });
  });

  it('modelo de outro usuário responde 404 ao remover', async () => {
    // Recria um modelo com o usuário premium atual.
    const criado = await request(server())
      .post('/v1/ciclos/modelos')
      .set(auth())
      .send({ nome: 'Privado' })
      .expect(201);

    const outro = { email: 'outro-modelos@cosmaria.app', senha: 'senhaSegura123' };
    await request(server()).post('/v1/auth/register').send(outro);
    const t = (await request(server()).post('/v1/auth/login').send(outro)).body.accessToken;

    await request(server())
      .delete(`/v1/ciclos/modelos/${criado.body.modeloId}`)
      .set({ Authorization: `Bearer ${t}` })
      .expect(404);
  });
});
