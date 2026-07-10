import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

/**
 * e2e do fluxo pós-colheita (repositórios EM MEMÓRIA).
 * Prova a colheita escalonada, o encadeamento 1—1 Secagem→Cura→Lote e o rendimento
 * por planta derivado.
 */
describe('Grow — pós-colheita (e2e)', () => {
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
  const cred = { email: 'colheita@cosmaria.app', senha: 'senhaSegura123' };
  let token = '';
  let cicloId = '';
  let plantaA = '';
  let plantaB = '';

  const auth = () => ({ Authorization: `Bearer ${token}` });

  it('prepara ciclo ativo com duas plantas', async () => {
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
    const p1 = await request(server())
      .post('/v1/plantas')
      .set(auth())
      .send({ cicloId, geneticaId: g.body.geneticaId, nome: 'P1', origem: 'SEMENTE' });
    const p2 = await request(server())
      .post('/v1/plantas')
      .set(auth())
      .send({ cicloId, geneticaId: g.body.geneticaId, nome: 'P2', origem: 'SEMENTE' });
    plantaA = p1.body.plantaId;
    plantaB = p2.body.plantaId;
  });

  it('exige autenticação', async () => {
    await request(server()).post('/v1/colheitas').expect(401);
    await request(server()).post('/v1/lotes').expect(401);
  });

  let colheitaId = '';
  let secagemId = '';
  let curaId = '';

  describe('Colheita', () => {
    it('recusa colheita sem nenhuma planta (400)', async () => {
      await request(server())
        .post('/v1/colheitas')
        .set(auth())
        .send({ cicloId, plantaIds: [] })
        .expect(400);
    });

    it('recusa planta que não é do ciclo (404)', async () => {
      await request(server())
        .post('/v1/colheitas')
        .set(auth())
        .send({ cicloId, plantaIds: ['planta-fantasma'] })
        .expect(404);
    });

    it('registra colheita escalonada de um subconjunto de plantas', async () => {
      const r = await request(server())
        .post('/v1/colheitas')
        .set(auth())
        .send({ cicloId, plantaIds: [plantaA], pesoUmidoGramas: 500 })
        .expect(201);
      expect(r.body.quantidadeDePlantas).toBe(1);
      expect(r.body.pesoUmidoGramas).toBe(500);
      colheitaId = r.body.colheitaId;
    });

    it('lista as colheitas do ciclo', async () => {
      const r = await request(server())
        .get(`/v1/ciclos/${cicloId}/colheitas`)
        .set(auth())
        .expect(200);
      expect(r.body).toHaveLength(1);
    });
  });

  describe('Secagem → Cura → Lote', () => {
    it('registra a secagem 1—1 da colheita', async () => {
      const r = await request(server())
        .post('/v1/secagens')
        .set(auth())
        .send({ colheitaId, temperaturaC: 20, umidadeRelativa: 60 })
        .expect(201);
      expect(r.body.finalizada).toBe(false);
      secagemId = r.body.secagemId;
    });

    it('recusa uma segunda secagem para a mesma colheita (409)', async () => {
      await request(server()).post('/v1/secagens').set(auth()).send({ colheitaId }).expect(409);
    });

    it('finaliza a secagem (monotônico)', async () => {
      const r = await request(server())
        .post(`/v1/secagens/${secagemId}/finalizar`)
        .set(auth())
        .expect(201);
      expect(r.body.finalizada).toBe(true);
    });

    it('registra a cura 1—1 da secagem, com burping', async () => {
      const r = await request(server())
        .post('/v1/curas')
        .set(auth())
        .send({ secagemId, burping: 'aberto 2x/dia na 1a semana' })
        .expect(201);
      expect(r.body.burping).toBe('aberto 2x/dia na 1a semana');
      curaId = r.body.curaId;
    });

    it('gera o lote 1—1 da cura e calcula o rendimento por planta', async () => {
      const r = await request(server())
        .post('/v1/lotes')
        .set(auth())
        .send({ curaId, codigo: 'OG-2026-01', pesoSecoGramas: 90 })
        .expect(201);
      // 90g / 1 planta colhida
      expect(r.body.pesoSecoGramas).toBe(90);
      expect(r.body.quantidadeDePlantas).toBe(1);
      expect(r.body.gramasPorPlanta).toBe(90);
    });

    it('recusa gerar um segundo lote para a mesma cura (409)', async () => {
      await request(server())
        .post('/v1/lotes')
        .set(auth())
        .send({ curaId, codigo: 'OG-2026-02', pesoSecoGramas: 10 })
        .expect(409);
    });
  });

  describe('colheita escalonada e isolamento', () => {
    it('a segunda planta pode virar uma colheita própria, em outra data', async () => {
      await request(server())
        .post('/v1/colheitas')
        .set(auth())
        .send({ cicloId, plantaIds: [plantaB] })
        .expect(201);

      const r = await request(server())
        .get(`/v1/ciclos/${cicloId}/colheitas`)
        .set(auth())
        .expect(200);
      expect(r.body).toHaveLength(2);
    });

    it('colheita de ciclo alheio responde 404', async () => {
      const outro = { email: 'outro-colheita@cosmaria.app', senha: 'senhaSegura123' };
      await request(server()).post('/v1/auth/register').send(outro);
      const t = (await request(server()).post('/v1/auth/login').send(outro)).body.accessToken;

      await request(server())
        .get(`/v1/colheitas/${colheitaId}`)
        .set({ Authorization: `Bearer ${t}` })
        .expect(404);
    });
  });

  describe('pós-colheita após o encerramento do ciclo', () => {
    it('a secagem/cura/lote continuam permitidos depois de encerrar o ciclo', async () => {
      // Nova colheita enquanto o ciclo ainda está ativo...
      const col = await request(server())
        .post('/v1/colheitas')
        .set(auth())
        .send({ cicloId, plantaIds: [plantaA, plantaB] })
        .expect(201);

      await request(server()).post(`/v1/ciclos/${cicloId}/encerrar`).set(auth()).expect(201);

      // ...e a secagem é registrada já com o ciclo encerrado.
      await request(server())
        .post('/v1/secagens')
        .set(auth())
        .send({ colheitaId: col.body.colheitaId })
        .expect(201);
    });

    it('mas colher em ciclo encerrado é recusado (409)', async () => {
      await request(server())
        .post('/v1/colheitas')
        .set(auth())
        .send({ cicloId, plantaIds: [plantaA] })
        .expect(409);
    });
  });
});
