import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

/**
 * e2e de Tarefas (repositórios EM MEMÓRIA).
 * Prova o CRUD, a conclusão, a recorrência (gera a próxima ocorrência) e o isolamento.
 */
describe('Grow — tarefas (e2e)', () => {
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
  const cred = { email: 'tarefas@cosmaria.app', senha: 'senhaSegura123' };
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
    await request(server()).get('/v1/tarefas').expect(401);
    await request(server()).post('/v1/tarefas').expect(401);
  });

  let tarefaPontual = '';
  let tarefaRecorrente = '';

  describe('CRUD', () => {
    it('cria uma tarefa pontual', async () => {
      const r = await request(server())
        .post('/v1/tarefas')
        .set(auth())
        .send({ cicloId, plantaId, titulo: 'Transplante', tipo: 'TRANSPLANTE' })
        .expect(201);
      expect(r.body.status).toBe('PENDENTE');
      expect(r.body.recorrente).toBe(false);
      tarefaPontual = r.body.tarefaId;
    });

    it('rejeita tipo de tarefa desconhecido', async () => {
      await request(server())
        .post('/v1/tarefas')
        .set(auth())
        .send({ cicloId, titulo: 'x', tipo: 'MAGIA' })
        .expect(400);
    });

    it('rejeita planta que não é do ciclo', async () => {
      await request(server())
        .post('/v1/tarefas')
        .set(auth())
        .send({ cicloId, plantaId: 'fantasma', titulo: 'x', tipo: 'PODA' })
        .expect(404);
    });

    it('edita o título da tarefa', async () => {
      const r = await request(server())
        .put(`/v1/tarefas/${tarefaPontual}`)
        .set(auth())
        .send({ titulo: 'Transplante para vaso maior' })
        .expect(200);
      expect(r.body.titulo).toBe('Transplante para vaso maior');
    });
  });

  describe('conclusão e recorrência', () => {
    it('cria uma tarefa recorrente (rega a cada 2 dias)', async () => {
      const r = await request(server())
        .post('/v1/tarefas')
        .set(auth())
        .send({
          cicloId,
          titulo: 'Regar',
          tipo: 'REGA',
          previstaPara: '2026-07-11T09:00:00.000Z',
          recorrenciaDias: 2,
        })
        .expect(201);
      expect(r.body.recorrente).toBe(true);
      tarefaRecorrente = r.body.tarefaId;
    });

    it('concluir a recorrente gera a próxima ocorrência', async () => {
      const r = await request(server())
        .post(`/v1/tarefas/${tarefaRecorrente}/concluir`)
        .set(auth())
        .expect(201);
      expect(r.body.tarefa.status).toBe('CONCLUIDA');
      expect(r.body.proximaTarefa).not.toBeNull();
      expect(r.body.proximaTarefa.status).toBe('PENDENTE');
      // 09/07 base + 2 dias = 13/07
      expect(r.body.proximaTarefa.previstaPara).toBe('2026-07-13T09:00:00.000Z');
    });

    it('concluir de novo é idempotente e não reagenda', async () => {
      const r = await request(server())
        .post(`/v1/tarefas/${tarefaRecorrente}/concluir`)
        .set(auth())
        .expect(201);
      expect(r.body.proximaTarefa).toBeNull();
    });

    it('a lista de pendentes reflete conclusões e a nova ocorrência', async () => {
      const todas = await request(server()).get('/v1/tarefas').set(auth()).expect(200);
      const pendentes = await request(server())
        .get('/v1/tarefas?pendentes=true')
        .set(auth())
        .expect(200);
      // pontual (pendente) + recorrente concluída + próxima ocorrência (pendente) = 3 total
      expect(todas.body).toHaveLength(3);
      // pontual + próxima ocorrência = 2 pendentes
      expect(pendentes.body).toHaveLength(2);
    });

    it('filtra por ciclo', async () => {
      const r = await request(server())
        .get(`/v1/tarefas?cicloId=${cicloId}`)
        .set(auth())
        .expect(200);
      expect(r.body).toHaveLength(3);
    });
  });

  describe('isolamento entre Contas', () => {
    it('não permite editar tarefa alheia (404)', async () => {
      const outro = { email: 'outro-tarefas@cosmaria.app', senha: 'senhaSegura123' };
      await request(server()).post('/v1/auth/register').send(outro);
      const t = (await request(server()).post('/v1/auth/login').send(outro)).body.accessToken;

      await request(server())
        .put(`/v1/tarefas/${tarefaPontual}`)
        .set({ Authorization: `Bearer ${t}` })
        .send({ titulo: 'invasão' })
        .expect(404);
    });
  });

  describe('ciclo encerrado', () => {
    it('não aceita nova tarefa depois de encerrar o ciclo (409)', async () => {
      await request(server()).post(`/v1/ciclos/${cicloId}/encerrar`).set(auth()).expect(201);
      await request(server())
        .post('/v1/tarefas')
        .set(auth())
        .send({ cicloId, titulo: 'tarde demais', tipo: 'REGA' })
        .expect(409);
    });
  });
});
