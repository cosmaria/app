import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

/**
 * e2e da Complexidade Progressiva (repositórios EM MEMÓRIA).
 * Prova o fluxo único do doc 02 §5.0: nasce essencial, sobe de nível, libera campos
 * individualmente e liga o Modo Especialista.
 */
describe('Complexidade Progressiva (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.AUTH_REPO = 'memory';
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
  });

  afterAll(async () => {
    await app.close();
  });

  const server = () => app.getHttpServer();
  const cred = { email: 'complexidade@cosmaria.app', senha: 'senhaSegura123' };
  let token = '';

  const preferencia = () =>
    request(server()).get('/v1/preferencia-complexidade').set('Authorization', `Bearer ${token}`);

  const atualizar = (corpo: object) =>
    request(server())
      .put('/v1/preferencia-complexidade')
      .set('Authorization', `Bearer ${token}`)
      .send(corpo);

  it('prepara usuário autenticado', async () => {
    await request(server()).post('/v1/auth/register').send(cred);
    const login = await request(server()).post('/v1/auth/login').send(cred);
    token = login.body.accessToken;
    expect(token).toBeTruthy();
  });

  it('exige autenticação', async () => {
    await request(server()).get('/v1/preferencia-complexidade').expect(401);
  });

  it('a Conta nasce no nível essencial', async () => {
    const resposta = await preferencia().expect(200);
    expect(resposta.body).toEqual({
      nivel: 'ESSENCIAL',
      modoEspecialista: false,
      camposHabilitados: [],
    });
  });

  it('libera um campo avançado sem subir de nível (habilitação progressiva)', async () => {
    const resposta = await atualizar({ habilitarCampos: ['grow.ec'] }).expect(200);
    expect(resposta.body.nivel).toBe('ESSENCIAL');
    expect(resposta.body.camposHabilitados).toEqual(['grow.ec']);
  });

  it('sobe para avançado sem perder os campos já liberados', async () => {
    const resposta = await atualizar({ nivel: 'AVANCADO' }).expect(200);
    expect(resposta.body.nivel).toBe('AVANCADO');
    expect(resposta.body.camposHabilitados).toEqual(['grow.ec']);
    expect(resposta.body.modoEspecialista).toBe(false);
  });

  it('liga o Modo Especialista', async () => {
    const resposta = await atualizar({ nivel: 'ESPECIALISTA' }).expect(200);
    expect(resposta.body.modoEspecialista).toBe(true);
  });

  it('desabilita um campo liberado individualmente', async () => {
    const resposta = await atualizar({ desabilitarCampos: ['grow.ec'] }).expect(200);
    expect(resposta.body.camposHabilitados).toEqual([]);
    // O nível continua especialista: para ver menos, o usuário baixa o nível.
    expect(resposta.body.modoEspecialista).toBe(true);
  });

  it('rejeita nível desconhecido e código de campo fora do padrão', async () => {
    await atualizar({ nivel: 'GURU' }).expect(400);
    await atualizar({ habilitarCampos: ['DROP TABLE'] }).expect(400);
    await atualizar({ habilitarCampos: ['semponto'] }).expect(400);
  });

  it('rejeita campo desconhecido no corpo', async () => {
    await atualizar({ usuarioId: 'tentativa-de-injecao' }).expect(400);
  });

  it('a preferência persiste entre requisições', async () => {
    const resposta = await preferencia().expect(200);
    expect(resposta.body.nivel).toBe('ESPECIALISTA');
  });
});
