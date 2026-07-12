import { CategoriaDeNotificacao, type DomainEvent, StatusAssinatura } from '@cosmaria/core-domain';
import { EnviarNotificacaoService, type EnviarNotificacaoInput } from './notificacao.use-cases';

/**
 * Contratos de payload dos eventos notificáveis (Catálogo de Domínio). Lidos por NOME, não
 * por `instanceof`: o barramento durável (outbox) entrega o evento como objeto de contrato,
 * sem a classe original. Fronteira anticorrupção igual à da IA (doc 04 §24, §16.1).
 */
interface EvAssinatura extends DomainEvent {
  usuarioId: string;
  statusNovo: StatusAssinatura;
}
interface EvPagamentoFalhou extends DomainEvent {
  usuarioId: string;
}
interface EvLimitePremium extends DomainEvent {
  usuarioId: string;
  chave: string;
}

/**
 * Segundo consumidor do barramento de eventos (o primeiro é a auditoria).
 *
 * Traduz eventos de domínio em notificações (doc 04 §15): nenhum módulo notifica
 * diretamente — todos publicam eventos, e o Core decide o que vira aviso.
 *
 * **Falha aqui nunca derruba a operação que originou o evento.** Diferente da auditoria,
 * cuja gravação é requisito legal e deve falhar junto, um push indisponível não pode
 * impedir o usuário de cancelar a assinatura. Por isso o `catch` no `notificar`.
 */
export class NotificarSobreEventosService {
  /** Nomes de evento que viram notificação — o composition root assina a partir daqui. */
  static readonly EVENTOS_NOTIFICAVEIS = [
    'AssinaturaAtualizada',
    'PagamentoFalhou',
    'LimitePremiumAtingido',
  ];

  /**
   * Transições de assinatura que merecem aviso. `PENDENTE_PAGAMENTO` não avisa (o
   * usuário acabou de clicar em assinar) e `INADIMPLENTE` não avisa aqui, porque
   * `PagamentoFalhou` já cobre o caso — notificar nos dois duplicaria a mensagem.
   */
  private static readonly STATUS_NOTIFICAVEIS: readonly StatusAssinatura[] = [
    StatusAssinatura.ATIVA,
    StatusAssinatura.TRIAL,
    StatusAssinatura.CANCELADA,
  ];

  constructor(private readonly enviar: EnviarNotificacaoService) {}

  async notificar(evento: DomainEvent): Promise<void> {
    const entrada = this.mapear(evento);
    if (!entrada) {
      return;
    }
    try {
      await this.enviar.executar(entrada);
    } catch {
      // Notificação é efeito colateral: nunca invalida o fato de domínio já ocorrido.
    }
  }

  private mapear(evento: DomainEvent): EnviarNotificacaoInput | null {
    switch (evento.nome) {
      case 'AssinaturaAtualizada':
        return this.deAssinatura(evento as EvAssinatura);
      case 'PagamentoFalhou': {
        const e = evento as EvPagamentoFalhou;
        return {
          usuarioId: e.usuarioId,
          categoria: CategoriaDeNotificacao.BILLING,
          titulo: 'Não conseguimos processar seu pagamento',
          corpo: 'Atualize sua forma de pagamento para manter o Premium ativo.',
          chaveDeAgrupamento: 'pagamento:falhou',
        };
      }
      case 'LimitePremiumAtingido': {
        const e = evento as EvLimitePremium;
        return {
          usuarioId: e.usuarioId,
          categoria: CategoriaDeNotificacao.BILLING,
          // Tom informativo, nunca de pressão (doc 07 §4 — sem paywall agressivo).
          titulo: 'Você atingiu um limite do plano gratuito',
          corpo: `Seus dados continuam completos e acessíveis. O Premium amplia o limite de "${e.chave}".`,
          chaveDeAgrupamento: `limite:${e.chave}`,
        };
      }
      default:
        return null;
    }
  }

  private deAssinatura(evento: EvAssinatura): EnviarNotificacaoInput | null {
    if (!NotificarSobreEventosService.STATUS_NOTIFICAVEIS.includes(evento.statusNovo)) {
      return null;
    }

    const textos: Record<string, { titulo: string; corpo: string }> = {
      [StatusAssinatura.ATIVA]: {
        titulo: 'Seu Premium está ativo',
        corpo: 'Todos os recursos avançados já estão liberados no Grow e no Med.',
      },
      [StatusAssinatura.TRIAL]: {
        titulo: 'Seu período gratuito começou',
        corpo: 'Aproveite os recursos Premium durante o período de teste.',
      },
      [StatusAssinatura.CANCELADA]: {
        titulo: 'Assinatura cancelada',
        corpo: 'Seu Premium continua válido até o fim do período já pago. Nenhum dado é perdido.',
      },
    };

    const texto = textos[evento.statusNovo];
    return {
      usuarioId: evento.usuarioId,
      categoria: CategoriaDeNotificacao.BILLING,
      titulo: texto.titulo,
      corpo: texto.corpo,
      chaveDeAgrupamento: `assinatura:${evento.statusNovo}`,
    };
  }
}
