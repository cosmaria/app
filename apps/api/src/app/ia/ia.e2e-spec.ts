import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

/**
 * e2e da IA (repositórios EM MEMÓRIA).
 * Prova o pipeline completo: eventos de Med → Adaptador de Ingestão → série temporal →
 * Motor de Correlação, incluindo o volume mínimo e a validação de fator.
 */
describe('IA — correlação (e2e)', () => {
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
  const cred = { email: 'ia@cosmaria.app', senha: 'senhaSegura123' };
  let token = '';
  let produtoId = '';
  const auth = () => ({ Authorization: `Bearer ${token}` });
  const dia = (d: number) => `2026-06-${String(d).padStart(2, '0')}T08:00:00.000Z`;

  it('exige autenticação', async () => {
    await request(server()).get('/v1/ia/correlacoes').expect(401);
  });

  it('prepara paciente com tratamento e produto', async () => {
    await request(server()).post('/v1/auth/register').send(cred);
    token = (await request(server()).post('/v1/auth/login').send(cred)).body.accessToken;
    const t = await request(server())
      .post('/v1/tratamentos')
      .set(auth())
      .send({ condicao: 'Dor crônica' });
    const p = await request(server())
      .post('/v1/produtos')
      .set(auth())
      .send({ tratamentoId: t.body.tratamentoId, nome: 'Óleo', tipo: 'OLEO' });
    produtoId = p.body.produtoId;
  });

  it('rejeita fator desconhecido (400)', async () => {
    await request(server())
      .get('/v1/ia/correlacoes?dominio=MED&fatorA=DOSE&fatorB=MAGIA')
      .set(auth())
      .expect(400);
  });

  it('registra 8 dias de dose e dor (dor cai quando a dose sobe)', async () => {
    for (let d = 1; d <= 8; d++) {
      await request(server())
        .post('/v1/registros-uso')
        .set(auth())
        .send({ produtoId, quantidade: d, unidade: 'GOTAS', via: 'SUBLINGUAL', usadoEm: dia(d) })
        .expect(201);
      await request(server())
        .post('/v1/sintomas-diarios')
        .set(auth())
        .send({ dor: 10 - d, registradoEm: dia(d) })
        .expect(201);
    }
  });

  it('calcula correlação negativa dose × dor a partir dos eventos ingeridos', async () => {
    const r = await request(server())
      .get('/v1/ia/correlacoes?dominio=MED&fatorA=DOSE&fatorB=DOR')
      .set(auth())
      .expect(200);
    expect(r.body.suficiente).toBe(true);
    expect(r.body.correlacao.direcao).toBe('NEGATIVA');
    expect(r.body.correlacao.forca).toBeLessThan(0);
    expect(r.body.correlacao.tamanhoAmostra).toBe(8);
    // Rastreabilidade: a conclusão carrega os ids brutos de origem (doc 05 §7.2).
    expect(r.body.correlacao.origemIds.length).toBeGreaterThan(0);
  });

  it('sinaliza volume insuficiente quando faltam dias pareados', async () => {
    const r = await request(server())
      .get('/v1/ia/correlacoes?dominio=MED&fatorA=DOSE&fatorB=SONO')
      .set(auth())
      .expect(200);
    expect(r.body.suficiente).toBe(false);
    expect(r.body.limitacao).toContain('necessários');
  });

  it('gera um insight relevante com a frase de explicabilidade obrigatória', async () => {
    const r = await request(server()).get('/v1/ia/insights?dominio=MED').set(auth()).expect(200);
    expect(r.body.length).toBeGreaterThanOrEqual(1);
    const insight = r.body.find(
      (i: { fatorA: string; fatorB: string }) => i.fatorA === 'DOSE' && i.fatorB === 'DOR',
    );
    expect(insight).toBeDefined();
    expect(insight.direcao).toBe('NEGATIVA');
    expect(insight.texto).toContain('aproximadamente');
    expect(insight.texto).toContain('confiança');
    expect(insight.origemIds.length).toBeGreaterThan(0);
  });

  it('não gera insight quando não há correlação relevante (usuário sem dados)', async () => {
    const vazio = { email: 'ia-vazio@cosmaria.app', senha: 'senhaSegura123' };
    await request(server()).post('/v1/auth/register').send(vazio);
    const t = (await request(server()).post('/v1/auth/login').send(vazio)).body.accessToken;
    const r = await request(server())
      .get('/v1/ia/insights?dominio=MED')
      .set({ Authorization: `Bearer ${t}` })
      .expect(200);
    expect(r.body).toEqual([]);
  });

  it('gera alerta de dor alta (neutro, remete ao médico) no último check-in', async () => {
    // O último dia (8) tem dor = 10-8 = 2, abaixo do limite. Registro um check-in com dor alta.
    await request(server())
      .post('/v1/sintomas-diarios')
      .set(auth())
      .send({ dor: 9, registradoEm: '2026-06-20T08:00:00.000Z' })
      .expect(201);
    const r = await request(server()).get('/v1/ia/alertas?dominio=MED').set(auth()).expect(200);
    const alerta = r.body.find((a: { fator: string }) => a.fator === 'DOR');
    expect(alerta).toBeDefined();
    expect(alerta.sugestaoDeAcao.toLowerCase()).toContain('médico');
  });

  it('deriva recomendações neutras dos insights (remete ao médico no Med)', async () => {
    const r = await request(server())
      .get('/v1/ia/recomendacoes?dominio=MED')
      .set(auth())
      .expect(200);
    expect(r.body.length).toBeGreaterThanOrEqual(1);
    expect(r.body[0].texto.toLowerCase()).toContain('médico');
  });

  it('o digest reúne insights, alertas, recomendações e disclaimer (sem cold-start com dados)', async () => {
    const r = await request(server()).get('/v1/ia/digest?dominio=MED').set(auth()).expect(200);
    expect(r.body.coldStart).toBe(false);
    expect(r.body.insights.length).toBeGreaterThanOrEqual(1);
    expect(r.body.recomendacoes.length).toBeGreaterThanOrEqual(1);
    expect(r.body.disclaimer).toBeTruthy();
  });

  it('o digest de um usuário novo sinaliza cold-start explicitamente', async () => {
    const novo = { email: 'ia-novo@cosmaria.app', senha: 'senhaSegura123' };
    await request(server()).post('/v1/auth/register').send(novo);
    const t = (await request(server()).post('/v1/auth/login').send(novo)).body.accessToken;
    const r = await request(server())
      .get('/v1/ia/digest?dominio=MED')
      .set({ Authorization: `Bearer ${t}` })
      .expect(200);
    expect(r.body.coldStart).toBe(true);
    expect(r.body.mensagemColdStart).toContain('poucos registros');
    expect(r.body.insights).toEqual([]);
  });

  it('isola por usuário: outro paciente não vê a série do primeiro', async () => {
    const outro = { email: 'ia-outro@cosmaria.app', senha: 'senhaSegura123' };
    await request(server()).post('/v1/auth/register').send(outro);
    const t2 = (await request(server()).post('/v1/auth/login').send(outro)).body.accessToken;
    const r = await request(server())
      .get('/v1/ia/correlacoes?dominio=MED&fatorA=DOSE&fatorB=DOR')
      .set({ Authorization: `Bearer ${t2}` })
      .expect(200);
    expect(r.body.suficiente).toBe(false);
  });
});
