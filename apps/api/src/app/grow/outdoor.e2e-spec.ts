import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

/**
 * e2e do Módulo Outdoor (repositórios EM MEMÓRIA).
 * Prova a configuração manual de clima só para ambientes outdoor, a degradação isolada
 * (404 quando ausente) e a desativação.
 */
describe('Grow — módulo outdoor (e2e)', () => {
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
  const cred = { email: 'outdoor@cosmaria.app', senha: 'senhaSegura123' };
  let token = '';
  let ambienteOutdoor = '';
  let ambienteIndoor = '';
  const auth = () => ({ Authorization: `Bearer ${token}` });

  it('prepara ambientes outdoor e indoor', async () => {
    await request(server()).post('/v1/auth/register').send(cred);
    token = (await request(server()).post('/v1/auth/login').send(cred)).body.accessToken;
    ambienteOutdoor = (
      await request(server())
        .post('/v1/ambientes')
        .set(auth())
        .send({ nome: 'Quintal', tipo: 'OUTDOOR' })
    ).body.ambienteId;
    ambienteIndoor = (
      await request(server())
        .post('/v1/ambientes')
        .set(auth())
        .send({ nome: 'Tenda', tipo: 'INDOOR' })
    ).body.ambienteId;
  });

  it('exige autenticação', async () => {
    await request(server()).get(`/v1/ambientes/${ambienteOutdoor}/clima`).expect(401);
  });

  it('ambiente sem o módulo configurado responde 404 (ausência isolada)', async () => {
    await request(server()).get(`/v1/ambientes/${ambienteOutdoor}/clima`).set(auth()).expect(404);
  });

  it('configura o clima manual de um ambiente outdoor', async () => {
    const r = await request(server())
      .put(`/v1/ambientes/${ambienteOutdoor}/clima`)
      .set(auth())
      .send({ localizacaoAproximada: 'Curitiba, PR', latitudeAproximada: -25.42 })
      .expect(200);
    expect(r.body.localizacaoAproximada).toBe('Curitiba, PR');
    expect(r.body.fonte).toBe('MANUAL');
  });

  it('recusa configurar clima em ambiente indoor (409)', async () => {
    await request(server())
      .put(`/v1/ambientes/${ambienteIndoor}/clima`)
      .set(auth())
      .send({ localizacaoAproximada: 'não faz sentido' })
      .expect(409);
  });

  it('recusa latitude fora da faixa (400)', async () => {
    await request(server())
      .put(`/v1/ambientes/${ambienteOutdoor}/clima`)
      .set(auth())
      .send({ latitudeAproximada: 200 })
      .expect(400);
  });

  it('lê o clima configurado', async () => {
    const r = await request(server())
      .get(`/v1/ambientes/${ambienteOutdoor}/clima`)
      .set(auth())
      .expect(200);
    expect(r.body.latitudeAproximada).toBe(-25.42);
  });

  it('reconfigurar atualiza (upsert, não duplica)', async () => {
    const r = await request(server())
      .put(`/v1/ambientes/${ambienteOutdoor}/clima`)
      .set(auth())
      .send({ localizacaoAproximada: 'São Paulo, SP' })
      .expect(200);
    expect(r.body.localizacaoAproximada).toBe('São Paulo, SP');
  });

  it('desativa o módulo (204) e depois some (404)', async () => {
    await request(server())
      .delete(`/v1/ambientes/${ambienteOutdoor}/clima`)
      .set(auth())
      .expect(204);
    await request(server()).get(`/v1/ambientes/${ambienteOutdoor}/clima`).set(auth()).expect(404);
  });

  it('clima de ambiente alheio responde 404', async () => {
    const outro = { email: 'outro-outdoor@cosmaria.app', senha: 'senhaSegura123' };
    await request(server()).post('/v1/auth/register').send(outro);
    const t = (await request(server()).post('/v1/auth/login').send(outro)).body.accessToken;
    await request(server())
      .put(`/v1/ambientes/${ambienteOutdoor}/clima`)
      .set({ Authorization: `Bearer ${t}` })
      .send({ localizacaoAproximada: 'invasão' })
      .expect(404);
  });
});
