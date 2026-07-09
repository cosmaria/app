import { Body, Controller, HttpCode, HttpStatus, Inject, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import {
  PROCESSADOR_DE_PAGAMENTO,
  ProcessarEventoDePagamentoUseCase,
  type ProcessadorDePagamento,
  type ResultadoWebhook,
} from '@cosmaria/core-application';
import { AssinaturaDePayloadInvalidaError } from '@cosmaria/core-domain';

/**
 * `POST /v1/webhooks/pagamento` (doc 09, arquétipo API-7 — Webhook).
 *
 * NÃO usa Bearer: a autenticidade vem da assinatura criptográfica do corpo. Por isso o
 * corpo **bruto** é obrigatório — o Nest só o expõe com `rawBody: true` no bootstrap;
 * reserializar o JSON já parseado mudaria os bytes e invalidaria o HMAC.
 *
 * Responde 200 também para reentrega já processada: sinalizar erro faria o gateway
 * continuar retentando um evento que já surtiu efeito.
 */
@Controller('webhooks')
export class WebhookPagamentoController {
  constructor(
    private readonly processar: ProcessarEventoDePagamentoUseCase,
    @Inject(PROCESSADOR_DE_PAGAMENTO)
    private readonly pagamento: ProcessadorDePagamento,
  ) {}

  @Post('pagamento')
  @HttpCode(HttpStatus.OK)
  receberPagamento(
    @Req() req: RawBodyRequest<Request>,
    @Body() payload: unknown,
  ): Promise<ResultadoWebhook> {
    const corpoBruto = req.rawBody;
    if (!corpoBruto) {
      // Sem corpo bruto não há como verificar a assinatura — recusamos em vez de confiar.
      throw new AssinaturaDePayloadInvalidaError();
    }
    const cabecalho = this.pagamento.nomeDoCabecalhoDeAssinatura();
    const assinaturaRecebida = req.headers[cabecalho];

    return this.processar.executar({
      corpoBruto,
      assinaturaRecebida: typeof assinaturaRecebida === 'string' ? assinaturaRecebida : undefined,
      payload,
    });
  }
}
