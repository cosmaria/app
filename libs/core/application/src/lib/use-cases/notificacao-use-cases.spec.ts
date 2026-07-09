import {
  AssinaturaAtualizada,
  CanalDeNotificacao,
  CategoriaDeNotificacao,
  LimitePremiumAtingido,
  Notificacao,
  PagamentoFalhou,
  Plano,
  PreferenciaDeNotificacao,
  StatusAssinatura,
  StatusNotificacao,
} from '@cosmaria/core-domain';
import type { IdGenerator } from '../ports/id-generator.port';
import type {
  DespachanteDeNotificacao,
  EnvioDeNotificacao,
} from '../ports/despachante-de-notificacao.port';
import type { RegistroDeIdempotenciaRepository } from '../ports/idempotencia.port';
import type {
  NotificacaoRepository,
  PaginaDeNotificacoes,
  PreferenciaDeNotificacaoRepository,
} from '../ports/notificacao.repositories';
import {
  EnviarNotificacaoService,
  minutosDoDiaNoFuso,
  ResolverPreferenciaDeNotificacaoService,
} from './notificacao.use-cases';
import {
  AtualizarPreferenciaDeNotificacaoUseCase,
  ListarNotificacoesUseCase,
  MarcarNotificacaoLidaUseCase,
  ObterPreferenciaDeNotificacaoUseCase,
} from './central-de-notificacoes.use-cases';
import { NotificarSobreEventosService } from './notificar-sobre-eventos.service';

class PreferenciasFake implements PreferenciaDeNotificacaoRepository {
  readonly porUsuario = new Map<string, PreferenciaDeNotificacao>();
  salvar(p: PreferenciaDeNotificacao): Promise<void> {
    this.porUsuario.set(p.usuarioId, p);
    return Promise.resolve();
  }
  buscarPorUsuario(usuarioId: string): Promise<PreferenciaDeNotificacao | null> {
    return Promise.resolve(this.porUsuario.get(usuarioId) ?? null);
  }
}

class NotificacoesFake implements NotificacaoRepository {
  readonly porId = new Map<string, Notificacao>();
  salvar(n: Notificacao): Promise<void> {
    this.porId.set(n.id, n);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Notificacao | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorUsuario(
    usuarioId: string,
    parametros: { limite: number; deslocamento: number },
  ): Promise<PaginaDeNotificacoes> {
    const todas = [...this.porId.values()]
      .filter((n) => n.usuarioId === usuarioId)
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
    return Promise.resolve({
      itens: todas.slice(parametros.deslocamento, parametros.deslocamento + parametros.limite),
      naoLidas: todas.filter((n) => !n.ehLida()).length,
    });
  }
}

class DespachanteFake implements DespachanteDeNotificacao {
  readonly enviados: EnvioDeNotificacao[] = [];
  falharEm: CanalDeNotificacao | null = null;

  canaisSuportados(): CanalDeNotificacao[] {
    return [CanalDeNotificacao.PUSH, CanalDeNotificacao.EMAIL];
  }
  despachar(envio: EnvioDeNotificacao): Promise<void> {
    if (this.falharEm === envio.canal) {
      return Promise.reject(new Error('provedor fora do ar'));
    }
    this.enviados.push(envio);
    return Promise.resolve();
  }
}

class AntiSpamFake implements RegistroDeIdempotenciaRepository {
  readonly chaves = new Set<string>();
  registrarSeNova(chave: string): Promise<boolean> {
    if (this.chaves.has(chave)) {
      return Promise.resolve(false);
    }
    this.chaves.add(chave);
    return Promise.resolve(true);
  }
}

const ids = (): IdGenerator => {
  let n = 0;
  return { gerar: () => `n-${++n}` };
};

const montar = () => {
  const preferencias = new PreferenciasFake();
  const notificacoes = new NotificacoesFake();
  const despachante = new DespachanteFake();
  const antiSpam = new AntiSpamFake();
  const resolver = new ResolverPreferenciaDeNotificacaoService(preferencias, ids());
  const enviar = new EnviarNotificacaoService(resolver, notificacoes, despachante, antiSpam, ids());
  return {
    preferencias,
    notificacoes,
    despachante,
    antiSpam,
    resolver,
    enviar,
    obterPreferencia: new ObterPreferenciaDeNotificacaoUseCase(resolver),
    atualizarPreferencia: new AtualizarPreferenciaDeNotificacaoUseCase(resolver, preferencias),
    listar: new ListarNotificacoesUseCase(notificacoes),
    marcarLida: new MarcarNotificacaoLidaUseCase(notificacoes),
    notificador: new NotificarSobreEventosService(enviar),
  };
};

const tarefa = (over: Record<string, unknown> = {}) => ({
  usuarioId: 'u-1',
  categoria: CategoriaDeNotificacao.TAREFA,
  titulo: 'Regar OG Kush',
  corpo: 'Estufa 1 precisa de rega.',
  tituloDiscreto: 'COSMARIA',
  corpoDiscreto: 'Você tem uma tarefa.',
  chaveDeAgrupamento: 'tarefa:1',
  ...over,
});

describe('minutosDoDiaNoFuso (i18n — horário local, não UTC)', () => {
  const meiaNoiteUtc = new Date('2026-07-09T00:00:00Z');

  it('converte para a hora local do fuso do usuário', () => {
    // São Paulo é UTC-3: meia-noite UTC é 21:00 do dia anterior.
    expect(minutosDoDiaNoFuso(meiaNoiteUtc, 'America/Sao_Paulo')).toBe(21 * 60);
    expect(minutosDoDiaNoFuso(meiaNoiteUtc, 'UTC')).toBe(0);
  });

  it('fuso inválido cai em UTC, nunca quebra o envio', () => {
    expect(minutosDoDiaNoFuso(meiaNoiteUtc, 'Marte/Olympus')).toBe(0);
  });
});

describe('EnviarNotificacaoService (doc 04 §15)', () => {
  it('despacha pelos canais externos e registra a notificação', async () => {
    const c = montar();
    const resultado = await c.enviar.executar(tarefa());

    expect(resultado.status).toBe(StatusNotificacao.ENVIADA);
    expect(resultado.canaisDespachados).toEqual([CanalDeNotificacao.PUSH]);
    expect(c.despachante.enviados).toHaveLength(1);
    expect(c.notificacoes.porId.size).toBe(1);
  });

  it('silenciar NUNCA descarta — a notificação continua na Central', async () => {
    const c = montar();
    const preferencia = await c.resolver.executar('u-1');
    preferencia.definirCanais(CategoriaDeNotificacao.TAREFA, []);
    await c.preferencias.salvar(preferencia);

    const resultado = await c.enviar.executar(tarefa());

    expect(resultado.status).toBe(StatusNotificacao.SILENCIADA);
    expect(c.despachante.enviados).toHaveLength(0);
    const central = await c.listar.executar('u-1');
    expect(central.itens).toHaveLength(1);
    expect(central.naoLidas).toBe(1);
  });

  it('anti-spam impede o segundo envio externo, mas registra na Central', async () => {
    const c = montar();
    await c.enviar.executar(tarefa());
    const segunda = await c.enviar.executar(tarefa());

    expect(segunda.status).toBe(StatusNotificacao.SILENCIADA);
    expect(c.despachante.enviados).toHaveLength(1);
    const central = await c.listar.executar('u-1');
    expect(central.itens).toHaveLength(2);
  });

  it('chave de agrupamento diferente não é bloqueada pelo anti-spam', async () => {
    const c = montar();
    await c.enviar.executar(tarefa({ chaveDeAgrupamento: 'tarefa:1' }));
    const outra = await c.enviar.executar(tarefa({ chaveDeAgrupamento: 'tarefa:2' }));
    expect(outra.status).toBe(StatusNotificacao.ENVIADA);
  });

  it('Modo Discreto: o despachante nunca vê o conteúdo sensível (doc 01 §15)', async () => {
    const c = montar();
    const preferencia = await c.resolver.executar('u-1');
    preferencia.definirModoDiscreto(true);
    await c.preferencias.salvar(preferencia);

    await c.enviar.executar(tarefa());

    const envio = c.despachante.enviados[0];
    expect(envio.conteudo.titulo).toBe('COSMARIA');
    expect(envio.conteudo.corpo).not.toContain('Estufa');
    // Mas a Central preserva o conteúdo completo, já que o usuário está autenticado.
    const central = await c.listar.executar('u-1');
    expect(central.itens[0].titulo).toContain('OG Kush');
  });

  it('horário de silêncio impede o envio externo', async () => {
    const c = montar();
    const preferencia = await c.resolver.executar('u-1');
    // Silêncio o dia inteiro exceto um minuto — garante que "agora" cai dentro.
    preferencia.definirHorarioDeSilencio(0, 1439);
    preferencia.definirFusoHorario('UTC');
    await c.preferencias.salvar(preferencia);

    const resultado = await c.enviar.executar(tarefa());
    expect(resultado.status).toBe(StatusNotificacao.SILENCIADA);
    expect(c.despachante.enviados).toHaveLength(0);
  });

  it('falha do provedor externo não derruba o fluxo e a Central reflete a verdade', async () => {
    const c = montar();
    c.despachante.falharEm = CanalDeNotificacao.PUSH;

    const resultado = await c.enviar.executar(tarefa());

    // Nenhum canal entregou: a notificação não mente dizendo que foi enviada.
    expect(resultado.status).toBe(StatusNotificacao.SILENCIADA);
    const central = await c.listar.executar('u-1');
    expect(central.itens).toHaveLength(1);
  });

  it('canal não suportado pelo despachante é simplesmente ignorado', async () => {
    const c = montar();
    const preferencia = await c.resolver.executar('u-1');
    preferencia.definirCanais(CategoriaDeNotificacao.TAREFA, [CanalDeNotificacao.WHATSAPP]);
    await c.preferencias.salvar(preferencia);

    const resultado = await c.enviar.executar(tarefa());
    expect(resultado.status).toBe(StatusNotificacao.SILENCIADA);
  });
});

describe('Central de Notificações', () => {
  it('pagina e conta as não lidas', async () => {
    const c = montar();
    for (let i = 0; i < 3; i++) {
      await c.enviar.executar(tarefa({ chaveDeAgrupamento: `tarefa:${i}` }));
    }
    const pagina = await c.listar.executar('u-1', { limite: 2, deslocamento: 0 });
    expect(pagina.itens).toHaveLength(2);
    expect(pagina.naoLidas).toBe(3);
  });

  it('marcar como lida reduz o contador; reler é idempotente', async () => {
    const c = montar();
    const { notificacaoId } = await c.enviar.executar(tarefa());

    await c.marcarLida.executar({ usuarioId: 'u-1', notificacaoId });
    await c.marcarLida.executar({ usuarioId: 'u-1', notificacaoId });

    const central = await c.listar.executar('u-1');
    expect(central.naoLidas).toBe(0);
  });

  it('não marca como lida a notificação de outro usuário, e não revela sua existência', async () => {
    const c = montar();
    const { notificacaoId } = await c.enviar.executar(tarefa());

    await expect(
      c.marcarLida.executar({ usuarioId: 'intruso', notificacaoId }),
    ).resolves.toBeUndefined();

    const central = await c.listar.executar('u-1');
    expect(central.naoLidas).toBe(1);
  });

  it('atualização parcial da preferência não zera o que não foi enviado', async () => {
    const c = montar();
    await c.atualizarPreferencia.executar({ usuarioId: 'u-1', modoDiscreto: true });
    const view = await c.atualizarPreferencia.executar({
      usuarioId: 'u-1',
      fusoHorario: 'America/Sao_Paulo',
    });

    expect(view.modoDiscreto).toBe(true);
    expect(view.fusoHorario).toBe('America/Sao_Paulo');
  });

  it('a preferência padrão é criada na primeira leitura', async () => {
    const c = montar();
    const view = await c.obterPreferencia.executar('u-1');
    expect(view.modoDiscreto).toBe(false);
    expect(view.fusoHorario).toBe('UTC');
    expect(c.preferencias.porUsuario.size).toBe(1);
  });
});

describe('NotificarSobreEventosService (segundo consumidor do EDA)', () => {
  it('avisa quando o Premium fica ativo', async () => {
    const c = montar();
    await c.notificador.notificar(
      new AssinaturaAtualizada(
        'a-1',
        'u-1',
        StatusAssinatura.PENDENTE_PAGAMENTO,
        StatusAssinatura.ATIVA,
        Plano.PREMIUM,
      ),
    );
    const central = await c.listar.executar('u-1');
    expect(central.itens[0].titulo).toContain('Premium está ativo');
  });

  it('NÃO avisa em PENDENTE_PAGAMENTO — o usuário acabou de clicar em assinar', async () => {
    const c = montar();
    await c.notificador.notificar(
      new AssinaturaAtualizada(
        'a-1',
        'u-1',
        StatusAssinatura.ATIVA,
        StatusAssinatura.PENDENTE_PAGAMENTO,
        Plano.PREMIUM,
      ),
    );
    expect((await c.listar.executar('u-1')).itens).toHaveLength(0);
  });

  it('NÃO avisa em INADIMPLENTE — PagamentoFalhou já cobre o caso, sem duplicar', async () => {
    const c = montar();
    await c.notificador.notificar(
      new AssinaturaAtualizada(
        'a-1',
        'u-1',
        StatusAssinatura.ATIVA,
        StatusAssinatura.INADIMPLENTE,
        Plano.PREMIUM,
      ),
    );
    expect((await c.listar.executar('u-1')).itens).toHaveLength(0);

    await c.notificador.notificar(new PagamentoFalhou('u-1', 'evt-1', 'cartao_recusado'));
    expect((await c.listar.executar('u-1')).itens).toHaveLength(1);
  });

  it('avisa sobre limite atingido com tom informativo, nunca de pressão', async () => {
    const c = montar();
    await c.notificador.notificar(
      new LimitePremiumAtingido('u-1', 'grow.ambientes_simultaneos', 2),
    );
    const item = (await c.listar.executar('u-1')).itens[0];
    expect(item.categoria).toBe(CategoriaDeNotificacao.BILLING);
    expect(item.corpo).toContain('continuam completos');
  });

  it('falha ao notificar NUNCA propaga para a operação de domínio', async () => {
    const c = montar();
    jest.spyOn(c.notificacoes, 'salvar').mockRejectedValueOnce(new Error('banco fora do ar'));

    await expect(
      c.notificador.notificar(new PagamentoFalhou('u-1', 'evt-1', null)),
    ).resolves.toBeUndefined();
  });

  it('ignora eventos que não viram notificação', async () => {
    const c = montar();
    await c.notificador.notificar({ nome: 'EventoDesconhecido', ocorridoEm: new Date() });
    expect((await c.listar.executar('u-1')).itens).toHaveLength(0);
  });
});
