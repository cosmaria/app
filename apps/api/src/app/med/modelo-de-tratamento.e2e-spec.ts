import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { assinarPayloadWebhook } from '@cosmaria/core-infrastructure';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

const SEGREDO = 'segredo-de-teste';

/**
 * e2e de Modelos de Tratamento (repositórios EM MEMÓRIA).
 * Prova o gate de Premium (402 no gratuito, criação liberada após o webhook conceder
 * Premium), a leitura/exclusão sempre permitidas, e que `tratamentos/modelos` não colide
 * com a rota paramétrica `tratamentos/:tratamentoId`.
 */
describe('Med — modelos de tratamento (e2e)', () => {
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
  const cred = { email: 'modelos-med@cosmaria.app', senha: 'senhaSegura123' };
  let token = '';
  let usuarioId = '';
  const auth = () => ({ Authorization: `Bearer ${token}` });

  // Concede Premium pela única via legítima: o webhook de pagamento assinado (doc 09, API-7).
  const concederPremium = () => {
    const payload = {
      id: 'evt-modelos-med-1',
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
    await request(server()).get('/v1/tratamentos/modelos').expect(401);
  });

  it('usuário gratuito é barrado ao criar modelo (402, paywall)', async () => {
    await request(server())
      .post('/v1/tratamentos/modelos')
      .set(auth())
      .send({ nome: 'Protocolo de dor crônica' })
      .expect(402);
  });

  it('a lista começa vazia (leitura nunca é gated)', async () => {
    const r = await request(server()).get('/v1/tratamentos/modelos').set(auth()).expect(200);
    expect(r.body).toEqual([]);
  });

  let modeloId = '';

  describe('após conceder Premium', () => {
    it('cria um modelo nomeado', async () => {
      await concederPremium().expect(200);
      const r = await request(server())
        .post('/v1/tratamentos/modelos')
        .set(auth())
        .send({
          nome: 'Protocolo de dor crônica',
          condicaoPadrao: 'Dor crônica',
          notas: '1 gota sublingual à noite',
        })
        .expect(201);
      expect(r.body.nome).toBe('Protocolo de dor crônica');
      expect(r.body.condicaoPadrao).toBe('Dor crônica');
      modeloId = r.body.modeloId;
    });

    it('lista os modelos do usuário', async () => {
      const r = await request(server()).get('/v1/tratamentos/modelos').set(auth()).expect(200);
      expect(r.body).toHaveLength(1);
    });

    it('a rota tratamentos/modelos não colide com tratamentos/:id', async () => {
      // Um id de tratamento inexistente responde 404; "modelos" nunca cai aqui.
      await request(server()).get('/v1/tratamentos/id-inexistente').set(auth()).expect(404);
      await request(server()).get('/v1/tratamentos/modelos').set(auth()).expect(200);
    });

    it('remove o modelo (204)', async () => {
      await request(server()).delete(`/v1/tratamentos/modelos/${modeloId}`).set(auth()).expect(204);
      const r = await request(server()).get('/v1/tratamentos/modelos').set(auth()).expect(200);
      expect(r.body).toEqual([]);
    });
  });

  it('modelo de outro usuário responde 404 ao remover', async () => {
    const criado = await request(server())
      .post('/v1/tratamentos/modelos')
      .set(auth())
      .send({ nome: 'Privado' })
      .expect(201);

    const outro = { email: 'outro-modelos-med@cosmaria.app', senha: 'senhaSegura123' };
    await request(server()).post('/v1/auth/register').send(outro);
    const t = (await request(server()).post('/v1/auth/login').send(outro)).body.accessToken;

    await request(server())
      .delete(`/v1/tratamentos/modelos/${criado.body.modeloId}`)
      .set({ Authorization: `Bearer ${t}` })
      .expect(404);
  });
});
