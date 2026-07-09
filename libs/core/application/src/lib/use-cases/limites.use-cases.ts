import { LimitePremiumAtingido, type Plano } from '@cosmaria/core-domain';
import { EventPublisher } from '../ports/event-publisher.port';
import { LimiteDePlanoRepository } from '../ports/billing.repositories';
import { ResolverAssinaturaService } from './assinatura.use-cases';

export interface ResultadoDeLimite {
  chave: string;
  /** `null` = ilimitado. */
  limite: number | null;
  permitido: boolean;
  planoEfetivo: Plano;
}

export interface LimiteVigenteView {
  chave: string;
  limite: number | null;
}

/**
 * `GET /v1/conta/limites` — limites vigentes do plano efetivo do usuário.
 * Unifica o que aparecia duplicado como `/usuario/limites-premium` nos docs 02/03.
 */
export class ConsultarLimitesUseCase {
  constructor(
    private readonly resolver: ResolverAssinaturaService,
    private readonly limites: LimiteDePlanoRepository,
  ) {}

  async executar(usuarioId: string): Promise<{ plano: Plano; limites: LimiteVigenteView[] }> {
    const assinatura = await this.resolver.executar(usuarioId);
    const plano = assinatura.planoEfetivo();
    const vigentes = await this.limites.listarPorPlano(plano);
    return {
      plano,
      limites: vigentes.map((l) => ({ chave: l.chave, limite: l.valor })),
    };
  }
}

/**
 * Gate de capacidade consumido por Grow/Med via PREMIUM_PUBLIC_API (doc 07 §9).
 *
 * Responde "cabe mais um?" — nunca "você pode ler isso?". Limite de plano rege apenas
 * **capacidade simultânea futura**; histórico já registrado jamais é limitado ou
 * ocultado (doc 07 §4/§9, princípio ético). Nenhum módulo reimplementa esta regra.
 *
 * Publica `LimitePremiumAtingido` quando barra — é o gatilho do paywall e da
 * notificação (evento ÚNICO do Core, nunca duplicado por app — doc 04).
 */
export class VerificarLimiteUseCase {
  constructor(
    private readonly resolver: ResolverAssinaturaService,
    private readonly limites: LimiteDePlanoRepository,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: {
    usuarioId: string;
    chave: string;
    usoAtual: number;
  }): Promise<ResultadoDeLimite> {
    const assinatura = await this.resolver.executar(input.usuarioId);
    const plano = assinatura.planoEfetivo();
    const limite = await this.limites.buscar(plano, input.chave);

    // Limite não configurado para este plano = ilimitado (nunca bloqueia por omissão).
    if (!limite || limite.ehIlimitado()) {
      return { chave: input.chave, limite: null, permitido: true, planoEfetivo: plano };
    }

    const permitido = limite.permiteMaisUm(input.usoAtual);
    if (!permitido) {
      await this.eventos.publicar(
        new LimitePremiumAtingido(input.usuarioId, input.chave, limite.valor as number),
      );
    }
    return { chave: input.chave, limite: limite.valor, permitido, planoEfetivo: plano };
  }
}
