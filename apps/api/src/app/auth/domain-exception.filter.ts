import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import {
  AcessoNegadoError,
  AssinaturaDePayloadInvalidaError,
  AssinaturaJaAtivaError,
  AssinaturaNaoPremiumError,
  ContaInativaError,
  CredenciaisInvalidasError,
  CupomInvalidoError,
  DomainError,
  EmailInvalidoError,
  EmailJaCadastradoError,
  LimiteDePlanoAtingidoError,
  MidiaAcimaDoLimiteError,
  MidiaNaoEncontradaError,
  PerfilNaoEncontradoError,
  PrecoNaoConfiguradoError,
  TipoDeMidiaNaoSuportadoError,
  SessaoInvalidaError,
  VinculoDePerfisDesabilitadoError,
  VinculoDePerfisInvalidoError,
} from '@cosmaria/core-domain';
import {
  AmbienteComCiclosError,
  AmbienteNaoEncontradoError,
  CicloEncerradoError,
  CicloNaoEncontradoError,
  ColheitaNaoEncontradaError,
  ColheitaSemPlantasError,
  CuraJaRegistradaError,
  CuraNaoEncontradaError,
  EventoDeCultivoNaoEncontradoError,
  GeneticaEmUsoError,
  GeneticaNaoEncontradaError,
  LoteJaGeradoError,
  LoteNaoEncontradoError,
  PlantaNaoEncontradaError,
  RegistroSemMedicaoError,
  SecagemJaRegistradaError,
  SecagemNaoEncontradaError,
  TransicaoDeFaseInvalidaError,
} from '@cosmaria/grow-domain';

/**
 * Traduz erros de domínio para o formato de erro único da API (doc 09 §5):
 * { code, message } estáveis, sem vazar detalhe interno. Correlation ID entra
 * em sprint de observabilidade futura (doc 09 princípio 3).
 *
 * É um filtro **global do composition root**, e por isso conhece os erros de todos os
 * módulos. Mora sob `auth/` por razão histórica (foi a primeira épica); nada aqui
 * pertence à autenticação.
 */
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('DomainException');

  catch(erro: DomainError, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = this.mapearStatus(erro);

    if (status >= 500) {
      this.logger.error(`${erro.code}: ${erro.message}`);
    }

    response.status(status).json({ code: erro.code, message: erro.message });
  }

  private mapearStatus(erro: DomainError): number {
    if (erro instanceof CredenciaisInvalidasError) return HttpStatus.UNAUTHORIZED;
    if (erro instanceof SessaoInvalidaError) return HttpStatus.UNAUTHORIZED;
    if (erro instanceof ContaInativaError) return HttpStatus.FORBIDDEN;
    if (erro instanceof AcessoNegadoError) return HttpStatus.FORBIDDEN;
    if (erro instanceof EmailJaCadastradoError) return HttpStatus.CONFLICT;
    if (erro instanceof EmailInvalidoError) return HttpStatus.BAD_REQUEST;
    if (erro instanceof PerfilNaoEncontradoError) return HttpStatus.NOT_FOUND;
    if (erro instanceof VinculoDePerfisInvalidoError) return HttpStatus.BAD_REQUEST;
    // Funcionalidade de Versão 2 desligada por flag (doc 06): o recurso ainda não
    // existe para o cliente — 404, não 403, que sugeriria falta de permissão.
    if (erro instanceof VinculoDePerfisDesabilitadoError) return HttpStatus.NOT_FOUND;
    // Webhook com assinatura inválida: 401, e nenhuma pista sobre o que falhou (doc 09 §7).
    if (erro instanceof AssinaturaDePayloadInvalidaError) return HttpStatus.UNAUTHORIZED;
    if (erro instanceof AssinaturaJaAtivaError) return HttpStatus.CONFLICT;
    if (erro instanceof AssinaturaNaoPremiumError) return HttpStatus.CONFLICT;
    if (erro instanceof CupomInvalidoError) return HttpStatus.BAD_REQUEST;
    if (erro instanceof PrecoNaoConfiguradoError) return HttpStatus.BAD_REQUEST;
    // 402: o recurso existe, o usuário só precisa do plano pago (gatilho do paywall).
    if (erro instanceof LimiteDePlanoAtingidoError) return HttpStatus.PAYMENT_REQUIRED;
    if (erro instanceof MidiaAcimaDoLimiteError) return HttpStatus.PAYMENT_REQUIRED;
    if (erro instanceof MidiaNaoEncontradaError) return HttpStatus.NOT_FOUND;
    // 415: o servidor entendeu a requisição, mas não aceita este tipo de arquivo.
    if (erro instanceof TipoDeMidiaNaoSuportadoError) return HttpStatus.UNSUPPORTED_MEDIA_TYPE;

    // --- Grow (doc 02) ---
    // Recurso de outro usuário responde igual a inexistente: não confirmamos existência.
    if (erro instanceof GeneticaNaoEncontradaError) return HttpStatus.NOT_FOUND;
    if (erro instanceof AmbienteNaoEncontradoError) return HttpStatus.NOT_FOUND;
    if (erro instanceof CicloNaoEncontradoError) return HttpStatus.NOT_FOUND;
    if (erro instanceof PlantaNaoEncontradaError) return HttpStatus.NOT_FOUND;
    if (erro instanceof EventoDeCultivoNaoEncontradoError) return HttpStatus.NOT_FOUND;
    if (erro instanceof ColheitaNaoEncontradaError) return HttpStatus.NOT_FOUND;
    if (erro instanceof SecagemNaoEncontradaError) return HttpStatus.NOT_FOUND;
    if (erro instanceof CuraNaoEncontradaError) return HttpStatus.NOT_FOUND;
    if (erro instanceof LoteNaoEncontradoError) return HttpStatus.NOT_FOUND;
    // 409: o recurso existe, mas seu estado atual impede a operação.
    if (erro instanceof CicloEncerradoError) return HttpStatus.CONFLICT;
    if (erro instanceof AmbienteComCiclosError) return HttpStatus.CONFLICT;
    if (erro instanceof GeneticaEmUsoError) return HttpStatus.CONFLICT;
    // Cada etapa pós-colheita é 1—1 com a anterior: repetir é conflito de estado.
    if (erro instanceof SecagemJaRegistradaError) return HttpStatus.CONFLICT;
    if (erro instanceof CuraJaRegistradaError) return HttpStatus.CONFLICT;
    if (erro instanceof LoteJaGeradoError) return HttpStatus.CONFLICT;
    if (erro instanceof TransicaoDeFaseInvalidaError) return HttpStatus.BAD_REQUEST;
    if (erro instanceof RegistroSemMedicaoError) return HttpStatus.BAD_REQUEST;
    if (erro instanceof ColheitaSemPlantasError) return HttpStatus.BAD_REQUEST;

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
