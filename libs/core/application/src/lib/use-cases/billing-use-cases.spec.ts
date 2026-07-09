import {
  AssinaturaDePayloadInvalidaError,
  AssinaturaJaAtivaError,
  AssinaturaPremium,
  CicloDeCobranca,
  CupomInvalidoError,
  CupomOuPromocao,
  type DomainEvent,
  LimiteDePlano,
  PeriodoGratuitoConfiguracao,
  Plano,
  PrecoRegional,
  PrecoNaoConfiguradoError,
  StatusAssinatura,
  TipoDeDesconto,
} from '@cosmaria/core-domain';
import type { EventPublisher } from '../ports/event-publisher.port';
import type { IdGenerator } from '../ports/id-generator.port';
import type {
  AssinaturaRepository,
  CatalogoDeCobrancaRepository,
  CupomRepository,
  LimiteDePlanoRepository,
} from '../ports/billing.repositories';
import type { RegistroDeIdempotenciaRepository } from '../ports/idempotencia.port';
import type {
  CheckoutSolicitado,
  EventoDePagamento,
  ProcessadorDePagamento,
} from '../ports/processador-de-pagamento.port';
import {
  AplicarCupomUseCase,
  CancelarAssinaturaUseCase,
  IniciarUpgradeUseCase,
  ObterAssinaturaUseCase,
  ResolverAssinaturaService,
} from './assinatura.use-cases';
import { ConsultarLimitesUseCase, VerificarLimiteUseCase } from './limites.use-cases';
import { ProcessarEventoDePagamentoUseCase } from './webhook-pagamento.use-case';

class AssinaturasFake implements AssinaturaRepository {
  readonly porUsuario = new Map<string, AssinaturaPremium>();
  salvar(a: AssinaturaPremium): Promise<void> {
    this.porUsuario.set(a.usuarioId, a);
    return Promise.resolve();
  }
  buscarPorUsuario(usuarioId: string): Promise<AssinaturaPremium | null> {
    return Promise.resolve(this.porUsuario.get(usuarioId) ?? null);
  }
}

class LimitesFake implements LimiteDePlanoRepository {
  constructor(private readonly limites: LimiteDePlano[]) {}
  buscar(plano: Plano, chave: string): Promise<LimiteDePlano | null> {
    return Promise.resolve(
      this.limites.find((l) => l.plano === plano && l.chave === chave) ?? null,
    );
  }
  listarPorPlano(plano: Plano): Promise<LimiteDePlano[]> {
    return Promise.resolve(this.limites.filter((l) => l.plano === plano));
  }
}

class CuponsFake implements CupomRepository {
  readonly porCodigo = new Map<string, CupomOuPromocao>();
  buscarPorCodigo(codigo: string): Promise<CupomOuPromocao | null> {
    return Promise.resolve(this.porCodigo.get(codigo) ?? null);
  }
  salvar(cupom: CupomOuPromocao): Promise<void> {
    this.porCodigo.set(cupom.codigo, cupom);
    return Promise.resolve();
  }
}

class CatalogoFake implements CatalogoDeCobrancaRepository {
  periodo: PeriodoGratuitoConfiguracao | null = null;
  preco: PrecoRegional | null = null;
  buscarPeriodoGratuito(): Promise<PeriodoGratuitoConfiguracao | null> {
    return Promise.resolve(this.periodo);
  }
  buscarPrecoRegional(): Promise<PrecoRegional | null> {
    return Promise.resolve(this.preco);
  }
}

class EventosFake implements EventPublisher {
  readonly publicados: DomainEvent[] = [];
  publicar(evento: DomainEvent): Promise<void> {
    this.publicados.push(evento);
    return Promise.resolve();
  }
  nomes(): string[] {
    return this.publicados.map((e) => e.nome);
  }
}

class IdempotenciaFake implements RegistroDeIdempotenciaRepository {
  readonly chaves = new Set<string>();
  registrarSeNova(chave: string): Promise<boolean> {
    if (this.chaves.has(chave)) {
      return Promise.resolve(false);
    }
    this.chaves.add(chave);
    return Promise.resolve(true);
  }
}

class PagamentoFake implements ProcessadorDePagamento {
  assinaturaValida = true;
  evento: EventoDePagamento = {
    eventoExternoId: 'evt-1',
    tipo: 'PAGAMENTO_RECEBIDO',
    usuarioId: 'u-1',
    vigenteAte: new Date('2026-08-09T12:00:00Z'),
    motivo: null,
  };
  checkoutsCriados = 0;

  criarCheckout(): Promise<CheckoutSolicitado> {
    this.checkoutsCriados += 1;
    return Promise.resolve({ urlCheckout: 'https://checkout.test', referenciaExterna: 'ref-1' });
  }
  nomeDoCabecalhoDeAssinatura(): string {
    return 'x-assinatura';
  }
  verificarAssinatura(): boolean {
    return this.assinaturaValida;
  }
  interpretarEvento(): EventoDePagamento {
    return this.evento;
  }
}

const ids = (): IdGenerator => {
  let n = 0;
  return { gerar: () => `id-${++n}` };
};

const precoBrasil = () =>
  PrecoRegional.reconstituir({
    id: 'preco-br',
    pais: 'BR',
    moeda: 'BRL',
    plano: Plano.PREMIUM,
    ciclo: CicloDeCobranca.MENSAL,
    valorCentavos: 2990,
  });

const montar = () => {
  const assinaturas = new AssinaturasFake();
  const catalogo = new CatalogoFake();
  const cupons = new CuponsFake();
  const eventos = new EventosFake();
  const pagamento = new PagamentoFake();
  const idempotencia = new IdempotenciaFake();
  const resolver = new ResolverAssinaturaService(assinaturas, ids());

  return {
    assinaturas,
    catalogo,
    cupons,
    eventos,
    pagamento,
    idempotencia,
    resolver,
    obter: new ObterAssinaturaUseCase(resolver),
    upgrade: new IniciarUpgradeUseCase(resolver, assinaturas, catalogo, cupons, pagamento, eventos),
    cancelar: new CancelarAssinaturaUseCase(resolver, assinaturas, eventos),
    aplicarCupom: new AplicarCupomUseCase(resolver, assinaturas, cupons),
    webhook: new ProcessarEventoDePagamentoUseCase(
      pagamento,
      idempotencia,
      resolver,
      assinaturas,
      eventos,
    ),
  };
};

const corpo = Buffer.from('{}');

describe('ResolverAssinaturaService (criação lazy da assinatura gratuita)', () => {
  it('cria a assinatura gratuita na primeira consulta', async () => {
    const c = montar();
    const view = await c.obter.executar('u-1');
    expect(view.plano).toBe(Plano.GRATUITO);
    expect(view.premiumAtivo).toBe(false);
    expect(c.assinaturas.porUsuario.size).toBe(1);
  });

  it('é idempotente: a segunda consulta não cria outra assinatura', async () => {
    const c = montar();
    await c.obter.executar('u-1');
    await c.obter.executar('u-1');
    expect(c.assinaturas.porUsuario.size).toBe(1);
  });
});

describe('IniciarUpgradeUseCase (doc 07 §5)', () => {
  it('recusa o upgrade quando não há preço configurado para a região', async () => {
    const c = montar();
    await expect(
      c.upgrade.executar({ usuarioId: 'u-1', ciclo: CicloDeCobranca.MENSAL, pais: 'BR' }),
    ).rejects.toThrow(PrecoNaoConfiguradoError);
    // Nenhum checkout é criado, nenhuma assinatura muda de status.
    expect(c.pagamento.checkoutsCriados).toBe(0);
  });

  it('devolve checkout e NÃO concede Premium até o pagamento confirmar', async () => {
    const c = montar();
    c.catalogo.preco = precoBrasil();

    const resultado = await c.upgrade.executar({
      usuarioId: 'u-1',
      ciclo: CicloDeCobranca.MENSAL,
      pais: 'BR',
    });

    expect(resultado.checkout?.urlCheckout).toBe('https://checkout.test');
    expect(resultado.assinatura.status).toBe(StatusAssinatura.PENDENTE_PAGAMENTO);
    expect(resultado.assinatura.premiumAtivo).toBe(false);
    expect(c.eventos.nomes()).toEqual(['AssinaturaAtualizada']);
  });

  it('quando há trial ativo, concede Premium sem cobrar e sem checkout', async () => {
    const c = montar();
    c.catalogo.preco = precoBrasil();
    c.catalogo.periodo = PeriodoGratuitoConfiguracao.reconstituir({
      id: 'p-1',
      plano: Plano.PREMIUM,
      duracaoDias: 7,
      ativo: true,
    });

    const resultado = await c.upgrade.executar({
      usuarioId: 'u-1',
      ciclo: CicloDeCobranca.MENSAL,
      pais: 'BR',
    });

    expect(resultado.checkout).toBeNull();
    expect(resultado.assinatura.status).toBe(StatusAssinatura.TRIAL);
    expect(resultado.assinatura.premiumAtivo).toBe(true);
    expect(c.pagamento.checkoutsCriados).toBe(0);
  });

  it('recusa upgrade de quem já tem Premium ativo', async () => {
    const c = montar();
    c.catalogo.preco = precoBrasil();
    const assinatura = AssinaturaPremium.criarGratuita({ id: 'a-1', usuarioId: 'u-1' });
    assinatura.iniciarUpgrade({ ciclo: CicloDeCobranca.MENSAL, moeda: 'BRL' });
    assinatura.confirmarPagamento(new Date(Date.now() + 86_400_000));
    await c.assinaturas.salvar(assinatura);

    await expect(
      c.upgrade.executar({ usuarioId: 'u-1', ciclo: CicloDeCobranca.MENSAL, pais: 'BR' }),
    ).rejects.toThrow(AssinaturaJaAtivaError);
  });

  it('o conflito de "já ativa" vem ANTES de qualquer erro de configuração', async () => {
    const c = montar();
    // Sem preço configurado: um usuário comum receberia PrecoNaoConfiguradoError aqui.
    const assinatura = AssinaturaPremium.criarGratuita({ id: 'a-1', usuarioId: 'u-1' });
    assinatura.iniciarUpgrade({ ciclo: CicloDeCobranca.MENSAL, moeda: 'BRL' });
    assinatura.confirmarPagamento(new Date(Date.now() + 86_400_000));
    await c.assinaturas.salvar(assinatura);

    // O estado do usuário não pode ser mascarado por um problema de configuração.
    await expect(
      c.upgrade.executar({ usuarioId: 'u-1', ciclo: CicloDeCobranca.MENSAL, pais: 'BR' }),
    ).rejects.toThrow(AssinaturaJaAtivaError);
  });

  it('recusa cupom inválido antes de criar qualquer checkout', async () => {
    const c = montar();
    c.catalogo.preco = precoBrasil();
    await expect(
      c.upgrade.executar({
        usuarioId: 'u-1',
        ciclo: CicloDeCobranca.MENSAL,
        pais: 'BR',
        cupomCodigo: 'INEXISTENTE',
      }),
    ).rejects.toThrow(CupomInvalidoError);
    expect(c.pagamento.checkoutsCriados).toBe(0);
  });
});

describe('CancelarAssinaturaUseCase', () => {
  it('publica AssinaturaAtualizada e mantém o período pago', async () => {
    const c = montar();
    const assinatura = AssinaturaPremium.criarGratuita({ id: 'a-1', usuarioId: 'u-1' });
    assinatura.iniciarUpgrade({ ciclo: CicloDeCobranca.MENSAL, moeda: 'BRL' });
    assinatura.confirmarPagamento(new Date(Date.now() + 86_400_000));
    await c.assinaturas.salvar(assinatura);

    const view = await c.cancelar.executar('u-1');
    expect(view.status).toBe(StatusAssinatura.CANCELADA);
    expect(view.premiumAtivo).toBe(true);
    expect(c.eventos.nomes()).toEqual(['AssinaturaAtualizada']);
  });
});

describe('AplicarCupomUseCase', () => {
  it('consome um uso do cupom e o vincula à assinatura Premium', async () => {
    const c = montar();
    const assinatura = AssinaturaPremium.criarGratuita({ id: 'a-1', usuarioId: 'u-1' });
    assinatura.iniciarUpgrade({ ciclo: CicloDeCobranca.MENSAL, moeda: 'BRL' });
    await c.assinaturas.salvar(assinatura);

    const cupom = CupomOuPromocao.criar({
      id: 'c-1',
      codigo: 'BEMVINDO',
      tipoDeDesconto: TipoDeDesconto.PERCENTUAL,
      valor: 20,
    });
    await c.cupons.salvar(cupom);

    await c.aplicarCupom.executar({ usuarioId: 'u-1', codigo: 'bemvindo' });
    expect(cupom.usosRealizados).toBe(1);
  });

  it('rejeita cupom esgotado', async () => {
    const c = montar();
    const assinatura = AssinaturaPremium.criarGratuita({ id: 'a-1', usuarioId: 'u-1' });
    assinatura.iniciarUpgrade({ ciclo: CicloDeCobranca.MENSAL, moeda: 'BRL' });
    await c.assinaturas.salvar(assinatura);

    const cupom = CupomOuPromocao.criar({
      id: 'c-1',
      codigo: 'ESGOTADO',
      tipoDeDesconto: TipoDeDesconto.PERCENTUAL,
      valor: 10,
      usosMaximos: 1,
    });
    cupom.registrarUso();
    await c.cupons.salvar(cupom);

    await expect(c.aplicarCupom.executar({ usuarioId: 'u-1', codigo: 'ESGOTADO' })).rejects.toThrow(
      CupomInvalidoError,
    );
  });
});

describe('Limites de plano (doc 07 §9)', () => {
  const limites = () =>
    new LimitesFake([
      LimiteDePlano.definir({
        id: 'l-1',
        chave: 'grow.ambientes_simultaneos',
        plano: Plano.GRATUITO,
        valor: 2,
      }),
      LimiteDePlano.definir({
        id: 'l-2',
        chave: 'grow.ambientes_simultaneos',
        plano: Plano.PREMIUM,
        valor: null,
      }),
    ]);

  it('gratuito: permite até o limite e publica LimitePremiumAtingido ao barrar', async () => {
    const c = montar();
    const verificar = new VerificarLimiteUseCase(c.resolver, limites(), c.eventos);

    const dentro = await verificar.executar({
      usuarioId: 'u-1',
      chave: 'grow.ambientes_simultaneos',
      usoAtual: 1,
    });
    expect(dentro.permitido).toBe(true);
    expect(c.eventos.nomes()).toEqual([]);

    const barrado = await verificar.executar({
      usuarioId: 'u-1',
      chave: 'grow.ambientes_simultaneos',
      usoAtual: 2,
    });
    expect(barrado.permitido).toBe(false);
    expect(barrado.limite).toBe(2);
    expect(c.eventos.nomes()).toEqual(['LimitePremiumAtingido']);
  });

  it('premium ativo: ilimitado, sem evento', async () => {
    const c = montar();
    const assinatura = AssinaturaPremium.criarGratuita({ id: 'a-1', usuarioId: 'u-1' });
    assinatura.iniciarUpgrade({ ciclo: CicloDeCobranca.MENSAL, moeda: 'BRL' });
    assinatura.confirmarPagamento(new Date(Date.now() + 86_400_000));
    await c.assinaturas.salvar(assinatura);

    const resultado = await new VerificarLimiteUseCase(c.resolver, limites(), c.eventos).executar({
      usuarioId: 'u-1',
      chave: 'grow.ambientes_simultaneos',
      usoAtual: 9999,
    });
    expect(resultado.permitido).toBe(true);
    expect(resultado.limite).toBeNull();
    expect(c.eventos.nomes()).toEqual([]);
  });

  it('chave desconhecida nunca bloqueia por omissão', async () => {
    const c = montar();
    const resultado = await new VerificarLimiteUseCase(c.resolver, limites(), c.eventos).executar({
      usuarioId: 'u-1',
      chave: 'med.historico_clinico',
      usoAtual: 100_000,
    });
    expect(resultado.permitido).toBe(true);
  });

  it('cancelar reverte para os limites do gratuito quando o período pago acaba', async () => {
    const c = montar();
    const ontem = new Date(Date.now() - 86_400_000);
    const assinatura = AssinaturaPremium.criarGratuita({ id: 'a-1', usuarioId: 'u-1' });
    assinatura.iniciarUpgrade({ ciclo: CicloDeCobranca.MENSAL, moeda: 'BRL' });
    assinatura.confirmarPagamento(ontem);
    assinatura.cancelar();
    await c.assinaturas.salvar(assinatura);

    const consultar = new ConsultarLimitesUseCase(c.resolver, limites());
    const resultado = await consultar.executar('u-1');
    expect(resultado.plano).toBe(Plano.GRATUITO);
    expect(resultado.limites).toEqual([{ chave: 'grow.ambientes_simultaneos', limite: 2 }]);
  });
});

describe('ProcessarEventoDePagamentoUseCase (webhook, doc 09 API-7)', () => {
  it('rejeita payload com assinatura inválida ANTES de qualquer efeito', async () => {
    const c = montar();
    c.pagamento.assinaturaValida = false;

    await expect(
      c.webhook.executar({ corpoBruto: corpo, assinaturaRecebida: 'forjada', payload: {} }),
    ).rejects.toThrow(AssinaturaDePayloadInvalidaError);

    expect(c.assinaturas.porUsuario.size).toBe(0);
    expect(c.eventos.publicados).toHaveLength(0);
  });

  it('pagamento recebido ativa o Premium e publica os eventos', async () => {
    const c = montar();
    const resultado = await c.webhook.executar({
      corpoBruto: corpo,
      assinaturaRecebida: 'ok',
      payload: {},
    });

    expect(resultado.processado).toBe(true);
    const assinatura = await c.assinaturas.buscarPorUsuario('u-1');
    expect(assinatura?.ehPremiumAtivo()).toBe(true);
    expect(c.eventos.nomes()).toEqual(['PagamentoRecebido', 'AssinaturaAtualizada']);
  });

  it('reentrega do MESMO evento não duplica efeito nem eventos (idempotência)', async () => {
    const c = montar();
    await c.webhook.executar({ corpoBruto: corpo, assinaturaRecebida: 'ok', payload: {} });
    const segunda = await c.webhook.executar({
      corpoBruto: corpo,
      assinaturaRecebida: 'ok',
      payload: {},
    });

    expect(segunda.processado).toBe(false);
    expect(c.eventos.nomes()).toEqual(['PagamentoRecebido', 'AssinaturaAtualizada']);
  });

  it('pagamento falhou suspende o Premium sem apagar a assinatura', async () => {
    const c = montar();
    await c.webhook.executar({ corpoBruto: corpo, assinaturaRecebida: 'ok', payload: {} });

    c.pagamento.evento = {
      eventoExternoId: 'evt-2',
      tipo: 'PAGAMENTO_FALHOU',
      usuarioId: 'u-1',
      vigenteAte: null,
      motivo: 'cartao_recusado',
    };
    await c.webhook.executar({ corpoBruto: corpo, assinaturaRecebida: 'ok', payload: {} });

    const assinatura = await c.assinaturas.buscarPorUsuario('u-1');
    expect(assinatura?.status).toBe(StatusAssinatura.INADIMPLENTE);
    expect(assinatura?.ehPremiumAtivo()).toBe(false);
    expect(c.eventos.nomes()).toContain('PagamentoFalhou');
  });
});
