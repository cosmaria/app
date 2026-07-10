import type {
  AssinaturaRepository,
  CatalogoDeCobrancaRepository,
  CupomRepository,
  LimiteDePlanoRepository,
} from '@cosmaria/core-application';
import {
  type AssinaturaPremium,
  type CicloDeCobranca,
  type CupomOuPromocao,
  LimiteDePlano,
  PeriodoGratuitoConfiguracao,
  Plano,
  type PrecoRegional,
} from '@cosmaria/core-domain';

/**
 * Repositórios de Billing em memória — mesmas portas do Postgres (LSP, doc 04 §4).
 * Usados em testes e dev local sem banco.
 */
export class InMemoryAssinaturaRepository implements AssinaturaRepository {
  private readonly porUsuario = new Map<string, AssinaturaPremium>();

  salvar(assinatura: AssinaturaPremium): Promise<void> {
    this.porUsuario.set(assinatura.usuarioId, assinatura);
    return Promise.resolve();
  }

  buscarPorUsuario(usuarioId: string): Promise<AssinaturaPremium | null> {
    return Promise.resolve(this.porUsuario.get(usuarioId) ?? null);
  }
}

/**
 * Limites em memória. Espelha exatamente a configuração inserida pela migration 006
 * (doc 07 §9): 2 ambientes simultâneos no gratuito, ilimitado no Premium. Duplicar o
 * valor aqui é aceitável e deliberado — é o análogo do banco para o modo sem-banco;
 * qualquer divergência aparece no teste de integração, que lê a configuração real.
 */
export class InMemoryLimiteDePlanoRepository implements LimiteDePlanoRepository {
  private readonly limites: LimiteDePlano[] = [
    LimiteDePlano.definir({
      id: 'limite-grow-gratuito',
      chave: 'grow.ambientes_simultaneos',
      plano: Plano.GRATUITO,
      valor: 2,
      vigenteDe: new Date(0),
    }),
    LimiteDePlano.definir({
      id: 'limite-grow-premium',
      chave: 'grow.ambientes_simultaneos',
      plano: Plano.PREMIUM,
      valor: null,
      vigenteDe: new Date(0),
    }),
    LimiteDePlano.definir({
      id: 'limite-midia-gratuito',
      chave: 'core.midia_tamanho_maximo_bytes',
      plano: Plano.GRATUITO,
      valor: 5_242_880,
      vigenteDe: new Date(0),
    }),
    LimiteDePlano.definir({
      id: 'limite-midia-premium',
      chave: 'core.midia_tamanho_maximo_bytes',
      plano: Plano.PREMIUM,
      valor: null,
      vigenteDe: new Date(0),
    }),
  ];

  buscar(plano: Plano, chave: string): Promise<LimiteDePlano | null> {
    return Promise.resolve(
      this.limites.find((l) => l.plano === plano && l.chave === chave) ?? null,
    );
  }

  listarPorPlano(plano: Plano): Promise<LimiteDePlano[]> {
    return Promise.resolve(this.limites.filter((l) => l.plano === plano));
  }
}

export class InMemoryCupomRepository implements CupomRepository {
  private readonly porCodigo = new Map<string, CupomOuPromocao>();

  buscarPorCodigo(codigo: string): Promise<CupomOuPromocao | null> {
    return Promise.resolve(this.porCodigo.get(codigo) ?? null);
  }

  salvar(cupom: CupomOuPromocao): Promise<void> {
    this.porCodigo.set(cupom.codigo, cupom);
    return Promise.resolve();
  }
}

/**
 * Catálogo em memória. Trial desligado e **nenhum preço configurado**, igual à
 * migration: sem `PrecoRegional`, o upgrade recusa em vez de arbitrar um valor em
 * código (doc 07 §9.1). Testes que exercitam o upgrade injetam o preço explicitamente.
 */
export class InMemoryCatalogoDeCobrancaRepository implements CatalogoDeCobrancaRepository {
  private readonly precos: PrecoRegional[] = [];
  private periodoGratuito = PeriodoGratuitoConfiguracao.reconstituir({
    id: 'periodo-premium',
    plano: Plano.PREMIUM,
    duracaoDias: 0,
    ativo: false,
  });

  /** Gancho de teste/dev: configura um preço sem tocar no banco. */
  registrarPreco(preco: PrecoRegional): void {
    this.precos.push(preco);
  }

  /** Gancho de teste/dev: liga o trial, como um UPDATE faria em produção. */
  configurarPeriodoGratuito(configuracao: PeriodoGratuitoConfiguracao): void {
    this.periodoGratuito = configuracao;
  }

  buscarPeriodoGratuito(plano: Plano): Promise<PeriodoGratuitoConfiguracao | null> {
    return Promise.resolve(this.periodoGratuito.plano === plano ? this.periodoGratuito : null);
  }

  buscarPrecoRegional(
    pais: string,
    plano: Plano,
    ciclo: CicloDeCobranca,
  ): Promise<PrecoRegional | null> {
    return Promise.resolve(
      this.precos.find((p) => p.pais === pais && p.plano === plano && p.ciclo === ciclo) ?? null,
    );
  }
}
