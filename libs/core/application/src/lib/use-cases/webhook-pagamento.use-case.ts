import {
  AssinaturaAtualizada,
  AssinaturaDePayloadInvalidaError,
  PagamentoFalhou,
  PagamentoRecebido,
} from '@cosmaria/core-domain';
import { EventPublisher } from '../ports/event-publisher.port';
import { AssinaturaRepository } from '../ports/billing.repositories';
import {
  RegistroDeIdempotenciaRepository,
  TTL_IDEMPOTENCIA_SEGUNDOS,
} from '../ports/idempotencia.port';
import { ProcessadorDePagamento } from '../ports/processador-de-pagamento.port';
import { ResolverAssinaturaService } from './assinatura.use-cases';

export interface ResultadoWebhook {
  /** `false` quando o evento já havia sido processado (reentrega do gateway). */
  processado: boolean;
}

/** Período padrão de um ciclo quando o provedor não informa `vigenteAte`. */
const DIAS_CICLO_PADRAO = 30;

/**
 * `POST /v1/webhooks/pagamento` (doc 09, arquétipo API-7).
 *
 * É o ÚNICO caminho que concede Premium: nem o upgrade nem o app cliente conseguem
 * ativar uma assinatura sem o gateway confirmar o dinheiro.
 *
 * Duas defesas obrigatórias, nesta ordem:
 *  1. **Assinatura do payload** — o endpoint não usa Bearer, então a autenticidade vem
 *     da verificação HMAC sobre o corpo bruto. Payload não assinado é rejeitado antes
 *     de qualquer efeito colateral.
 *  2. **Idempotência** — gateways reentregam o mesmo evento rotineiramente. A chave é o
 *     id do evento no provedor, registrado atomicamente; a reentrega vira no-op em vez
 *     de somar 30 dias de assinatura duas vezes.
 */
export class ProcessarEventoDePagamentoUseCase {
  constructor(
    private readonly pagamento: ProcessadorDePagamento,
    private readonly idempotencia: RegistroDeIdempotenciaRepository,
    private readonly resolver: ResolverAssinaturaService,
    private readonly assinaturas: AssinaturaRepository,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(entrada: {
    corpoBruto: Buffer;
    assinaturaRecebida: string | undefined;
    payload: unknown;
  }): Promise<ResultadoWebhook> {
    if (!this.pagamento.verificarAssinatura(entrada.corpoBruto, entrada.assinaturaRecebida)) {
      throw new AssinaturaDePayloadInvalidaError();
    }

    const evento = this.pagamento.interpretarEvento(entrada.payload);

    const novo = await this.idempotencia.registrarSeNova(
      `pagamento:${evento.eventoExternoId}`,
      TTL_IDEMPOTENCIA_SEGUNDOS,
    );
    if (!novo) {
      return { processado: false };
    }

    const assinatura = await this.resolver.executar(evento.usuarioId);
    const statusAnterior = assinatura.status;

    if (evento.tipo === 'PAGAMENTO_RECEBIDO') {
      assinatura.confirmarPagamento(evento.vigenteAte ?? this.fimDoCicloPadrao());
      await this.assinaturas.salvar(assinatura);
      await this.eventos.publicar(new PagamentoRecebido(evento.usuarioId, evento.eventoExternoId));
    } else {
      assinatura.registrarFalhaDePagamento();
      await this.assinaturas.salvar(assinatura);
      await this.eventos.publicar(
        new PagamentoFalhou(evento.usuarioId, evento.eventoExternoId, evento.motivo),
      );
    }

    await this.eventos.publicar(
      new AssinaturaAtualizada(
        assinatura.id,
        assinatura.usuarioId,
        statusAnterior,
        assinatura.status,
        assinatura.plano,
      ),
    );
    return { processado: true };
  }

  private fimDoCicloPadrao(): Date {
    return new Date(Date.now() + DIAS_CICLO_PADRAO * 24 * 60 * 60 * 1000);
  }
}
