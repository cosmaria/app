import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

/**
 * e2e do Registro Ambiental (repositórios EM MEMÓRIA).
 *
 * Prova o check-in diário único (doc 02 §4): o iniciante registra dois números e recebe
 * o VPD calculado; o especialista ganha DLI. E prova a Complexidade Progressiva
 * decidindo quais campos aparecem, sem nunca filtrar a escrita.
 */
describe('Grow — registro ambiental (e2e)', () => {
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
  const cred = { email: 'checkin@cosmaria.app', senha: 'senhaSegura123' };
  let token = '';
  let cicloId = '';
  let plantaId = '';

  const auth = () => ({ Authorization: `Bearer ${token}` });

  it('prepara ciclo ativo com uma planta', async () => {
    await request(server()).post('/v1/auth/register').send(cred);
    const login = await request(server()).post('/v1/auth/login').send(cred);
    token = login.body.accessToken;

    const genetica = await request(server())
      .post('/v1/geneticas')
      .set(auth())
      .send({ nome: 'OG Kush', tipo: 'FOTOPERIODICA' })
      .expect(201);

    const ambiente = await request(server())
      .post('/v1/ambientes')
      .set(auth())
      .send({ nome: 'Estufa 1', tipo: 'INDOOR' })
      .expect(201);

    const ciclo = await request(server())
      .post('/v1/ciclos')
      .set(auth())
      .send({ ambienteId: ambiente.body.ambienteId, nome: 'Ciclo 1' })
      .expect(201);
    cicloId = ciclo.body.cicloId;

    const planta = await request(server())
      .post('/v1/plantas')
      .set(auth())
      .send({
        cicloId,
        geneticaId: genetica.body.geneticaId,
        nome: 'Planta 1',
        origem: 'SEMENTE',
      })
      .expect(201);
    plantaId = planta.body.plantaId;
  });

  it('exige autenticação', async () => {
    await request(server()).post('/v1/registros-ambientais').expect(401);
    await request(server()).get('/v1/registros-ambientais/campos').expect(401);
  });

  it('o iniciante vê só os campos essenciais do check-in', async () => {
    const resposta = await request(server())
      .get('/v1/registros-ambientais/campos')
      .set(auth())
      .expect(200);
    expect(resposta.body).toEqual(['grow.temperatura', 'grow.umidade', 'grow.observacoes']);
  });

  it('registra temperatura e umidade, e o VPD vem calculado', async () => {
    const resposta = await request(server())
      .post('/v1/registros-ambientais')
      .set(auth())
      .send({ cicloId, temperaturaC: 25, umidadeRelativa: 60 })
      .expect(201);

    expect(resposta.body.vpdKpa).toBeCloseTo(1.267, 2);
    expect(resposta.body.dli).toBeNull();
    expect(resposta.body.origem).toBe('MANUAL');
  });

  it('a escrita não é filtrada por nível — EC é aceito de um usuário essencial', async () => {
    await request(server())
      .post('/v1/registros-ambientais')
      .set(auth())
      .send({ cicloId, plantaId, ph: 6.2, ec: 1.8 })
      .expect(201)
      .expect((r) => {
        expect(r.body.ph).toBe(6.2);
        expect(r.body.plantaId).toBe(plantaId);
        // Sem temperatura/umidade não há VPD: um derivado não se inventa.
        expect(r.body.vpdKpa).toBeNull();
      });
  });

  it('PPFD e horas de luz produzem o DLI', async () => {
    const resposta = await request(server())
      .post('/v1/registros-ambientais')
      .set(auth())
      .send({ cicloId, ppfd: 600, horasDeLuz: 18 })
      .expect(201);
    expect(resposta.body.dli).toBeCloseTo(38.88, 2);
  });

  it('recusa check-in sem nenhuma medição (400)', async () => {
    const resposta = await request(server())
      .post('/v1/registros-ambientais')
      .set(auth())
      .send({ cicloId, observacoes: 'só um texto' })
      .expect(400);
    expect(resposta.body.code).toBe('REGISTRO_SEM_MEDICAO');
  });

  it('rejeita valores fisicamente impossíveis', async () => {
    await request(server())
      .post('/v1/registros-ambientais')
      .set(auth())
      .send({ cicloId, umidadeRelativa: 150 })
      .expect(400);

    await request(server())
      .post('/v1/registros-ambientais')
      .set(auth())
      .send({ cicloId, horasDeLuz: 30 })
      .expect(400);

    await request(server())
      .post('/v1/registros-ambientais')
      .set(auth())
      .send({ cicloId, ph: 20 })
      .expect(400);
  });

  it('a série do ciclo vem do mais recente ao mais antigo, paginada', async () => {
    const resposta = await request(server())
      .get(`/v1/ciclos/${cicloId}/registros-ambientais?limite=2`)
      .set(auth())
      .expect(200);

    expect(resposta.body.total).toBe(3);
    expect(resposta.body.itens).toHaveLength(2);
  });

  describe('o Modo Especialista revela os campos avançados', () => {
    it('após ligar, todos os campos do check-in aparecem', async () => {
      await request(server())
        .put('/v1/preferencia-complexidade')
        .set(auth())
        .send({ nivel: 'ESPECIALISTA' })
        .expect(200);

      const campos = await request(server())
        .get('/v1/registros-ambientais/campos')
        .set(auth())
        .expect(200);

      expect(campos.body).toContain('grow.ppfd');
      expect(campos.body).toContain('grow.delta_folha');
      expect(campos.body).toContain('grow.ec');
    });
  });

  describe('ciclo encerrado', () => {
    it('não aceita mais check-in (409), mas a série continua legível', async () => {
      await request(server()).post(`/v1/ciclos/${cicloId}/encerrar`).set(auth()).expect(201);

      await request(server())
        .post('/v1/registros-ambientais')
        .set(auth())
        .send({ cicloId, temperaturaC: 22, umidadeRelativa: 55 })
        .expect(409)
        .expect((r) => expect(r.body.code).toBe('CICLO_ENCERRADO'));

      const serie = await request(server())
        .get(`/v1/ciclos/${cicloId}/registros-ambientais`)
        .set(auth())
        .expect(200);
      expect(serie.body.total).toBe(3);
    });
  });

  describe('isolamento entre Contas', () => {
    it('a série de ciclo alheio responde 404', async () => {
      const outro = { email: 'outro-checkin@cosmaria.app', senha: 'senhaSegura123' };
      await request(server()).post('/v1/auth/register').send(outro);
      const login = await request(server()).post('/v1/auth/login').send(outro);
      const alheio = { Authorization: `Bearer ${login.body.accessToken}` };

      await request(server())
        .get(`/v1/ciclos/${cicloId}/registros-ambientais`)
        .set(alheio)
        .expect(404);

      await request(server())
        .post('/v1/registros-ambientais')
        .set(alheio)
        .send({ cicloId, temperaturaC: 25, umidadeRelativa: 60 })
        .expect(404);
    });
  });
});
