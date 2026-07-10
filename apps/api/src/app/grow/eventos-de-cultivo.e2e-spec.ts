import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

/**
 * e2e de Manejo e Sanidade (repositórios EM MEMÓRIA).
 * Prova o histórico imutável do manejo e a resolução monotônica da sanidade.
 */
describe('Grow — manejo e sanidade (e2e)', () => {
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
  const cred = { email: 'eventos@cosmaria.app', senha: 'senhaSegura123' };
  let token = '';
  let cicloId = '';
  let plantaId = '';

  const auth = () => ({ Authorization: `Bearer ${token}` });

  it('prepara ciclo ativo com planta', async () => {
    await request(server()).post('/v1/auth/register').send(cred);
    token = (await request(server()).post('/v1/auth/login').send(cred)).body.accessToken;

    const g = await request(server())
      .post('/v1/geneticas')
      .set(auth())
      .send({ nome: 'OG', tipo: 'FOTOPERIODICA' });
    const a = await request(server())
      .post('/v1/ambientes')
      .set(auth())
      .send({ nome: 'E1', tipo: 'INDOOR' });
    const c = await request(server())
      .post('/v1/ciclos')
      .set(auth())
      .send({ ambienteId: a.body.ambienteId, nome: 'Ciclo 1' });
    cicloId = c.body.cicloId;
    const p = await request(server())
      .post('/v1/plantas')
      .set(auth())
      .send({ cicloId, geneticaId: g.body.geneticaId, nome: 'P1', origem: 'SEMENTE' });
    plantaId = p.body.plantaId;
  });

  it('exige autenticação', async () => {
    await request(server()).post('/v1/eventos-manejo').expect(401);
    await request(server()).post('/v1/eventos-sanidade').expect(401);
  });

  describe('Manejo', () => {
    it('registra topping numa planta', async () => {
      const r = await request(server())
        .post('/v1/eventos-manejo')
        .set(auth())
        .send({ cicloId, plantaId, tipo: 'TOPPING', observacoes: 'primeiro topping' })
        .expect(201);
      expect(r.body.tipo).toBe('TOPPING');
      expect(r.body.plantaId).toBe(plantaId);
    });

    it('registra fertilização do ciclo inteiro (sem planta)', async () => {
      await request(server())
        .post('/v1/eventos-manejo')
        .set(auth())
        .send({ cicloId, tipo: 'FERTILIZACAO' })
        .expect(201)
        .expect((r) => expect(r.body.plantaId).toBeNull());
    });

    it('rejeita tipo de manejo desconhecido', async () => {
      await request(server())
        .post('/v1/eventos-manejo')
        .set(auth())
        .send({ cicloId, tipo: 'MAGIA' })
        .expect(400);
    });

    it('lista os manejos do ciclo', async () => {
      const r = await request(server())
        .get(`/v1/ciclos/${cicloId}/eventos-manejo`)
        .set(auth())
        .expect(200);
      expect(r.body).toHaveLength(2);
    });
  });

  describe('Sanidade — resolução monotônica', () => {
    let eventoId = '';

    it('registra uma praga em aberto', async () => {
      const r = await request(server())
        .post('/v1/eventos-sanidade')
        .set(auth())
        .send({ cicloId, plantaId, tipo: 'PRAGA', severidade: 'MEDIA', descricao: 'ácaros' })
        .expect(201);
      expect(r.body.resolvido).toBe(false);
      eventoId = r.body.eventoId;
    });

    it('resolve com tratamento', async () => {
      const r = await request(server())
        .post(`/v1/eventos-sanidade/${eventoId}/resolver`)
        .set(auth())
        .send({ tratamentoAplicado: 'óleo de neem' })
        .expect(201);
      expect(r.body.resolvido).toBe(true);
      expect(r.body.tratamentoAplicado).toBe('óleo de neem');
    });

    it('resolver de novo é idempotente', async () => {
      const primeira = await request(server())
        .get(`/v1/ciclos/${cicloId}/eventos-sanidade`)
        .set(auth());
      const resolvidoEm = primeira.body[0].resolvidoEm;

      await request(server())
        .post(`/v1/eventos-sanidade/${eventoId}/resolver`)
        .set(auth())
        .send({})
        .expect(201)
        .expect((r) => expect(r.body.resolvidoEm).toBe(resolvidoEm));
    });

    it('registra uma segunda ocorrência com severidade maior (reincidência)', async () => {
      await request(server())
        .post('/v1/eventos-sanidade')
        .set(auth())
        .send({ cicloId, plantaId, tipo: 'PRAGA', severidade: 'ALTA', descricao: 'voltou pior' })
        .expect(201);
    });

    it('filtra só os problemas em aberto', async () => {
      const todos = await request(server())
        .get(`/v1/ciclos/${cicloId}/eventos-sanidade`)
        .set(auth())
        .expect(200);
      const abertos = await request(server())
        .get(`/v1/ciclos/${cicloId}/eventos-sanidade?abertos=true`)
        .set(auth())
        .expect(200);

      expect(todos.body).toHaveLength(2);
      expect(abertos.body).toHaveLength(1);
    });

    it('resolver evento inexistente responde 404', async () => {
      await request(server())
        .post('/v1/eventos-sanidade/nao-existe/resolver')
        .set(auth())
        .send({})
        .expect(404);
    });
  });

  describe('ciclo encerrado', () => {
    it('não aceita mais manejo (409), mas resolver sanidade ainda funciona', async () => {
      const pendente = await request(server())
        .get(`/v1/ciclos/${cicloId}/eventos-sanidade?abertos=true`)
        .set(auth());
      const eventoId = pendente.body[0].eventoId;

      await request(server()).post(`/v1/ciclos/${cicloId}/encerrar`).set(auth()).expect(201);

      await request(server())
        .post('/v1/eventos-manejo')
        .set(auth())
        .send({ cicloId, tipo: 'PODA' })
        .expect(409);

      // Resolver uma praga antes da colheita não deveria ser bloqueado pelo encerramento.
      await request(server())
        .post(`/v1/eventos-sanidade/${eventoId}/resolver`)
        .set(auth())
        .send({})
        .expect(201);
    });
  });

  describe('isolamento entre Contas', () => {
    it('lista de ciclo alheio responde 404', async () => {
      const outro = { email: 'outro-eventos@cosmaria.app', senha: 'senhaSegura123' };
      await request(server()).post('/v1/auth/register').send(outro);
      const t = (await request(server()).post('/v1/auth/login').send(outro)).body.accessToken;

      await request(server())
        .get(`/v1/ciclos/${cicloId}/eventos-manejo`)
        .set({ Authorization: `Bearer ${t}` })
        .expect(404);
    });
  });
});
