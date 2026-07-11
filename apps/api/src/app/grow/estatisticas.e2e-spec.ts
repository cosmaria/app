import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

/**
 * e2e de Estatísticas / Comparação (repositórios EM MEMÓRIA).
 * Monta dois ciclos completos (check-ins, sanidade, colheita→lote) e prova o relatório
 * agregado e a comparação com destaques.
 */
describe('Grow — estatísticas e comparação (e2e)', () => {
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
  const cred = { email: 'estatisticas@cosmaria.app', senha: 'senhaSegura123' };
  let token = '';
  let geneticaId = '';
  let ambienteId = '';
  const auth = () => ({ Authorization: `Bearer ${token}` });

  // Monta um ciclo completo e devolve o id. pesoSeco vira o rendimento do lote.
  async function montarCiclo(nome: string, pesoSeco: number): Promise<string> {
    const c = await request(server()).post('/v1/ciclos').set(auth()).send({ ambienteId, nome });
    const cicloId = c.body.cicloId;
    const p = await request(server())
      .post('/v1/plantas')
      .set(auth())
      .send({ cicloId, geneticaId, nome: 'P1', origem: 'SEMENTE' });
    await request(server())
      .post('/v1/registros-ambientais')
      .set(auth())
      .send({ cicloId, temperaturaC: 24, umidadeRelativa: 60 });
    await request(server())
      .post('/v1/eventos-sanidade')
      .set(auth())
      .send({ cicloId, tipo: 'PRAGA', severidade: 'MEDIA' });
    const col = await request(server())
      .post('/v1/colheitas')
      .set(auth())
      .send({ cicloId, plantaIds: [p.body.plantaId], pesoUmidoGramas: 400 });
    const sec = await request(server())
      .post('/v1/secagens')
      .set(auth())
      .send({ colheitaId: col.body.colheitaId });
    const cur = await request(server())
      .post('/v1/curas')
      .set(auth())
      .send({ secagemId: sec.body.secagemId });
    await request(server())
      .post('/v1/lotes')
      .set(auth())
      .send({ curaId: cur.body.curaId, codigo: nome, pesoSecoGramas: pesoSeco });
    return cicloId;
  }

  let cicloA = '';
  let cicloB = '';

  it('prepara dois ciclos completos', async () => {
    await request(server()).post('/v1/auth/register').send(cred);
    token = (await request(server()).post('/v1/auth/login').send(cred)).body.accessToken;
    geneticaId = (
      await request(server())
        .post('/v1/geneticas')
        .set(auth())
        .send({ nome: 'OG', tipo: 'FOTOPERIODICA' })
    ).body.geneticaId;
    ambienteId = (
      await request(server()).post('/v1/ambientes').set(auth()).send({ nome: 'E1', tipo: 'INDOOR' })
    ).body.ambienteId;

    cicloA = await montarCiclo('Ciclo A', 90);
    cicloB = await montarCiclo('Ciclo B', 150);
  });

  it('exige autenticação', async () => {
    await request(server()).get(`/v1/ciclos/${cicloA}/relatorio`).expect(401);
    await request(server()).get('/v1/estatisticas/comparar-ciclos?ids=x').expect(401);
  });

  describe('relatório do ciclo', () => {
    it('agrega plantas, ambiente, sanidade e rendimento', async () => {
      const r = await request(server())
        .get(`/v1/ciclos/${cicloA}/relatorio`)
        .set(auth())
        .expect(200);
      expect(r.body.totalPlantas).toBe(1);
      expect(r.body.ambiente.totalRegistros).toBe(1);
      expect(r.body.ambiente.temperaturaMedia).toBe(24);
      expect(r.body.sanidade.total).toBe(1);
      expect(r.body.sanidade.abertos).toBe(1);
      expect(r.body.colheita.pesoSecoTotalGramas).toBe(90);
      expect(r.body.colheita.gramasPorPlanta).toBe(90);
    });

    it('relatório de ciclo alheio responde 404', async () => {
      const outro = { email: 'outro-estat@cosmaria.app', senha: 'senhaSegura123' };
      await request(server()).post('/v1/auth/register').send(outro);
      const t = (await request(server()).post('/v1/auth/login').send(outro)).body.accessToken;
      await request(server())
        .get(`/v1/ciclos/${cicloA}/relatorio`)
        .set({ Authorization: `Bearer ${t}` })
        .expect(404);
    });
  });

  describe('comparação entre ciclos', () => {
    it('compara dois ciclos e aponta o de maior rendimento', async () => {
      const r = await request(server())
        .get(`/v1/estatisticas/comparar-ciclos?ids=${cicloA},${cicloB}`)
        .set(auth())
        .expect(200);
      expect(r.body.ciclos).toHaveLength(2);
      expect(r.body.destaques.maiorRendimentoTotalCicloId).toBe(cicloB);
      expect(r.body.destaques.maiorRendimentoPorPlantaCicloId).toBe(cicloB);
    });

    it('sem ids responde 400', async () => {
      await request(server()).get('/v1/estatisticas/comparar-ciclos').set(auth()).expect(400);
    });

    it('incluir um ciclo alheio derruba a comparação inteira (404)', async () => {
      await request(server())
        .get(`/v1/estatisticas/comparar-ciclos?ids=${cicloA},ciclo-fantasma`)
        .set(auth())
        .expect(404);
    });
  });
});
