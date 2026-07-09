import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

/**
 * e2e de Identidade Social (repositórios EM MEMÓRIA). Prova o fluxo HTTP completo:
 * criação implícita do perfil, edição, anonimato, isolamento entre contextos e o gate
 * de feature flag do vínculo de perfis (Versão 2, doc 06).
 */
describe('Perfil Público (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.AUTH_REPO = 'memory';
    process.env.ACCESS_TOKEN_SECRET = 'test-access';
    process.env.REFRESH_TOKEN_SECRET = 'test-refresh';
    // Estado do MVP: vínculo de perfis desligado (doc 06, decisão consolidada #1).
    delete process.env.FEATURE_VINCULO_DE_PERFIS;

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
  const cred = { email: 'perfil@cosmaria.app', senha: 'senhaSegura123' };
  let token = '';

  it('prepara usuário autenticado', async () => {
    await request(server()).post('/v1/auth/register').send(cred);
    const login = await request(server()).post('/v1/auth/login').send(cred);
    token = login.body.accessToken;
    expect(token).toBeTruthy();
  });

  it('exige autenticação', async () => {
    await request(server()).get('/v1/comunidade/perfis/grow').expect(401);
  });

  it('rejeita contexto desconhecido', async () => {
    const resposta = await request(server())
      .get('/v1/comunidade/perfis/recreativo')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
    expect(resposta.body.code).toBe('CONTEXTO_INVALIDO');
  });

  let perfilGrowId = '';
  let perfilMedId = '';

  it('cria o perfil implicitamente na primeira leitura, anônimo, sem expor a Conta', async () => {
    const resposta = await request(server())
      .get('/v1/comunidade/perfis/grow')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(resposta.body.anonimo).toBe(true);
    expect(resposta.body.nomeExibicao).toBeNull();
    expect(resposta.body.nomeSugerido).toMatch(/^perfil-/);
    expect(resposta.body).not.toHaveProperty('usuarioId');
    perfilGrowId = resposta.body.perfilId;
  });

  it('a segunda leitura devolve o MESMO perfil (idempotência)', async () => {
    const resposta = await request(server())
      .get('/v1/comunidade/perfis/GROW')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(resposta.body.perfilId).toBe(perfilGrowId);
  });

  it('o perfil do Med é uma identidade independente da mesma Conta', async () => {
    const resposta = await request(server())
      .get('/v1/comunidade/perfis/med')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    perfilMedId = resposta.body.perfilId;
    expect(perfilMedId).not.toBe(perfilGrowId);
    expect(resposta.body.anonimo).toBe(true);
  });

  it('edita o perfil do Grow sem afetar o do Med', async () => {
    await request(server())
      .put('/v1/comunidade/perfis/grow')
      .set('Authorization', `Bearer ${token}`)
      .send({ nomeExibicao: 'Cultivador Alpha', biografia: 'Indoor, LED' })
      .expect(200)
      .expect((r) => {
        expect(r.body.nomeExibicao).toBe('Cultivador Alpha');
        expect(r.body.anonimo).toBe(false);
      });

    await request(server())
      .get('/v1/comunidade/perfis/med')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((r) => {
        expect(r.body.anonimo).toBe(true);
        expect(r.body.nomeExibicao).toBeNull();
      });
  });

  it('volta ao anonimato limpando os campos com null', async () => {
    await request(server())
      .put('/v1/comunidade/perfis/grow')
      .set('Authorization', `Bearer ${token}`)
      .send({ nomeExibicao: null, biografia: null })
      .expect(200)
      .expect((r) => expect(r.body.anonimo).toBe(true));
  });

  it('rejeita campo desconhecido no corpo', async () => {
    await request(server())
      .put('/v1/comunidade/perfis/grow')
      .set('Authorization', `Bearer ${token}`)
      .send({ usuarioId: 'tentativa-de-injecao' })
      .expect(400);
  });

  describe('Vínculo de Perfis — Versão 2, desligado por flag (doc 06)', () => {
    it('POST responde 404 enquanto a feature não existe para o cliente', async () => {
      const resposta = await request(server())
        .post('/v1/comunidade/vinculo-perfis')
        .set('Authorization', `Bearer ${token}`)
        .send({ perfilIds: [perfilGrowId, perfilMedId], visivelEm: ['MED'] })
        .expect(404);
      expect(resposta.body.code).toBe('VINCULO_DE_PERFIS_DESABILITADO');
    });

    it('GET e DELETE também respondem 404', async () => {
      await request(server())
        .get('/v1/comunidade/vinculo-perfis')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
      await request(server())
        .delete('/v1/comunidade/vinculo-perfis/qualquer')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  /**
   * Prova que o modelo de dados já está pronto para a Versão 2 (doc 06): basta ligar a
   * flag, sem migration nem mudança de contrato. O adaptador lê o ambiente a cada
   * chamada, então a flag liga em runtime.
   */
  describe('Vínculo de Perfis — feature ligada (Versão 2)', () => {
    beforeAll(() => {
      process.env.FEATURE_VINCULO_DE_PERFIS = 'true';
    });
    afterAll(() => {
      delete process.env.FEATURE_VINCULO_DE_PERFIS;
    });

    let vinculoId = '';

    it('autoriza o vínculo com revelação parcial (visível só no Med)', async () => {
      const resposta = await request(server())
        .post('/v1/comunidade/vinculo-perfis')
        .set('Authorization', `Bearer ${token}`)
        .send({ perfilIds: [perfilGrowId, perfilMedId], visivelEm: ['MED'] })
        .expect(201);

      expect(resposta.body.vigente).toBe(true);
      expect(resposta.body.visivelEm).toEqual(['MED']);
      vinculoId = resposta.body.vinculoId;
    });

    it('recusa um segundo vínculo vigente para os mesmos perfis', async () => {
      await request(server())
        .post('/v1/comunidade/vinculo-perfis')
        .set('Authorization', `Bearer ${token}`)
        .send({ perfilIds: [perfilGrowId, perfilMedId], visivelEm: ['MED'] })
        .expect(400);
    });

    it('lista os vínculos do próprio dono', async () => {
      const resposta = await request(server())
        .get('/v1/comunidade/vinculo-perfis')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(resposta.body).toHaveLength(1);
      expect(resposta.body[0].vinculoId).toBe(vinculoId);
    });

    it('revoga o vínculo (204) e a revogação é idempotente', async () => {
      await request(server())
        .delete(`/v1/comunidade/vinculo-perfis/${vinculoId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
      await request(server())
        .delete(`/v1/comunidade/vinculo-perfis/${vinculoId}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      const resposta = await request(server())
        .get('/v1/comunidade/vinculo-perfis')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(resposta.body[0].vigente).toBe(false);
    });
  });
});
