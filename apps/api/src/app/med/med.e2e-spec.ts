import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

/**
 * e2e do núcleo do Med (repositórios EM MEMÓRIA).
 * Prova o fluxo clínico feliz (tratamento → produto → dose), as regras de estado
 * (encerrar, bloqueio de exclusão) e o isolamento entre usuários.
 */
describe('Med — núcleo (e2e)', () => {
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
  const cred = { email: 'paciente@cosmaria.app', senha: 'senhaSegura123' };
  let token = '';
  const auth = () => ({ Authorization: `Bearer ${token}` });

  it('exige autenticação', async () => {
    await request(server()).get('/v1/tratamentos').expect(401);
    await request(server()).post('/v1/tratamentos').expect(401);
    await request(server()).post('/v1/produtos').expect(401);
    await request(server()).post('/v1/registros-uso').expect(401);
  });

  it('registra e autentica o paciente', async () => {
    await request(server()).post('/v1/auth/register').send(cred);
    token = (await request(server()).post('/v1/auth/login').send(cred)).body.accessToken;
    expect(token).toBeTruthy();
  });

  let tratamentoId = '';
  let produtoId = '';

  describe('Tratamento', () => {
    it('cria um tratamento ativo', async () => {
      const r = await request(server())
        .post('/v1/tratamentos')
        .set(auth())
        .send({ condicao: 'Dor crônica', objetivo: 'Reduzir dor noturna' })
        .expect(201);
      expect(r.body.status).toBe('ATIVO');
      expect(r.body.encerradoEm).toBeNull();
      tratamentoId = r.body.tratamentoId;
    });

    it('rejeita condição vazia', async () => {
      await request(server())
        .post('/v1/tratamentos')
        .set(auth())
        .send({ condicao: '' })
        .expect(400);
    });

    it('lista e obtém o tratamento', async () => {
      const lista = await request(server()).get('/v1/tratamentos').set(auth()).expect(200);
      expect(lista.body).toHaveLength(1);
      await request(server()).get(`/v1/tratamentos/${tratamentoId}`).set(auth()).expect(200);
    });

    it('atualização parcial preserva campos ausentes', async () => {
      const r = await request(server())
        .put(`/v1/tratamentos/${tratamentoId}`)
        .set(auth())
        .send({ medicoResponsavel: 'Dra. Silva' })
        .expect(200);
      expect(r.body.medicoResponsavel).toBe('Dra. Silva');
      expect(r.body.condicao).toBe('Dor crônica');
    });
  });

  describe('Produto e dose', () => {
    it('cria um produto no tratamento', async () => {
      const r = await request(server())
        .post('/v1/produtos')
        .set(auth())
        .send({ tratamentoId, nome: 'Óleo CBD', tipo: 'OLEO', concentracaoCbd: '50mg/ml' })
        .expect(201);
      expect(r.body.loteId).toBeNull(); // vínculo com o Grow é V2, inerte
      produtoId = r.body.produtoId;
    });

    it('rejeita tipo de produto desconhecido', async () => {
      await request(server())
        .post('/v1/produtos')
        .set(auth())
        .send({ tratamentoId, nome: 'x', tipo: 'POCAO' })
        .expect(400);
    });

    it('registra uma dose e a lista pelo produto e pelo tratamento', async () => {
      const r = await request(server())
        .post('/v1/registros-uso')
        .set(auth())
        .send({ produtoId, quantidade: 3, unidade: 'GOTAS', via: 'SUBLINGUAL' })
        .expect(201);
      expect(r.body.quantidade).toBe(3);

      const porProduto = await request(server())
        .get(`/v1/produtos/${produtoId}/registros-uso`)
        .set(auth())
        .expect(200);
      expect(porProduto.body).toHaveLength(1);

      const porTratamento = await request(server())
        .get(`/v1/tratamentos/${tratamentoId}/registros-uso`)
        .set(auth())
        .expect(200);
      expect(porTratamento.body).toHaveLength(1);
    });

    it('bloqueia exclusão de produto com doses (409)', async () => {
      await request(server()).delete(`/v1/produtos/${produtoId}`).set(auth()).expect(409);
    });
  });

  describe('Sessão antes/depois', () => {
    let doseId = '';
    let sessaoId = '';

    it('registra uma dose para ancorar a sessão', async () => {
      const r = await request(server())
        .post('/v1/registros-uso')
        .set(auth())
        .send({ produtoId, quantidade: 1, unidade: 'ML', via: 'ORAL' })
        .expect(201);
      doseId = r.body.registroDeUsoId;
    });

    it('abre a sessão com a medição "antes"', async () => {
      const r = await request(server())
        .post('/v1/sessoes')
        .set(auth())
        .send({
          registroDeUsoId: doseId,
          sintomaAlvo: 'Dor',
          intensidadeAntes: 8,
          intervaloMinutos: 60,
        })
        .expect(201);
      expect(r.body.intensidadeDepois).toBeNull();
      expect(r.body.variacao).toBeNull();
      sessaoId = r.body.sessaoId;
    });

    it('recusa uma segunda sessão para a mesma dose (409)', async () => {
      await request(server())
        .post('/v1/sessoes')
        .set(auth())
        .send({
          registroDeUsoId: doseId,
          sintomaAlvo: 'Dor',
          intensidadeAntes: 7,
          intervaloMinutos: 30,
        })
        .expect(409);
    });

    it('rejeita intensidade fora da escala 0–10', async () => {
      const r = await request(server())
        .post('/v1/registros-uso')
        .set(auth())
        .send({ produtoId, quantidade: 1, unidade: 'ML', via: 'ORAL' });
      await request(server())
        .post('/v1/sessoes')
        .set(auth())
        .send({
          registroDeUsoId: r.body.registroDeUsoId,
          sintomaAlvo: 'Dor',
          intensidadeAntes: 15,
          intervaloMinutos: 60,
        })
        .expect(400);
    });

    it('registra o "depois" e calcula a variação', async () => {
      const r = await request(server())
        .put(`/v1/sessoes/${sessaoId}`)
        .set(auth())
        .send({ intensidadeDepois: 3 })
        .expect(200);
      expect(r.body.intensidadeDepois).toBe(3);
      expect(r.body.variacao).toBe(5);
    });

    it('recusa registrar o "depois" duas vezes (409)', async () => {
      await request(server())
        .put(`/v1/sessoes/${sessaoId}`)
        .set(auth())
        .send({ intensidadeDepois: 2 })
        .expect(409);
    });
  });

  describe('Sintomas diários e efeitos', () => {
    it('registra um check-in de linha de base', async () => {
      const r = await request(server())
        .post('/v1/sintomas-diarios')
        .set(auth())
        .send({ humor: 6, dor: 4, sono: 7 })
        .expect(201);
      expect(r.body.humor).toBe(6);
      expect(r.body.ansiedade).toBeNull();
    });

    it('recusa um check-in sem nenhuma dimensão (400)', async () => {
      await request(server())
        .post('/v1/sintomas-diarios')
        .set(auth())
        .send({ observacoes: 'só uma nota' })
        .expect(400);
    });

    it('lista os check-ins do usuário', async () => {
      const r = await request(server()).get('/v1/sintomas-diarios').set(auth()).expect(200);
      expect(r.body.length).toBeGreaterThanOrEqual(1);
    });

    it('registra e lista efeitos de uma dose', async () => {
      const dose = await request(server())
        .post('/v1/registros-uso')
        .set(auth())
        .send({ produtoId, quantidade: 1, unidade: 'ML', via: 'ORAL' })
        .expect(201);
      const doseId = dose.body.registroDeUsoId;

      await request(server())
        .post('/v1/efeitos')
        .set(auth())
        .send({ registroDeUsoId: doseId, tipo: 'ADVERSO', descricao: 'Boca seca', intensidade: 3 })
        .expect(201);
      await request(server())
        .post('/v1/efeitos')
        .set(auth())
        .send({ registroDeUsoId: doseId, tipo: 'POSITIVO', descricao: 'Alívio da dor' })
        .expect(201);

      const lista = await request(server())
        .get(`/v1/registros-uso/${doseId}/efeitos`)
        .set(auth())
        .expect(200);
      expect(lista.body).toHaveLength(2);
    });

    it('recusa efeito em dose de outro usuário (404)', async () => {
      await request(server())
        .post('/v1/efeitos')
        .set(auth())
        .send({ registroDeUsoId: 'inexistente', tipo: 'POSITIVO', descricao: 'x' })
        .expect(404);
    });
  });

  describe('Regras de estado', () => {
    it('bloqueia exclusão de tratamento com produtos (409)', async () => {
      await request(server()).delete(`/v1/tratamentos/${tratamentoId}`).set(auth()).expect(409);
    });

    it('encerra o tratamento e recusa novo produto (409)', async () => {
      await request(server())
        .post(`/v1/tratamentos/${tratamentoId}/encerrar`)
        .set(auth())
        .expect(201);
      await request(server())
        .post('/v1/produtos')
        .set(auth())
        .send({ tratamentoId, nome: 'Outro', tipo: 'FLOR' })
        .expect(409);
    });

    it('encerrar é idempotente', async () => {
      await request(server())
        .post(`/v1/tratamentos/${tratamentoId}/encerrar`)
        .set(auth())
        .expect(201);
    });
  });

  describe('Evolução clínica e relatório', () => {
    it('a evolução consolida uso, sessões, sintomas e efeitos do tratamento', async () => {
      const r = await request(server())
        .get(`/v1/tratamentos/${tratamentoId}/evolucao`)
        .set(auth())
        .expect(200);
      expect(r.body.tratamentoId).toBe(tratamentoId);
      expect(r.body.uso.totalDeDoses).toBeGreaterThanOrEqual(1);
      expect(r.body.sessoes.finalizadas).toBeGreaterThanOrEqual(1);
      expect(r.body.efeitos.total).toBeGreaterThanOrEqual(2);
    });

    it('o relatório traz o disclaimer legal e o carimbo de geração', async () => {
      const r = await request(server())
        .get(`/v1/tratamentos/${tratamentoId}/relatorio`)
        .set(auth())
        .expect(200);
      expect(r.body.disclaimer).toContain('não substitui a avaliação');
      expect(r.body.geradoEm).toBeTruthy();
    });

    it('outro usuário não gera relatório de tratamento alheio (404)', async () => {
      const estranho = { email: 'estranho@cosmaria.app', senha: 'senhaSegura123' };
      await request(server()).post('/v1/auth/register').send(estranho);
      const t = (await request(server()).post('/v1/auth/login').send(estranho)).body.accessToken;
      await request(server())
        .get(`/v1/tratamentos/${tratamentoId}/relatorio`)
        .set({ Authorization: `Bearer ${t}` })
        .expect(404);
    });
  });

  describe('Isolamento entre usuários', () => {
    it('outro usuário não enxerga o tratamento (404)', async () => {
      const outro = { email: 'outro@cosmaria.app', senha: 'senhaSegura123' };
      await request(server()).post('/v1/auth/register').send(outro);
      const t2 = (await request(server()).post('/v1/auth/login').send(outro)).body.accessToken;
      await request(server())
        .get(`/v1/tratamentos/${tratamentoId}`)
        .set({ Authorization: `Bearer ${t2}` })
        .expect(404);
    });
  });
});
