import {
  AssinaturaAtualizada,
  AssinaturaJaAtivaError,
  AssinaturaPremium,
  type CicloDeCobranca,
  CupomInvalidoError,
  Plano,
  PrecoNaoConfiguradoError,
  type StatusAssinatura,
} from '@cosmaria/core-domain';
import { EventPublisher } from '../ports/event-publisher.port';
import { IdGenerator } from '../ports/id-generator.port';
import {
  AssinaturaRepository,
  CatalogoDeCobrancaRepository,
  CupomRepository,
} from '../ports/billing.repositories';
import {
  type CheckoutSolicitado,
  ProcessadorDePagamento,
} from '../ports/processador-de-pagamento.port';

export interface AssinaturaView {
  plano: Plano;
  status: StatusAssinatura;
  /** O que realmente vale hoje — pode diferir de `plano` (ex.: cancelada mas vigente). */
  premiumAtivo: boolean;
  moeda: string | null;
  cicloDeCobranca: CicloDeCobranca | null;
  vigenteAte: string | null;
}

export const paraAssinaturaView = (a: AssinaturaPremium, agora = new Date()): AssinaturaView => ({
  plano: a.plano,
  status: a.status,
  premiumAtivo: a.ehPremiumAtivo(agora),
  moeda: a.moeda,
  cicloDeCobranca: a.cicloDeCobranca,
  vigenteAte: a.vigenteAte ? a.vigenteAte.toISOString() : null,
});

/**
 * Resolve a assinatura da Conta, criando a gratuita na primeira consulta.
 *
 * Toda conta tem assinatura (1—1, doc 08 §12.6), mas criá-la no registro do usuário
 * acoplaria Identidade a Billing. A criação lazy mantém os módulos independentes e é
 * idempotente pela chave natural (usuario_id) do banco — mesmo padrão do PerfilPúblico.
 */
export class ResolverAssinaturaService {
  constructor(
    private readonly repo: AssinaturaRepository,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(usuarioId: string): Promise<AssinaturaPremium> {
    const existente = await this.repo.buscarPorUsuario(usuarioId);
    if (existente) {
      return existente;
    }
    const gratuita = AssinaturaPremium.criarGratuita({ id: this.idGen.gerar(), usuarioId });
    await this.repo.salvar(gratuita);
    // Releitura: sob concorrência, quem perdeu a corrida do INSERT precisa da linha real.
    return (await this.repo.buscarPorUsuario(usuarioId)) ?? gratuita;
  }
}

/** `GET /v1/assinatura` — status da assinatura única da plataforma (doc 07 §5). */
export class ObterAssinaturaUseCase {
  constructor(private readonly resolver: ResolverAssinaturaService) {}

  async executar(usuarioId: string): Promise<AssinaturaView> {
    return paraAssinaturaView(await this.resolver.executar(usuarioId));
  }
}

export interface IniciarUpgradeInput {
  usuarioId: string;
  ciclo: CicloDeCobranca;
  /** País do usuário (ISO-3166-1 alfa-2) — define moeda e preço (doc 07 §9.1). */
  pais: string;
  cupomCodigo?: string | null;
}

export interface UpgradeIniciadoView {
  assinatura: AssinaturaView;
  /** Ausente quando o upgrade virou trial: não há o que cobrar ainda. */
  checkout: CheckoutSolicitado | null;
}

/**
 * `POST /v1/assinatura/upgrade` (API-4, ação de negócio).
 *
 * Nunca concede Premium por conta própria: ou entrega um trial configurado, ou devolve
 * o checkout e deixa a assinatura `PENDENTE_PAGAMENTO` até o webhook confirmar.
 */
export class IniciarUpgradeUseCase {
  constructor(
    private readonly resolver: ResolverAssinaturaService,
    private readonly assinaturas: AssinaturaRepository,
    private readonly catalogo: CatalogoDeCobrancaRepository,
    private readonly cupons: CupomRepository,
    private readonly pagamento: ProcessadorDePagamento,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: IniciarUpgradeInput): Promise<UpgradeIniciadoView> {
    const assinatura = await this.resolver.executar(input.usuarioId);
    const statusAnterior = assinatura.status;

    // Estado do usuário vem antes de configuração: quem já é Premium recebe o conflito
    // real (409), e não um "preço não configurado" (400) que mascararia o motivo.
    // A entidade também protege, mas ali o erro chegaria tarde demais.
    if (assinatura.ehPremiumAtivo()) {
      throw new AssinaturaJaAtivaError();
    }

    const trial = await this.catalogo.buscarPeriodoGratuito(Plano.PREMIUM);
    const preco = await this.catalogo.buscarPrecoRegional(input.pais, Plano.PREMIUM, input.ciclo);
    if (!preco) {
      throw new PrecoNaoConfiguradoError(input.pais);
    }

    if (trial?.estaDisponivel()) {
      assinatura.iniciarTrial({
        ciclo: input.ciclo,
        moeda: preco.moeda,
        terminaEm: trial.calcularTermino(),
      });
      await this.assinaturas.salvar(assinatura);
      await this.publicarMudanca(assinatura, statusAnterior);
      return { assinatura: paraAssinaturaView(assinatura), checkout: null };
    }

    const cupom = await this.resolverCupom(input.cupomCodigo);
    assinatura.iniciarUpgrade({
      ciclo: input.ciclo,
      moeda: preco.moeda,
      cupomId: cupom?.id ?? null,
      precoRegionalId: preco.id,
    });
    await this.assinaturas.salvar(assinatura);
    await this.publicarMudanca(assinatura, statusAnterior);

    const checkout = await this.pagamento.criarCheckout({
      usuarioId: input.usuarioId,
      plano: Plano.PREMIUM,
      ciclo: input.ciclo,
      moeda: preco.moeda,
      valorCentavos: preco.valorCentavos,
      cupomCodigo: cupom?.codigo ?? null,
    });
    return { assinatura: paraAssinaturaView(assinatura), checkout };
  }

  private async resolverCupom(codigo?: string | null) {
    if (!codigo) {
      return null;
    }
    const cupom = await this.cupons.buscarPorCodigo(codigo.trim().toUpperCase());
    if (!cupom || !cupom.estaValido()) {
      throw new CupomInvalidoError();
    }
    return cupom;
  }

  private async publicarMudanca(
    assinatura: AssinaturaPremium,
    statusAnterior: StatusAssinatura,
  ): Promise<void> {
    await this.eventos.publicar(
      new AssinaturaAtualizada(
        assinatura.id,
        assinatura.usuarioId,
        statusAnterior,
        assinatura.status,
        assinatura.plano,
      ),
    );
  }
}

/** `POST /v1/assinatura/cancelar` — cancelamento gentil (doc 07 §9). */
export class CancelarAssinaturaUseCase {
  constructor(
    private readonly resolver: ResolverAssinaturaService,
    private readonly assinaturas: AssinaturaRepository,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(usuarioId: string): Promise<AssinaturaView> {
    const assinatura = await this.resolver.executar(usuarioId);
    const statusAnterior = assinatura.status;

    assinatura.cancelar();
    await this.assinaturas.salvar(assinatura);
    await this.eventos.publicar(
      new AssinaturaAtualizada(
        assinatura.id,
        assinatura.usuarioId,
        statusAnterior,
        assinatura.status,
        assinatura.plano,
      ),
    );
    return paraAssinaturaView(assinatura);
  }
}

/** `POST /v1/assinatura/cupom` — aplica um cupom a uma assinatura Premium existente. */
export class AplicarCupomUseCase {
  constructor(
    private readonly resolver: ResolverAssinaturaService,
    private readonly assinaturas: AssinaturaRepository,
    private readonly cupons: CupomRepository,
  ) {}

  async executar(input: { usuarioId: string; codigo: string }): Promise<AssinaturaView> {
    const cupom = await this.cupons.buscarPorCodigo(input.codigo.trim().toUpperCase());
    if (!cupom || !cupom.estaValido()) {
      throw new CupomInvalidoError();
    }

    const assinatura = await this.resolver.executar(input.usuarioId);
    assinatura.aplicarCupom(cupom.id);
    cupom.registrarUso();

    await this.assinaturas.salvar(assinatura);
    await this.cupons.salvar(cupom);
    return paraAssinaturaView(assinatura);
  }
}
