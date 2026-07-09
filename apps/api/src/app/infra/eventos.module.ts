import { Global, Module } from '@nestjs/common';
import { EVENT_PUBLISHER } from '@cosmaria/core-application';
import { InProcessEventPublisher } from '@cosmaria/core-infrastructure';

/**
 * Barramento de eventos GLOBAL (doc 04 §9). Uma ÚNICA instância de
 * InProcessEventPublisher é compartilhada por toda a app — quem publica
 * (Privacidade, Consentimento…) e quem assina (Auditoria) falam pelo mesmo objeto.
 * EVENT_PUBLISHER (porta) e a classe concreta (para `assinar`) apontam para o mesmo singleton.
 */
@Global()
@Module({
  providers: [
    InProcessEventPublisher,
    { provide: EVENT_PUBLISHER, useExisting: InProcessEventPublisher },
  ],
  exports: [EVENT_PUBLISHER, InProcessEventPublisher],
})
export class EventosModule {}
