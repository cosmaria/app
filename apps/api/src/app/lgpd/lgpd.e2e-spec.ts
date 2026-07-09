import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { JwtTokenService } from '@cosmaria/core-infrastructure';
import { Papel } from '@cosmaria/core-domain';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

/**
 * e2e de Consentimento/LGPD/Auditoria (repositório EM MEMÓRIA). Prova o fluxo HTTP
 * completo, o gate administrativo (RBAC) da trilha, e o caminho do EDA:
 * consentimento → evento → assinante de auditoria → leitura admin.
 */
describe('LGPD & Auditoria (e2e)', () => {
  let app: INestApplication;
  const secrets = { access: 'test-access', refresh: 'test-refresh' };

  const tokenAdmin = (): string =>
    new JwtTokenService({
      accessSecret: secrets.access,
      refreshSecret: secrets.refresh,
      accessTtlSegundos: 900,
      refreshTtlSegundos: 3600,
    }).gerarAccessToken({
      usuarioId: 'admin-1',
      email: 'admin@cosmaria.app',
      papeis: [Papel.ADMIN],
    }).token;

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
  const cred = { email: 'lgpd@cosmaria.app', senha: 'senhaSegura123' };
  let token = '';

  it('prepara usuário autenticado', async () => {
    await request(server()).post('/v1/auth/register').send(cred);
    const login = await request(server()).post('/v1/auth/login').send(cred);
    token = login.body.accessToken;
    expect(token).toBeTruthy();
  });

  it('registra, lista e revoga consentimento', async () => {
    const reg = await request(server())
      .post('/v1/consentimento')
      .set('Authorization', `Bearer ${token}`)
      .send({ tipo: 'TERMOS_DE_USO', versaoTexto: 'v1' });
    expect(reg.status).toBe(201);
    expect(reg.body.vigente).toBe(true);

    const lista = await request(server())
      .get('/v1/consentimento')
      .set('Authorization', `Bearer ${token}`);
    expect(lista.body).toHaveLength(1);

    const del = await request(server())
      .delete('/v1/consentimento/TERMOS_DE_USO')
      .set('Authorization', `Bearer ${token}`);
    expect(del.status).toBe(204);

    const depois = await request(server())
      .get('/v1/consentimento')
      .set('Authorization', `Bearer ${token}`);
    expect(depois.body[0].vigente).toBe(false);
  });

  it('solicita exportação e consulta o status', async () => {
    const exp = await request(server())
      .post('/v1/conta/exportar')
      .set('Authorization', `Bearer ${token}`);
    expect(exp.status).toBe(202);
    expect(exp.body.status).toBe('PENDENTE');

    const status = await request(server())
      .get(`/v1/conta/exportacao/${exp.body.solicitacaoId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(status.status).toBe(200);
    expect(status.body.solicitacaoId).toBe(exp.body.solicitacaoId);
  });

  it('trilha de auditoria: 403 para usuário comum, 200 para ADMIN', async () => {
    const negado = await request(server())
      .get('/v1/admin/trilha-auditoria')
      .set('Authorization', `Bearer ${token}`);
    expect(negado.status).toBe(403);
    expect(negado.body.code).toBe('ACESSO_NEGADO');

    const ok = await request(server())
      .get('/v1/admin/trilha-auditoria')
      .set('Authorization', `Bearer ${tokenAdmin()}`);
    expect(ok.status).toBe(200);
    // O assinante de auditoria já registrou as mudanças de consentimento/exportação.
    const acoes = (ok.body as Array<{ entidadeAfetada: string }>).map((e) => e.entidadeAfetada);
    expect(acoes).toContain('ConsentimentoRegistro');
    expect(acoes).toContain('SolicitacaoDeExportacao');
  });

  it('exclusão de conta bloqueia login subsequente', async () => {
    const exclusao = await request(server())
      .post('/v1/conta/excluir')
      .set('Authorization', `Bearer ${token}`);
    expect(exclusao.status).toBe(202);

    const login = await request(server()).post('/v1/auth/login').send(cred);
    expect(login.status).toBe(403);
    expect(login.body.code).toBe('CONTA_INATIVA');
  });
});
