import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { assinarPayloadWebhook } from '@cosmaria/core-infrastructure';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

const SEGREDO = 'segredo-comunidade-e2e';

interface PublicacaoResp {
  publicacaoId: string;
  perfilPublicoId: string;
  conteudoId: string;
  contexto: string;
  titulo: string | null;
  dimensoes: Record<string, string>;
  curtidas: number;
  comentarios: number;
}

/**
 * e2e da Comunidade (repositórios EM MEMÓRIA).
 *
 * Prova o fluxo ponta a ponta que só existe integrado: o Grow publica um Growlog (resolve
 * Perfil Público + Motor de Privacidade e emite o evento), a Comunidade projeta esse evento
 * e o feed o devolve — escopado por contexto e por escopo de privacidade.
 */
describe('Comunidade — publicação e feed (e2e)', () => {
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

  let tokenA = '';
  let tokenB = '';
  let usuarioIdA = '';
  const authA = () => ({ Authorization: `Bearer ${tokenA}` });
  const authB = () => ({ Authorization: `Bearer ${tokenB}` });

  let cicloPublico = '';
  let cicloPrivado = '';
  let publicacaoPrivadaId = '';
  let ambienteId = '';

  // Um único ambiente reaproveitado: o free tier limita a 2 ambientes simultâneos, e
  // vários ciclos podem viver no mesmo ambiente (o que varia entre os testes é o ciclo).
  const novoCiclo = async (nome: string): Promise<string> => {
    if (!ambienteId) {
      const ambiente = await request(server())
        .post('/v1/ambientes')
        .set(authA())
        .send({ nome: 'Ambiente da Conta A', tipo: 'INDOOR' });
      ambienteId = ambiente.body.ambienteId;
    }
    const ciclo = await request(server())
      .post('/v1/ciclos')
      .set(authA())
      .send({ ambienteId, nome });
    return ciclo.body.cicloId;
  };

  it('prepara dois usuários autenticados', async () => {
    const regA = await request(server())
      .post('/v1/auth/register')
      .send({ email: 'com-a@cosmaria.app', senha: 'senhaSegura123' });
    usuarioIdA = regA.body.usuarioId;
    const loginA = await request(server())
      .post('/v1/auth/login')
      .send({ email: 'com-a@cosmaria.app', senha: 'senhaSegura123' });
    tokenA = loginA.body.accessToken;

    await request(server())
      .post('/v1/auth/register')
      .send({ email: 'com-b@cosmaria.app', senha: 'senhaSegura123' });
    const loginB = await request(server())
      .post('/v1/auth/login')
      .send({ email: 'com-b@cosmaria.app', senha: 'senhaSegura123' });
    tokenB = loginB.body.accessToken;
    expect(tokenA && tokenB).toBeTruthy();
  });

  it('exige autenticação no feed', async () => {
    await request(server()).get('/v1/comunidade/feed?contexto=grow').expect(401);
  });

  it('recusa contexto inválido com 400', async () => {
    await request(server()).get('/v1/comunidade/feed?contexto=xpto').set(authA()).expect(400);
  });

  it('publica um Growlog e o feed do Grow o devolve', async () => {
    cicloPublico = await novoCiclo('Cultivo público');
    await request(server())
      .post(`/v1/ciclos/${cicloPublico}/publicar`)
      .set(authA())
      .send({
        escopo: 'PUBLICO',
        titulo: 'White Widow indoor',
        dimensoes: { genetica: 'White Widow' },
      })
      .expect(201);

    const feed = await request(server())
      .get('/v1/comunidade/feed?contexto=grow')
      .set(authA())
      .expect(200);
    const pubs = feed.body as PublicacaoResp[];
    const minha = pubs.find((p) => p.conteudoId === cicloPublico);
    expect(minha).toBeDefined();
    expect(minha?.titulo).toBe('White Widow indoor');
    expect(minha?.dimensoes).toEqual({ genetica: 'White Widow' });
  });

  it('isola por contexto: o feed do Med não vê publicação do Grow', async () => {
    const feedMed = await request(server())
      .get('/v1/comunidade/feed?contexto=med')
      .set(authA())
      .expect(200);
    expect((feedMed.body as PublicacaoResp[]).length).toBe(0);
  });

  it('outra Conta vê a publicação PUBLICO no feed do Grow', async () => {
    const feed = await request(server())
      .get('/v1/comunidade/feed?contexto=grow')
      .set(authB())
      .expect(200);
    const pubs = feed.body as PublicacaoResp[];
    expect(pubs.some((p) => p.conteudoId === cicloPublico)).toBe(true);
  });

  it('publicação PRIVADO só aparece para o autor', async () => {
    cicloPrivado = await novoCiclo('Cultivo privado');
    await request(server())
      .post(`/v1/ciclos/${cicloPrivado}/publicar`)
      .set(authA())
      .send({ escopo: 'PRIVADO' })
      .expect(201);

    const feedAutor = await request(server())
      .get('/v1/comunidade/feed?contexto=grow')
      .set(authA())
      .expect(200);
    const minha = (feedAutor.body as PublicacaoResp[]).find((p) => p.conteudoId === cicloPrivado);
    expect(minha).toBeDefined();
    publicacaoPrivadaId = minha!.publicacaoId;

    const feedOutro = await request(server())
      .get('/v1/comunidade/feed?contexto=grow')
      .set(authB())
      .expect(200);
    expect((feedOutro.body as PublicacaoResp[]).some((p) => p.conteudoId === cicloPrivado)).toBe(
      false,
    );
  });

  it('detalhe de publicação PRIVADO responde 404 para quem não é o autor', async () => {
    await request(server())
      .get(`/v1/comunidade/publicacoes/${publicacaoPrivadaId}`)
      .set(authB())
      .expect(404);
    await request(server())
      .get(`/v1/comunidade/publicacoes/${publicacaoPrivadaId}`)
      .set(authA())
      .expect(200);
  });

  it('busca estruturada encontra por parâmetro técnico compartilhado', async () => {
    const ciclo = await novoCiclo('Cultivo buscável');
    await request(server())
      .post(`/v1/ciclos/${ciclo}/publicar`)
      .set(authA())
      .send({ escopo: 'PUBLICO', dimensoes: { fertilizante: 'BioBizz', genetica: 'Amnesia' } })
      .expect(201);

    const achou = await request(server())
      .get('/v1/comunidade/busca?contexto=grow&chave=fertilizante&valor=biobizz')
      .set(authB())
      .expect(200);
    expect((achou.body as PublicacaoResp[]).some((p) => p.conteudoId === ciclo)).toBe(true);

    const vazio = await request(server())
      .get('/v1/comunidade/busca?contexto=grow&chave=fertilizante&valor=Inexistente')
      .set(authB())
      .expect(200);
    expect((vazio.body as PublicacaoResp[]).some((p) => p.conteudoId === ciclo)).toBe(false);
  });

  it('busca sem valor devolve lista vazia (não casa tudo)', async () => {
    const resp = await request(server())
      .get('/v1/comunidade/busca?contexto=grow&chave=fertilizante')
      .set(authA())
      .expect(200);
    expect(resp.body).toEqual([]);
  });

  it('republicar o mesmo ciclo atualiza a publicação, não duplica', async () => {
    await request(server())
      .post(`/v1/ciclos/${cicloPublico}/publicar`)
      .set(authA())
      .send({ escopo: 'PUBLICO', titulo: 'White Widow (atualizado)' })
      .expect(201);

    const feed = await request(server())
      .get('/v1/comunidade/feed?contexto=grow')
      .set(authA())
      .expect(200);
    const doCiclo = (feed.body as PublicacaoResp[]).filter((p) => p.conteudoId === cicloPublico);
    expect(doCiclo.length).toBe(1);
    expect(doCiclo[0].titulo).toBe('White Widow (atualizado)');
  });

  const feedGrow = async (headers: Record<string, string>): Promise<PublicacaoResp[]> => {
    const r = await request(server())
      .get('/v1/comunidade/feed?contexto=grow')
      .set(headers)
      .expect(200);
    return r.body as PublicacaoResp[];
  };
  const pubDoCiclo = (feed: PublicacaoResp[], ciclo: string) =>
    feed.find((p) => p.conteudoId === ciclo)!;

  it('seguir A faz B ver a publicação SEGUIDORES de A; sem seguir, não vê', async () => {
    const perfilA = pubDoCiclo(await feedGrow(authA()), cicloPublico).perfilPublicoId;

    const cicloSeg = await novoCiclo('Cultivo seguidores');
    await request(server())
      .post(`/v1/ciclos/${cicloSeg}/publicar`)
      .set(authA())
      .send({ escopo: 'SEGUIDORES', titulo: 'Só para seguidores' })
      .expect(201);

    expect((await feedGrow(authB())).some((p) => p.conteudoId === cicloSeg)).toBe(false);

    await request(server()).post(`/v1/comunidade/seguir/${perfilA}`).set(authB()).expect(204);
    // Idempotente: seguir de novo não erra.
    await request(server()).post(`/v1/comunidade/seguir/${perfilA}`).set(authB()).expect(204);

    expect((await feedGrow(authB())).some((p) => p.conteudoId === cicloSeg)).toBe(true);

    await request(server()).delete(`/v1/comunidade/seguir/${perfilA}`).set(authB()).expect(204);
    expect((await feedGrow(authB())).some((p) => p.conteudoId === cicloSeg)).toBe(false);
  });

  it('seguir a si mesmo é recusado com 400', async () => {
    const perfilA = pubDoCiclo(await feedGrow(authA()), cicloPublico).perfilPublicoId;
    await request(server()).post(`/v1/comunidade/seguir/${perfilA}`).set(authA()).expect(400);
  });

  it('curtir é idempotente e mexe no contador denormalizado', async () => {
    const pub = pubDoCiclo(await feedGrow(authB()), cicloPublico);
    await request(server())
      .post(`/v1/comunidade/publicacoes/${pub.publicacaoId}/curtir`)
      .set(authB())
      .expect(204);
    await request(server())
      .post(`/v1/comunidade/publicacoes/${pub.publicacaoId}/curtir`)
      .set(authB())
      .expect(204);

    let detalhe = await request(server())
      .get(`/v1/comunidade/publicacoes/${pub.publicacaoId}`)
      .set(authB())
      .expect(200);
    expect(detalhe.body.curtidas).toBe(1);

    await request(server())
      .delete(`/v1/comunidade/publicacoes/${pub.publicacaoId}/curtir`)
      .set(authB())
      .expect(204);
    detalhe = await request(server())
      .get(`/v1/comunidade/publicacoes/${pub.publicacaoId}`)
      .set(authB())
      .expect(200);
    expect(detalhe.body.curtidas).toBe(0);
  });

  it('comentar incrementa o contador e aparece na listagem', async () => {
    const pub = pubDoCiclo(await feedGrow(authB()), cicloPublico);
    const comentario = await request(server())
      .post(`/v1/comunidade/publicacoes/${pub.publicacaoId}/comentarios`)
      .set(authB())
      .send({ texto: 'Belo cultivo!' })
      .expect(201);
    expect(comentario.body.comentarioId).toBeTruthy();

    const lista = await request(server())
      .get(`/v1/comunidade/publicacoes/${pub.publicacaoId}/comentarios`)
      .set(authA())
      .expect(200);
    expect(lista.body.some((c: { texto: string }) => c.texto === 'Belo cultivo!')).toBe(true);

    const detalhe = await request(server())
      .get(`/v1/comunidade/publicacoes/${pub.publicacaoId}`)
      .set(authA())
      .expect(200);
    expect(detalhe.body.comentarios).toBe(1);
  });

  it('forkar um Growlog público devolve a config para pré-preencher um novo ciclo', async () => {
    const cicloOrigem = await novoCiclo('Cultivo forkável');
    await request(server())
      .post(`/v1/ciclos/${cicloOrigem}/publicar`)
      .set(authA())
      .send({ escopo: 'PUBLICO', titulo: 'Receita da casa', dimensoes: { genetica: 'Zkittlez' } })
      .expect(201);
    const pub = pubDoCiclo(await feedGrow(authB()), cicloOrigem);

    const fork = await request(server())
      .post(`/v1/comunidade/publicacoes/${pub.publicacaoId}/fork`)
      .set(authB())
      .expect(201);
    expect(fork.body.conteudoOrigemId).toBe(cicloOrigem);
    expect(fork.body.titulo).toBe('Receita da casa');
    expect(fork.body.dimensoes).toEqual({ genetica: 'Zkittlez' });

    // Idempotente: forkar de novo devolve a mesma config sem erro.
    await request(server())
      .post(`/v1/comunidade/publicacoes/${pub.publicacaoId}/fork`)
      .set(authB())
      .expect(201);
  });

  it('reputação por perfil agrega seguidores, curtidas, comentários e forks', async () => {
    const perfilA = pubDoCiclo(await feedGrow(authA()), cicloPublico).perfilPublicoId;
    const rep = await request(server())
      .get(`/v1/comunidade/perfis/${perfilA}/reputacao`)
      .set(authB())
      .expect(200);
    // A recebeu, ao longo do teste, curtida/comentário/fork de B e não tem seguidor no fim.
    expect(rep.body.perfilId).toBe(perfilA);
    expect(rep.body.contexto).toBe('GROW');
    expect(rep.body.publicacoes).toBeGreaterThan(0);
    expect(rep.body.forksRecebidos).toBeGreaterThanOrEqual(1);
    expect(rep.body.pontuacao).toBeGreaterThan(0);
  });

  const concederPremiumA = () => {
    const corpo = JSON.stringify({
      id: 'evt-com-premium-1',
      tipo: 'PAGAMENTO_RECEBIDO',
      usuarioId: usuarioIdA,
      vigenteAte: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    });
    return request(server())
      .post('/v1/webhooks/pagamento')
      .set('Content-Type', 'application/json')
      .set('x-cosmaria-assinatura', assinarPayloadWebhook(Buffer.from(corpo), SEGREDO))
      .send(corpo);
  };

  it('estatísticas de perfil: visita agregada, gate Premium e só o dono', async () => {
    const perfilA = pubDoCiclo(await feedGrow(authA()), cicloPublico).perfilPublicoId;

    // B visita o perfil de A (registro é livre e agregado — não guarda quem visitou).
    await request(server())
      .post(`/v1/comunidade/perfis/${perfilA}/visualizacao`)
      .set(authB())
      .expect(204);

    // A ainda é gratuito: estatística avançada dispara paywall (402).
    await request(server())
      .get(`/v1/comunidade/perfis/${perfilA}/estatisticas`)
      .set(authA())
      .expect(402);

    // Outro perfil não vê estatística alheia: 404 (não confirma existência).
    await request(server())
      .get(`/v1/comunidade/perfis/${perfilA}/estatisticas`)
      .set(authB())
      .expect(404);

    // Premium é lido do estado de billing por usuarioId (não do token): sem re-login.
    await concederPremiumA().expect(200);

    const stats = await request(server())
      .get(`/v1/comunidade/perfis/${perfilA}/estatisticas`)
      .set(authA())
      .expect(200);
    expect(stats.body.perfilId).toBe(perfilA);
    expect(stats.body.visualizacoesTotais).toBeGreaterThanOrEqual(1);
    expect(Array.isArray(stats.body.visualizacoesPorDia)).toBe(true);
  });
});
