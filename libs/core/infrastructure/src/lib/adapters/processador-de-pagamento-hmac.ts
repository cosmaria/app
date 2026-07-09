import { createHmac, timingSafeEqual } from 'node:crypto';
import type {
  CheckoutSolicitado,
  EventoDePagamento,
  ProcessadorDePagamento,
} from '@cosmaria/core-application';
import {
  AssinaturaDePayloadInvalidaError,
  type CicloDeCobranca,
  type Plano,
} from '@cosmaria/core-domain';

/** Cabeçalho onde este adaptador espera a assinatura HMAC do corpo. */
export const CABECALHO_ASSINATURA = 'x-cosmaria-assinatura';

/** Formato mínimo esperado do payload do gateway (doc 09, arquétipo API-7). */
interface PayloadDeWebhook {
  id?: unknown;
  tipo?: unknown;
  usuarioId?: unknown;
  vigenteAte?: unknown;
  motivo?: unknown;
}

/**
 * Adaptador do `ProcessadorDePagamento` (doc 13 §16.1) que **não depende de nenhum
 * gateway específico**: valida o webhook por HMAC-SHA256 sobre o corpo bruto, com um
 * segredo compartilhado, e lê um payload em formato canônico.
 *
 * O gateway concreto (Stripe, Mercado Pago, Pagar.me…) é decisão de negócio ainda
 * aberta no doc 13 ("a definir na implementação") — taxas, suporte a PIX e mercado-alvo
 * pesam mais que arquitetura. Quando for escolhido, o novo adaptador implementa esta
 * mesma porta e **nenhum caso de uso muda** (Provider Agnostic, doc 00 §16.6g).
 *
 * `criarCheckout` devolve uma URL de placeholder: até existir gateway, não há sessão de
 * cobrança real — e é justamente por isso que o upgrade deixa a assinatura
 * `PENDENTE_PAGAMENTO` em vez de conceder Premium.
 */
export class ProcessadorDePagamentoHmac implements ProcessadorDePagamento {
  constructor(
    private readonly segredoWebhook: string,
    private readonly urlBaseCheckout = 'https://checkout.cosmaria.app',
  ) {}

  criarCheckout(entrada: {
    usuarioId: string;
    plano: Plano;
    ciclo: CicloDeCobranca;
    moeda: string;
    valorCentavos: number;
    cupomCodigo?: string | null;
  }): Promise<CheckoutSolicitado> {
    const referenciaExterna = `chk_${entrada.usuarioId}_${Date.now()}`;
    const parametros = new URLSearchParams({
      ref: referenciaExterna,
      plano: entrada.plano,
      ciclo: entrada.ciclo,
      moeda: entrada.moeda,
      valor: String(entrada.valorCentavos),
    });
    if (entrada.cupomCodigo) {
      parametros.set('cupom', entrada.cupomCodigo);
    }
    return Promise.resolve({
      urlCheckout: `${this.urlBaseCheckout}?${parametros.toString()}`,
      referenciaExterna,
    });
  }

  nomeDoCabecalhoDeAssinatura(): string {
    return CABECALHO_ASSINATURA;
  }

  /**
   * Compara em tempo constante — `===` sobre HMAC vaza, por diferença de tempo, quantos
   * bytes iniciais o atacante acertou, permitindo forjar a assinatura byte a byte.
   */
  verificarAssinatura(corpoBruto: Buffer, assinaturaRecebida: string | undefined): boolean {
    if (!assinaturaRecebida || !this.segredoWebhook) {
      return false;
    }
    const esperada = createHmac('sha256', this.segredoWebhook).update(corpoBruto).digest('hex');
    const recebida = Buffer.from(assinaturaRecebida, 'utf8');
    const calculada = Buffer.from(esperada, 'utf8');
    if (recebida.length !== calculada.length) {
      return false;
    }
    return timingSafeEqual(recebida, calculada);
  }

  interpretarEvento(payload: unknown): EventoDePagamento {
    const p = (payload ?? {}) as PayloadDeWebhook;
    const id = typeof p.id === 'string' ? p.id : null;
    const usuarioId = typeof p.usuarioId === 'string' ? p.usuarioId : null;
    const tipo = p.tipo === 'PAGAMENTO_RECEBIDO' || p.tipo === 'PAGAMENTO_FALHOU' ? p.tipo : null;

    // Payload assinado mas malformado: o segredo pode ter vazado, ou o contrato mudou.
    // Recusar é mais seguro do que adivinhar a quem creditar um pagamento.
    if (!id || !usuarioId || !tipo) {
      throw new AssinaturaDePayloadInvalidaError();
    }

    return {
      eventoExternoId: id,
      tipo,
      usuarioId,
      vigenteAte: typeof p.vigenteAte === 'string' ? new Date(p.vigenteAte) : null,
      motivo: typeof p.motivo === 'string' ? p.motivo : null,
    };
  }
}

/** Assina um corpo com o mesmo algoritmo — usado por testes e por ferramentas locais. */
export function assinarPayloadWebhook(corpoBruto: Buffer, segredo: string): string {
  return createHmac('sha256', segredo).update(corpoBruto).digest('hex');
}
