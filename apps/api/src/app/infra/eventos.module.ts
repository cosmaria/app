import {
  Global,
  Inject,
  Logger,
  Module,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
  type Provider,
} from '@nestjs/common';
import type { Pool } from 'pg';
import {
  EVENT_PUBLISHER,
  OUTBOX_REPOSITORY,
  type IdGenerator,
  type OutboxRepository,
} from '@cosmaria/core-application';
import {
  CryptoIdGenerator,
  InProcessEventPublisher,
  OutboxDispatcher,
  OutboxEventPublisher,
  PostgresOutboxRepository,
  type RegistradorDeOutbox,
} from '@cosmaria/core-infrastructure';
import { PG_POOL } from './infra.tokens';
import { outboxIntervaloMs, outboxMaxTentativas } from './infra.config';

/**
 * Barramento de eventos GLOBAL (doc 04 §9).
 *
 * Uma ÚNICA instância de `InProcessEventPublisher` é o **registro de assinantes** — quem
 * assina (IA, Auditoria, Comunidade, Notificações) fala com ela em `onModuleInit`.
 *
 * O **transporte** por trás de `EVENT_PUBLISHER` depende do ambiente:
 *  - **com Postgres** → `OutboxEventPublisher`: `publicar` só persiste no `core.outbox` e
 *    devolve; o `OutboxDispatcher` entrega de forma assíncrona, com retry/backoff e dead-letter.
 *  - **sem Postgres** (dev/teste) → o próprio `InProcessEventPublisher`: entrega síncrona em
 *    processo, isolada por assinante (comportamento do MVP).
 *
 * Trocar o transporte não toca em nenhum caso de uso que publica (doc 13 §16.1).
 */
const ID_GEN_OUTBOX = Symbol('IdGeneratorOutbox');

const providers: Provider[] = [
  InProcessEventPublisher,
  { provide: ID_GEN_OUTBOX, useClass: CryptoIdGenerator },
  {
    provide: OUTBOX_REPOSITORY,
    useFactory: (pool: Pool | null): OutboxRepository | null =>
      pool ? new PostgresOutboxRepository(pool) : null,
    inject: [PG_POOL],
  },
  {
    provide: EVENT_PUBLISHER,
    useFactory: (
      registro: InProcessEventPublisher,
      outbox: OutboxRepository | null,
      idGen: IdGenerator,
    ) => (outbox ? new OutboxEventPublisher(outbox, registro, idGen) : registro),
    inject: [InProcessEventPublisher, OUTBOX_REPOSITORY, ID_GEN_OUTBOX],
  },
  {
    provide: OutboxDispatcher,
    useFactory: (
      outbox: OutboxRepository | null,
      registro: InProcessEventPublisher,
    ): OutboxDispatcher | null => {
      if (!outbox) return null;
      const log = new Logger('OutboxDispatcher');
      const registrador: RegistradorDeOutbox = {
        info: (m) => log.log(m),
        erro: (m) => log.error(m),
      };
      return new OutboxDispatcher(
        outbox,
        registro,
        {
          intervaloMs: outboxIntervaloMs(),
          lote: 50,
          maxTentativas: outboxMaxTentativas(),
          backoffBaseMs: 1000,
          backoffTetoMs: 5 * 60_000,
        },
        registrador,
      );
    },
    inject: [OUTBOX_REPOSITORY, InProcessEventPublisher],
  },
];

@Global()
@Module({
  providers,
  exports: [EVENT_PUBLISHER, InProcessEventPublisher],
})
export class EventosModule implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(@Inject(OutboxDispatcher) private readonly dispatcher: OutboxDispatcher | null) {}

  onApplicationBootstrap(): void {
    // Só há despachante quando o transporte é o outbox (Postgres). Arranca em
    // onApplicationBootstrap — DEPOIS de todos os onModuleInit dos consumidores, garantindo
    // que todos os assinantes já estão registrados antes de a entrega começar.
    this.dispatcher?.iniciar();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.dispatcher?.parar();
  }
}
