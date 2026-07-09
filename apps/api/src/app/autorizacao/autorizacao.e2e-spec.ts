import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtTokenService } from '@cosmaria/core-infrastructure';
import { Papel } from '@cosmaria/core-domain';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

/**
 * e2e de Autorização (RBAC, doc 04 §11) com repositório EM MEMÓRIA.
 * Prova a cadeia completa por HTTP: papéis viajam no token → JwtAuthGuard anexa a
 * identidade → PoliticaDeAutorizacao decide. Autorização stateless (não toca o banco).
 */
describe('Autorização (e2e)', () => {
  let app: INestApplication;

  const secrets = { access: 'test-access', refresh: 'test-refresh' };

  beforeAll(async () => {
    process.env.AUTH_REPO = 'memory';
    process.env.ACCESS_TOKEN_SECRET = secrets.access;
    process.env.REFRESH_TOKEN_SECRET = secrets.refresh;

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

  // Emite um access token arbitrário (mesmo segredo da app) para testar papéis
  // sem depender de um endpoint administrativo de atribuição (épica futura).
  const tokenComPapeis = (papeis: Papel[]): string =>
    new JwtTokenService({
      accessSecret: secrets.access,
      refreshSecret: secrets.refresh,
      accessTtlSegundos: 900,
      refreshTtlSegundos: 3600,
    }).gerarAccessToken({ usuarioId: 'u-teste', email: 'u@cosmaria.app', papeis }).token;

  it('exige autenticação (401 sem token)', async () => {
    const res = await request(server()).get('/v1/autorizacao/verificar?permissao=GERIR_PLATAFORMA');
    expect(res.status).toBe(401);
  });

  it('USUARIO comum: /eu retorna papel USUARIO e nenhuma permissão', async () => {
    const token = tokenComPapeis([Papel.USUARIO]);
    const res = await request(server())
      .get('/v1/autorizacao/eu')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.papeis).toEqual(['USUARIO']);
    expect(res.body.permissoes).toEqual([]);
  });

  it('USUARIO comum: verificar GERIR_PLATAFORMA = permitido false', async () => {
    const token = tokenComPapeis([Papel.USUARIO]);
    const res = await request(server())
      .get('/v1/autorizacao/verificar?permissao=GERIR_PLATAFORMA')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ permissao: 'GERIR_PLATAFORMA', permitido: false });
  });

  it('ADMIN: verificar GERIR_PLATAFORMA = permitido true', async () => {
    const token = tokenComPapeis([Papel.USUARIO, Papel.ADMIN]);
    const res = await request(server())
      .get('/v1/autorizacao/verificar?permissao=GERIR_PLATAFORMA')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.permitido).toBe(true);
  });

  it('ADMIN: /eu lista as permissões efetivas', async () => {
    const token = tokenComPapeis([Papel.ADMIN]);
    const res = await request(server())
      .get('/v1/autorizacao/eu')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.permissoes).toEqual(
      expect.arrayContaining(['GERIR_PLATAFORMA', 'MODERAR_COMUNIDADE']),
    );
  });

  it('rejeita permissão desconhecida (400)', async () => {
    const token = tokenComPapeis([Papel.ADMIN]);
    const res = await request(server())
      .get('/v1/autorizacao/verificar?permissao=NAO_EXISTE')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('PERMISSAO_INVALIDA');
  });
});
