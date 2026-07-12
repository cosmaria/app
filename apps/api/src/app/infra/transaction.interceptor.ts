import {
  type CallHandler,
  type ExecutionContext,
  Inject,
  Injectable,
  type NestInterceptor,
} from '@nestjs/common';
import { from, type Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { TRANSACTION_RUNNER, type TransactionRunner } from '@cosmaria/core-application';

/** Métodos HTTP que escrevem — só eles abrem transação (GETs seguem em autocommit/leitura). */
const METODOS_MUTANTES = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Interceptor transaction-per-request (doc 04 §9). Envolve cada requisição MUTANTE numa
 * transação do `TransactionRunner`: o write de negócio e o `enfileirar` do outbox (feito no
 * `publicar()`) caem no mesmo commit — atomicidade write↔outbox. Erro no handler ⇒ ROLLBACK e
 * o erro segue para o `DomainExceptionFilter`, como antes.
 *
 * GETs não são envolvidos: evita segurar conexão por leitura e o risco de `Promise.all` de
 * consultas concorrentes no client único da transação. Sem Postgres, o runner é pass-through.
 */
@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(@Inject(TRANSACTION_RUNNER) private readonly runner: TransactionRunner) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const metodo = context.switchToHttp().getRequest<{ method?: string }>().method;
    if (!metodo || !METODOS_MUTANTES.has(metodo)) {
      return next.handle();
    }
    // O handler roda DENTRO da transação (ALS ativo) — os `await` dos repositórios propagam.
    return from(this.runner.transaction(() => firstValueFrom(next.handle())));
  }
}
