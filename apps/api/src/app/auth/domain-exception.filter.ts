import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';
import {
  AcessoNegadoError,
  ContaInativaError,
  CredenciaisInvalidasError,
  DomainError,
  EmailInvalidoError,
  EmailJaCadastradoError,
  PerfilNaoEncontradoError,
  SessaoInvalidaError,
  VinculoDePerfisDesabilitadoError,
  VinculoDePerfisInvalidoError,
} from '@cosmaria/core-domain';

/**
 * Traduz erros de domínio para o formato de erro único da API (doc 09 §5):
 * { code, message } estáveis, sem vazar detalhe interno. Correlation ID entra
 * em sprint de observabilidade futura (doc 09 princípio 3).
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
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
