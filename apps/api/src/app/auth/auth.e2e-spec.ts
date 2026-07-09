import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from './domain-exception.filter';

/**
 * Teste e2e da autenticação (doc 13 §15). Sobe o Modular Monolith inteiro com o
 * repositório EM MEMÓRIA (sem depender de PostgreSQL), e exercita o fluxo HTTP
 * completo pelos controllers reais: register → login → refresh (rotação) → reuso.
 */
describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.AUTH_REPO = 'memory';
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
  });

  afterAll(async () => {
    await app.close();
  });

  const server = () => app.getHttpServer();
  const cred = { email: 'e2e@cosmaria.app', senha: 'senhaSegura123' };

  it('POST /v1/auth/register cria a conta (201)', async () => {
    const res = await request(server()).post('/v1/auth/register').send(cred);
    expect(res.status).toBe(201);
    expect(res.body.usuarioId).toBeTruthy();
    expect(res.body.email).toBe(cred.email);
  });

  it('rejeita e-mail duplicado (409)', async () => {
    const res = await request(server()).post('/v1/auth/register').send(cred);
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('EMAIL_JA_CADASTRADO');
  });

  it('rejeita senha curta na validação (400)', async () => {
    const res = await request(server())
      .post('/v1/auth/register')
      .send({ email: 'x@cosmaria.app', senha: '123' });
    expect(res.status).toBe(400);
  });

  let refreshToken = '';

  it('POST /v1/auth/login autentica e retorna tokens (200)', async () => {
    const res = await request(server()).post('/v1/auth/login').send(cred);
    expect(res.status).toBe(200);
    expect(res.body.tokenType).toBe('Bearer');
    expect(res.body.accessToken).toBeTruthy();
    expect(res.body.refreshToken).toBeTruthy();
    expect(res.body.usuario.email).toBe(cred.email);
    refreshToken = res.body.refreshToken;
  });

  it('rejeita senha incorreta com 401 genérico', async () => {
    const res = await request(server())
      .post('/v1/auth/login')
      .send({ email: cred.email, senha: 'errada' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('CREDENCIAIS_INVALIDAS');
  });

  let novoRefresh = '';

  it('POST /v1/auth/refresh rotaciona os tokens (200)', async () => {
    const res = await request(server()).post('/v1/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(200);
    expect(res.body.refreshToken).toBeTruthy();
    expect(res.body.refreshToken).not.toBe(refreshToken);
    novoRefresh = res.body.refreshToken;
  });

  it('rejeita reuso do refresh token antigo (401)', async () => {
    const res = await request(server()).post('/v1/auth/refresh').send({ refreshToken });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('SESSAO_INVALIDA');
  });

  it('aceita o novo refresh token (200)', async () => {
    const res = await request(server())
      .post('/v1/auth/refresh')
      .send({ refreshToken: novoRefresh });
    expect(res.status).toBe(200);
  });
});
