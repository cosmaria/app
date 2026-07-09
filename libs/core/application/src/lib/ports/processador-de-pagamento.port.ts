import type { CicloDeCobranca, Plano } from '@cosmaria/core-domain';

/** O que o gateway nos diz que aconteceu, traduzido para a linguagem do domínio. */
export type TipoDeEventoDePagamento = 'PAGAMENTO_RECEBIDO' | 'PAGAMENTO_FALHOU';

export interface EventoDePagamento {
  /** Id do evento no provedor — chave natural de idempotência (doc 09 §9). */
  eventoExternoId: string;
  tipo: TipoDeEventoDePagamento;
  usuarioId: string;
  /** Fim do período pago, quando o provedor informa (só em PAGAMENTO_RECEBIDO). */
  vigenteAte: Date | null;
  /** Código opaco do provedor. NUNCA dado de cartão. */
  motivo: string | null;
}

export interface CheckoutSolicitado {
  /** URL para onde o app redireciona o usuário. */
  urlCheckout: string;
  /** Referência do provedor, guardada para conciliação. */
  referenciaExterna: string;
}

/**
 * Porta `ProcessadorDePagamento` (nome definido no doc 13 §16.1).
 *
 * O gateway concreto é **decisão de negócio ainda em aberto** (doc 13: "a definir na
 * implementação") — taxas, suporte a PIX e mercado-alvo pesam mais que arquitetura.
 * Nada aqui depende dessa escolha: o adaptador concreto vive na Infraestrutura e é
 * trocável sem tocar em nenhum caso de uso (princípio Provider Agnostic, doc 00 §16.6g).
 */
export interface ProcessadorDePagamento {
  /** Cria a sessão de cobrança. Não concede Premium — quem concede é o webhook. */
  criarCheckout(entrada: {
    usuarioId: string;
    plano: Plano;
    ciclo: CicloDeCobranca;
    moeda: string;
    valorCentavos: number;
    cupomCodigo?: string | null;
  }): Promise<CheckoutSolicitado>;

  /**
   * Cabeçalho HTTP (minúsculo) onde o provedor envia a assinatura do payload.
   * Mora aqui, e não no controller, porque o nome é específico do gateway (ex.:
   * `stripe-signature`) — trocar de provedor não deve tocar na camada HTTP.
   */
  nomeDoCabecalhoDeAssinatura(): string;

  /**
   * Verifica a assinatura criptográfica do payload bruto (doc 09 §7, arquétipo API-7).
   * Recebe o corpo **cru**, não o JSON já parseado: reserializar altera bytes e
   * invalidaria a assinatura.
   */
  verificarAssinatura(corpoBruto: Buffer, assinaturaRecebida: string | undefined): boolean;

  /** Traduz o payload do provedor para o evento de domínio. */
  interpretarEvento(payload: unknown): EventoDePagamento;
}

export const PROCESSADOR_DE_PAGAMENTO = Symbol('ProcessadorDePagamento');
