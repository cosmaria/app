import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { assinarPayloadWebhook } from '@cosmaria/core-infrastructure';
import { AppModule } from '../app.module';
import { DomainExceptionFilter } from '../auth/domain-exception.filter';

const SEGREDO = 'segredo-de-teste';

/**
 * e2e de Notificações (repositórios EM MEMÓRIA).
 *
 * O teste central aqui é o EDA ponta a ponta: um webhook de pagamento publica
 * `PagamentoRecebido`/`AssinaturaAtualizada`, o Serviço de Notificações assina esses
 * eventos e a Central passa a exibir o aviso — sem que Billing conheça Notificações.
 */
describe('Notificações (e2e)', () => {
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
  const cred = { email: 'notif@cosmaria.app', senha: 'senhaSegura123' };
  let token = '';
  let usuarioId = '';

  it('prepara usuário autenticado', async () => {
    const reg = await request(server()).post('/v1/auth/register').send(cred);
    usuarioId = reg.body.usuarioId;
    const login = await request(server()).post('/v1/auth/login').send(cred);
    token = login.body.accessToken;
    expect(token).toBeTruthy();
  });

  it('exige autenticação', async () => {
    await request(server()).get('/v1/notificacoes').expect(401);
    await request(server()).get('/v1/preferencia-notificacao').expect(401);
  });

  it('a preferência padrão é criada na primeira leitura', async () => {
    const resposta = await request(server())
      .get('/v1/preferencia-notificacao')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(resposta.body.modoDiscreto).toBe(false);
    expect(resposta.body.fusoHorario).toBe('UTC');
    expect(resposta.body.silencioInicioMinutos).toBeNull();
  });

  it('a Central nasce vazia', async () => {
    const resposta = await request(server())
      .get('/v1/notificacoes')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(resposta.body).toEqual({ itens: [], naoLidas: 0 });
  });

  it('atualiza preferências: canais por categoria, silêncio e Modo Discreto', async () => {
    const resposta = await request(server())
      .put('/v1/preferencia-notificacao')
      .set('Authorization', `Bearer ${token}`)
      .send({
        modoDiscreto: true,
        fusoHorario: 'America/Sao_Paulo',
        silencioInicioMinutos: 1320,
        silencioFimMinutos: 420,
        canaisPorCategoria: [{ categoria: 'BILLING', canais: ['IN_APP', 'EMAIL'] }],
      })
      .expect(200);

    expect(resposta.body.modoDiscreto).toBe(true);
    expect(resposta.body.fusoHorario).toBe('America/Sao_Paulo');
    expect(resposta.body.canaisPorCategoria).toEqual([
      { categoria: 'BILLING', canais: ['IN_APP', 'EMAIL'] },
    ]);
  });

  it('rejeita horário de silêncio fora do dia e categoria desconhecida', async () => {
    await request(server())
      .put('/v1/preferencia-notificacao')
      .set('Authorization', `Bearer ${token}`)
      .send({ silencioInicioMinutos: 1440, silencioFimMinutos: 0 })
      .expect(400);

    await request(server())
      .put('/v1/preferencia-notificacao')
      .set('Authorization', `Bearer ${token}`)
      .send({ canaisPorCategoria: [{ categoria: 'RECREATIVO', canais: ['PUSH'] }] })
      .expect(400);
  });

  it('desliga o silêncio enviando os dois campos como null', async () => {
    const resposta = await request(server())
      .put('/v1/preferencia-notificacao')
      .set('Authorization', `Bearer ${token}`)
      .send({ silencioInicioMinutos: null, silencioFimMinutos: null })
      .expect(200);
    expect(resposta.body.silencioInicioMinutos).toBeNull();
  });

  describe('EDA: um evento de Billing vira notificação sem Billing conhecer Notificações', () => {
    let notificacaoId = '';

    it('o webhook de pagamento produz um aviso na Central', async () => {
      const corpo = JSON.stringify({
        id: 'evt-notif-1',
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

      const central = await request(server())
        .get('/v1/notificacoes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(central.body.naoLidas).toBe(1);
      expect(central.body.itens[0].categoria).toBe('BILLING');
      expect(central.body.itens[0].titulo).toContain('Premium está ativo');
      notificacaoId = central.body.itens[0].notificacaoId;
    });

    it('a Central mostra o conteúdo completo mesmo com Modo Discreto ativo', async () => {
      const central = await request(server())
        .get('/v1/notificacoes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      // Modo Discreto protege canais externos e tela de bloqueio, não a Central autenticada.
      expect(central.body.itens[0].corpo).toContain('Grow');
    });

    it('marcar como lida zera o badge e é idempotente', async () => {
      await request(server())
        .post(`/v1/notificacoes/${notificacaoId}/ler`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
      await request(server())
        .post(`/v1/notificacoes/${notificacaoId}/ler`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      const central = await request(server())
        .get('/v1/notificacoes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(central.body.naoLidas).toBe(0);
      expect(central.body.itens[0].lida).toBe(true);
    });

    it('cancelar a assinatura gera um segundo aviso, tranquilizando sobre os dados', async () => {
      await request(server())
        .post('/v1/assinatura/cancelar')
        .set('Authorization', `Bearer ${token}`)
        .expect(201);

      const central = await request(server())
        .get('/v1/notificacoes')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(central.body.naoLidas).toBe(1);
      expect(central.body.itens[0].titulo).toBe('Assinatura cancelada');
      expect(central.body.itens[0].corpo).toContain('Nenhum dado é perdido');
    });

    it('a paginação da Central respeita limite e deslocamento', async () => {
      const pagina = await request(server())
        .get('/v1/notificacoes?limite=1&deslocamento=1')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(pagina.body.itens).toHaveLength(1);
      expect(pagina.body.itens[0].titulo).toContain('Premium está ativo');
    });
  });
});
