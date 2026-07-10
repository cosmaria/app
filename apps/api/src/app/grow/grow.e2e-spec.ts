import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { assinarPayloadWebhook } from '@cosmaria/core-infrastructure';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

const SEGREDO = 'segredo-de-teste';

/**
 * e2e do núcleo do Grow (repositórios EM MEMÓRIA).
 *
 * Além do CRUD, prova as duas fronteiras que só aparecem ponta a ponta: o Grow consulta
 * o gate de Premium do Core para criar ambientes, e o ciclo encerrado deixa de aceitar
 * escrita.
 */
describe('Grow — núcleo (e2e)', () => {
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
  const cred = { email: 'grow@cosmaria.app', senha: 'senhaSegura123' };
  let token = '';
  let usuarioId = '';
  let geneticaId = '';
  let ambienteId = '';
  let cicloId = '';
  let plantaId = '';

  const auth = () => ({ Authorization: `Bearer ${token}` });

  it('prepara usuário autenticado', async () => {
    const reg = await request(server()).post('/v1/auth/register').send(cred);
    usuarioId = reg.body.usuarioId;
    const login = await request(server()).post('/v1/auth/login').send(cred);
    token = login.body.accessToken;
    expect(token).toBeTruthy();
  });

  it('exige autenticação em toda a superfície do Grow', async () => {
    await request(server()).get('/v1/geneticas').expect(401);
    await request(server()).get('/v1/ambientes').expect(401);
    await request(server()).get('/v1/ciclos').expect(401);
  });

  describe('Genética', () => {
    it('cria e lista', async () => {
      const resposta = await request(server())
        .post('/v1/geneticas')
        .set(auth())
        .send({ nome: 'OG Kush', tipo: 'FOTOPERIODICA', breeder: 'DNA Genetics' })
        .expect(201);

      expect(resposta.body.nome).toBe('OG Kush');
      expect(resposta.body).not.toHaveProperty('usuarioId');
      geneticaId = resposta.body.geneticaId;

      const lista = await request(server()).get('/v1/geneticas').set(auth()).expect(200);
      expect(lista.body).toHaveLength(1);
    });

    it('rejeita tipo desconhecido', async () => {
      await request(server())
        .post('/v1/geneticas')
        .set(auth())
        .send({ nome: 'X', tipo: 'HIBRIDA_MAGICA' })
        .expect(400);
    });
  });

  describe('Ambiente e o gate de Premium (doc 07 §9)', () => {
    it('cria o primeiro ambiente', async () => {
      const resposta = await request(server())
        .post('/v1/ambientes')
        .set(auth())
        .send({ nome: 'Estufa 1', tipo: 'INDOOR', larguraCm: 100, alturaCm: 200 })
        .expect(201);

      expect(resposta.body.aceitaDadosClimaticos).toBe(false);
      ambienteId = resposta.body.ambienteId;
    });

    it('o outdoor aceita enriquecimento do Módulo Outdoor', async () => {
      const resposta = await request(server())
        .post('/v1/ambientes')
        .set(auth())
        .send({ nome: 'Quintal', tipo: 'OUTDOOR' })
        .expect(201);
      expect(resposta.body.aceitaDadosClimaticos).toBe(true);
    });

    it('o TERCEIRO ambiente é barrado pelo limite do plano gratuito (402)', async () => {
      const resposta = await request(server())
        .post('/v1/ambientes')
        .set(auth())
        .send({ nome: 'Estufa 2', tipo: 'ESTUFA' })
        .expect(402);

      expect(resposta.body.code).toBe('LIMITE_DE_PLANO_ATINGIDO');
    });

    it('o limite barrado gerou notificação de paywall na Central (EDA)', async () => {
      const central = await request(server()).get('/v1/notificacoes').set(auth()).expect(200);
      expect(central.body.itens[0].titulo).toContain('limite do plano gratuito');
      expect(central.body.itens[0].categoria).toBe('BILLING');
    });

    it('após virar Premium pelo webhook, o mesmo ambiente é aceito', async () => {
      const corpo = JSON.stringify({
        id: 'evt-grow-1',
        tipo: 'PAGAMENTO_RECEBIDO',
        usuarioId,
        vigenteAte: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      });
      await request(server())
        .post('/v1/webhooks/pagamento')
        .set('Content-Type', 'application/json')
        .set('x-cosmaria-assinatura', assinarPayloadWebhook(Buffer.from(corpo), SEGREDO))
        .send(corpo)
        .expect(200);

      await request(server())
        .post('/v1/ambientes')
        .set(auth())
        .send({ nome: 'Estufa 2', tipo: 'ESTUFA' })
        .expect(201);
    });
  });

  describe('Ciclo de cultivo', () => {
    it('inicia com a fase inicial já no histórico datado', async () => {
      const resposta = await request(server())
        .post('/v1/ciclos')
        .set(auth())
        .send({ ambienteId, nome: 'Ciclo de inverno' })
        .expect(201);

      expect(resposta.body.faseAtual).toBe('GERMINACAO');
      expect(resposta.body.ativo).toBe(true);
      expect(resposta.body.transicoes).toHaveLength(1);
      cicloId = resposta.body.cicloId;
    });

    it('recusa iniciar ciclo em ambiente inexistente', async () => {
      const resposta = await request(server())
        .post('/v1/ciclos')
        .set(auth())
        .send({ ambienteId: 'nao-existe', nome: 'x' })
        .expect(404);
      expect(resposta.body.code).toBe('AMBIENTE_NAO_ENCONTRADO');
    });

    it('avança de fase e acumula duração', async () => {
      await request(server())
        .post(`/v1/ciclos/${cicloId}/fase`)
        .set(auth())
        .send({ fase: 'VEGETATIVO' })
        .expect(201);

      const ciclo = await request(server()).get(`/v1/ciclos/${cicloId}`).set(auth()).expect(200);
      expect(ciclo.body.faseAtual).toBe('VEGETATIVO');
      expect(ciclo.body.transicoes).toHaveLength(2);
      expect(ciclo.body.duracaoDasFasesEmDias).toHaveLength(1);
    });

    it('recusa retroceder de fase (400)', async () => {
      const resposta = await request(server())
        .post(`/v1/ciclos/${cicloId}/fase`)
        .set(auth())
        .send({ fase: 'GERMINACAO' })
        .expect(400);
      expect(resposta.body.code).toBe('TRANSICAO_DE_FASE_INVALIDA');
    });

    it('recusa excluir ambiente que já hospedou ciclos (409)', async () => {
      const resposta = await request(server())
        .delete(`/v1/ambientes/${ambienteId}`)
        .set(auth())
        .expect(409);
      expect(resposta.body.code).toBe('AMBIENTE_COM_CICLOS');
    });
  });

  describe('Planta', () => {
    it('adiciona planta vinculando ciclo e genética', async () => {
      const resposta = await request(server())
        .post('/v1/plantas')
        .set(auth())
        .send({ cicloId, geneticaId, nome: 'Planta 1', origem: 'SEMENTE' })
        .expect(201);

      expect(resposta.body.faseAtual).toBe('GERMINACAO');
      plantaId = resposta.body.plantaId;
    });

    it('recusa excluir genética que já originou plantas (409)', async () => {
      const resposta = await request(server())
        .delete(`/v1/geneticas/${geneticaId}`)
        .set(auth())
        .expect(409);
      expect(resposta.body.code).toBe('GENETICA_EM_USO');
    });

    it('a planta tem fase própria, independente da do ciclo', async () => {
      await request(server())
        .post('/v1/plantas')
        .set(auth())
        .send({ cicloId, geneticaId, nome: 'Planta 2', origem: 'CLONE', plantaMaeId: plantaId })
        .expect(201);

      await request(server())
        .post(`/v1/plantas/${plantaId}/fase`)
        .set(auth())
        .send({ fase: 'FLORACAO' })
        .expect(201);

      const plantas = await request(server())
        .get(`/v1/ciclos/${cicloId}/plantas`)
        .set(auth())
        .expect(200);

      const fases = plantas.body.map((p: { faseAtual: string }) => p.faseAtual);
      expect(fases).toContain('FLORACAO');
      expect(fases).toContain('GERMINACAO');
      // O ciclo continua no vegetativo: as fases são independentes.
      const ciclo = await request(server()).get(`/v1/ciclos/${cicloId}`).set(auth()).expect(200);
      expect(ciclo.body.faseAtual).toBe('VEGETATIVO');
    });
  });

  describe('Encerramento — o histórico vira imutável', () => {
    it('encerra o ciclo', async () => {
      const resposta = await request(server())
        .post(`/v1/ciclos/${cicloId}/encerrar`)
        .set(auth())
        .expect(201);
      expect(resposta.body.ativo).toBe(false);
      expect(resposta.body.encerradoEm).not.toBeNull();
    });

    it('nenhuma escrita é aceita depois (409)', async () => {
      await request(server())
        .post(`/v1/ciclos/${cicloId}/fase`)
        .set(auth())
        .send({ fase: 'FLORACAO' })
        .expect(409);

      await request(server())
        .put(`/v1/ciclos/${cicloId}`)
        .set(auth())
        .send({ nome: 'outro nome' })
        .expect(409);

      await request(server())
        .post('/v1/plantas')
        .set(auth())
        .send({ cicloId, geneticaId, nome: 'Tardia', origem: 'SEMENTE' })
        .expect(409);
    });

    it('mas a leitura do histórico continua disponível', async () => {
      const ciclo = await request(server()).get(`/v1/ciclos/${cicloId}`).set(auth()).expect(200);
      expect(ciclo.body.transicoes).toHaveLength(2);

      const ativos = await request(server()).get('/v1/ciclos?ativos=true').set(auth()).expect(200);
      expect(ativos.body).toHaveLength(0);
    });
  });

  describe('Isolamento entre Contas', () => {
    it('recurso de outro usuário responde 404, sem confirmar existência', async () => {
      const outro = { email: 'outro-grow@cosmaria.app', senha: 'senhaSegura123' };
      await request(server()).post('/v1/auth/register').send(outro);
      const login = await request(server()).post('/v1/auth/login').send(outro);
      const alheio = { Authorization: `Bearer ${login.body.accessToken}` };

      await request(server()).get(`/v1/ciclos/${cicloId}`).set(alheio).expect(404);
      await request(server()).get(`/v1/ciclos/${cicloId}/plantas`).set(alheio).expect(404);
      await request(server())
        .put(`/v1/geneticas/${geneticaId}`)
        .set(alheio)
        .send({ nome: 'roubada' })
        .expect(404);
      await request(server())
        .get('/v1/geneticas')
        .set(alheio)
        .expect(200)
        .expect((r) => {
          expect(r.body).toHaveLength(0);
        });
    });
  });
});
