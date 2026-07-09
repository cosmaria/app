import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { assinarPayloadWebhook } from '@cosmaria/core-infrastructure';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

const SEGREDO = 'segredo-de-teste';
const CABECALHO = 'x-cosmaria-assinatura';

/**
 * e2e de Billing/Premium (repositórios EM MEMÓRIA). Prova o fluxo HTTP completo, a
 * verificação HMAC real do webhook (o adaptador de verdade, não um dublê) e que o
 * Premium só é concedido pelo webhook — nunca pelo upgrade.
 */
describe('Billing & Premium (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.AUTH_REPO = 'memory';
    process.env.ACCESS_TOKEN_SECRET = 'test-access';
    process.env.REFRESH_TOKEN_SECRET = 'test-refresh';
    process.env.PAGAMENTO_WEBHOOK_SECRET = SEGREDO;

    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    // rawBody: o webhook verifica o HMAC sobre os bytes originais (doc 09, API-7).
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
  const cred = { email: 'billing@cosmaria.app', senha: 'senhaSegura123' };
  let token = '';
  let usuarioId = '';

  /**
   * Envia o webhook assinando exatamente os bytes que serão transmitidos.
   * O corpo vai como **texto**: passar um Buffer para o supertest com content-type JSON
   * faria ele serializar o próprio Buffer (`{"type":"Buffer","data":[…]}`), e a
   * assinatura cobriria bytes diferentes dos que chegam ao servidor.
   */
  const enviarWebhook = (payload: object, segredo = SEGREDO) => {
    const corpoTexto = JSON.stringify(payload);
    const assinatura = assinarPayloadWebhook(Buffer.from(corpoTexto), segredo);
    return request(server())
      .post('/v1/webhooks/pagamento')
      .set('Content-Type', 'application/json')
      .set(CABECALHO, assinatura)
      .send(corpoTexto);
  };

  it('prepara usuário autenticado', async () => {
    const reg = await request(server()).post('/v1/auth/register').send(cred);
    usuarioId = reg.body.usuarioId;
    const login = await request(server()).post('/v1/auth/login').send(cred);
    token = login.body.accessToken;
    expect(token).toBeTruthy();
  });

  it('a Conta nasce no plano gratuito, plenamente utilizável', async () => {
    const resposta = await request(server())
      .get('/v1/assinatura')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(resposta.body.plano).toBe('GRATUITO');
    expect(resposta.body.premiumAtivo).toBe(false);
  });

  it('GET /v1/conta/limites devolve os limites do plano vigente', async () => {
    const resposta = await request(server())
      .get('/v1/conta/limites')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(resposta.body.plano).toBe('GRATUITO');
    expect(resposta.body.limites).toContainEqual({
      chave: 'grow.ambientes_simultaneos',
      limite: 2,
    });
  });

  it('upgrade recusa quando não há preço configurado para a região', async () => {
    const resposta = await request(server())
      .post('/v1/assinatura/upgrade')
      .set('Authorization', `Bearer ${token}`)
      .send({ ciclo: 'MENSAL', pais: 'BR' })
      .expect(400);

    expect(resposta.body.code).toBe('PRECO_NAO_CONFIGURADO');
  });

  it('cancelar sem assinatura Premium responde 409', async () => {
    const resposta = await request(server())
      .post('/v1/assinatura/cancelar')
      .set('Authorization', `Bearer ${token}`)
      .expect(409);
    expect(resposta.body.code).toBe('ASSINATURA_NAO_PREMIUM');
  });

  it('exige autenticação em toda a superfície de assinatura', async () => {
    await request(server()).get('/v1/assinatura').expect(401);
    await request(server()).get('/v1/conta/limites').expect(401);
  });

  describe('webhook de pagamento (doc 09, arquétipo API-7)', () => {
    it('rejeita payload sem cabeçalho de assinatura', async () => {
      await request(server())
        .post('/v1/webhooks/pagamento')
        .send({ id: 'evt-x', tipo: 'PAGAMENTO_RECEBIDO', usuarioId })
        .expect(401);
    });

    it('rejeita payload assinado com o segredo errado', async () => {
      const resposta = await enviarWebhook(
        { id: 'evt-forjado', tipo: 'PAGAMENTO_RECEBIDO', usuarioId },
        'segredo-do-atacante',
      ).expect(401);
      expect(resposta.body.code).toBe('ASSINATURA_PAYLOAD_INVALIDA');
    });

    it('rejeita payload assinado porém malformado', async () => {
      await enviarWebhook({ id: 'evt-y', tipo: 'TIPO_DESCONHECIDO', usuarioId }).expect(401);
    });

    it('pagamento recebido é o ÚNICO caminho que concede Premium', async () => {
      await enviarWebhook({
        id: 'evt-1',
        tipo: 'PAGAMENTO_RECEBIDO',
        usuarioId,
        vigenteAte: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      })
        .expect(200)
        .expect((r) => expect(r.body.processado).toBe(true));

      const assinatura = await request(server())
        .get('/v1/assinatura')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(assinatura.body.premiumAtivo).toBe(true);
      expect(assinatura.body.status).toBe('ATIVA');
    });

    it('reentrega do mesmo evento responde 200 sem reprocessar', async () => {
      const resposta = await enviarWebhook({
        id: 'evt-1',
        tipo: 'PAGAMENTO_RECEBIDO',
        usuarioId,
        vigenteAte: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      }).expect(200);

      expect(resposta.body.processado).toBe(false);
    });

    it('Premium desbloqueia os limites de Grow e Med de uma vez (assinatura única)', async () => {
      const resposta = await request(server())
        .get('/v1/conta/limites')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(resposta.body.plano).toBe('PREMIUM');
      expect(resposta.body.limites).toContainEqual({
        chave: 'grow.ambientes_simultaneos',
        limite: null,
      });
    });
  });

  describe('assinatura já ativa', () => {
    it('recusa novo upgrade com 409', async () => {
      const resposta = await request(server())
        .post('/v1/assinatura/upgrade')
        .set('Authorization', `Bearer ${token}`)
        .send({ ciclo: 'MENSAL', pais: 'BR' })
        .expect(409);
      expect(resposta.body.code).toBe('ASSINATURA_JA_ATIVA');
    });

    it('cancelamento gentil mantém o Premium até o fim do período pago', async () => {
      const resposta = await request(server())
        .post('/v1/assinatura/cancelar')
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      expect(resposta.body.status).toBe('CANCELADA');
      expect(resposta.body.premiumAtivo).toBe(true);
    });

    it('falha de pagamento suspende o Premium', async () => {
      await enviarWebhook({
        id: 'evt-2',
        tipo: 'PAGAMENTO_FALHOU',
        usuarioId,
        motivo: 'cartao_recusado',
      }).expect(200);

      const assinatura = await request(server())
        .get('/v1/assinatura')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(assinatura.body.status).toBe('INADIMPLENTE');
      expect(assinatura.body.premiumAtivo).toBe(false);
    });

    it('e os limites voltam aos do plano gratuito, sem perda de dado', async () => {
      const resposta = await request(server())
        .get('/v1/conta/limites')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(resposta.body.plano).toBe('GRATUITO');
    });
  });
});
