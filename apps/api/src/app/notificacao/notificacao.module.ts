import { Inject, Module, type OnModuleInit, type Provider } from '@nestjs/common';
import type { Pool } from 'pg';
import {
  AtualizarPreferenciaDeNotificacaoUseCase,
  CACHE_PORT,
  DESPACHANTE_DE_NOTIFICACAO,
  EnviarNotificacaoService,
  ID_GENERATOR,
  ListarNotificacoesUseCase,
  MarcarNotificacaoLidaUseCase,
  NOTIFICACAO_REPOSITORY,
  NotificarSobreEventosService,
  ObterPreferenciaDeNotificacaoUseCase,
  PREFERENCIA_DE_NOTIFICACAO_REPOSITORY,
  REGISTRO_DE_IDEMPOTENCIA_REPOSITORY,
  ResolverPreferenciaDeNotificacaoService,
  type CachePort,
  type DespachanteDeNotificacao,
  type IdGenerator,
  type NotificacaoRepository,
  type PreferenciaDeNotificacaoRepository,
  type RegistroDeIdempotenciaRepository,
} from '@cosmaria/core-application';
import {
  CacheRegistroDeIdempotenciaRepository,
  CryptoIdGenerator,
  DespachanteDeRegistro,
  DespachanteEmMemoria,
  InMemoryNotificacaoRepository,
  InMemoryPreferenciaDeNotificacaoRepository,
  InProcessEventPublisher,
  PostgresNotificacaoRepository,
  PostgresPreferenciaDeNotificacaoRepository,
} from '@cosmaria/core-infrastructure';
import { PG_POOL } from '../infra/infra.tokens';
import { usarDespachanteEmMemoria } from '../infra/infra.config';
import { AuthModule } from '../auth/auth.module';
import { NotificacaoController, PreferenciaNotificacaoController } from './notificacao.controller';

/**
 * Composition root do Serviço de Notificações (doc 04 §15).
 *
 * No boot, assina no barramento global os eventos que viram aviso — é o **segundo**
 * consumidor do EDA, depois da auditoria. Nenhum módulo despacha notificação por conta
 * própria: todos publicam eventos e este serviço decide.
 *
 * O anti-spam reusa o RegistroDeIdempotencia (Redis `SET NX`) do Billing: "esta chave já
 * foi vista na janela?" é exatamente a mesma pergunta, com outro nome.
 */
const providers: Provider[] = [
  { provide: ID_GENERATOR, useClass: CryptoIdGenerator },
  {
    // Sem provedor de push/e-mail escolhido, produção usa o despachante de registro,
    // que não finge sucesso de envio. Dev/teste usam o de memória para exercitar o caminho.
    provide: DESPACHANTE_DE_NOTIFICACAO,
    useFactory: (): DespachanteDeNotificacao =>
      usarDespachanteEmMemoria() ? new DespachanteEmMemoria() : new DespachanteDeRegistro(),
  },
  {
    provide: REGISTRO_DE_IDEMPOTENCIA_REPOSITORY,
    useFactory: (cache: CachePort): RegistroDeIdempotenciaRepository =>
      new CacheRegistroDeIdempotenciaRepository(cache),
    inject: [CACHE_PORT],
  },
  {
    provide: PREFERENCIA_DE_NOTIFICACAO_REPOSITORY,
    useFactory: (pool: Pool | null): PreferenciaDeNotificacaoRepository =>
      pool
        ? new PostgresPreferenciaDeNotificacaoRepository(pool)
        : new InMemoryPreferenciaDeNotificacaoRepository(),
    inject: [PG_POOL],
  },
  {
    provide: NOTIFICACAO_REPOSITORY,
    useFactory: (pool: Pool | null): NotificacaoRepository =>
      pool ? new PostgresNotificacaoRepository(pool) : new InMemoryNotificacaoRepository(),
    inject: [PG_POOL],
  },
  {
    provide: ResolverPreferenciaDeNotificacaoService,
    useFactory: (repo: PreferenciaDeNotificacaoRepository, idGen: IdGenerator) =>
      new ResolverPreferenciaDeNotificacaoService(repo, idGen),
    inject: [PREFERENCIA_DE_NOTIFICACAO_REPOSITORY, ID_GENERATOR],
  },
  {
    provide: EnviarNotificacaoService,
    useFactory: (
      preferencias: ResolverPreferenciaDeNotificacaoService,
      notificacoes: NotificacaoRepository,
      despachante: DespachanteDeNotificacao,
      antiSpam: RegistroDeIdempotenciaRepository,
      idGen: IdGenerator,
    ) => new EnviarNotificacaoService(preferencias, notificacoes, despachante, antiSpam, idGen),
    inject: [
      ResolverPreferenciaDeNotificacaoService,
      NOTIFICACAO_REPOSITORY,
      DESPACHANTE_DE_NOTIFICACAO,
      REGISTRO_DE_IDEMPOTENCIA_REPOSITORY,
      ID_GENERATOR,
    ],
  },
  {
    provide: ObterPreferenciaDeNotificacaoUseCase,
    useFactory: (resolver: ResolverPreferenciaDeNotificacaoService) =>
      new ObterPreferenciaDeNotificacaoUseCase(resolver),
    inject: [ResolverPreferenciaDeNotificacaoService],
  },
  {
    provide: AtualizarPreferenciaDeNotificacaoUseCase,
    useFactory: (
      resolver: ResolverPreferenciaDeNotificacaoService,
      repo: PreferenciaDeNotificacaoRepository,
    ) => new AtualizarPreferenciaDeNotificacaoUseCase(resolver, repo),
    inject: [ResolverPreferenciaDeNotificacaoService, PREFERENCIA_DE_NOTIFICACAO_REPOSITORY],
  },
  {
    provide: ListarNotificacoesUseCase,
    useFactory: (repo: NotificacaoRepository) => new ListarNotificacoesUseCase(repo),
    inject: [NOTIFICACAO_REPOSITORY],
  },
  {
    provide: MarcarNotificacaoLidaUseCase,
    useFactory: (repo: NotificacaoRepository) => new MarcarNotificacaoLidaUseCase(repo),
    inject: [NOTIFICACAO_REPOSITORY],
  },
  {
    provide: NotificarSobreEventosService,
    useFactory: (enviar: EnviarNotificacaoService) => new NotificarSobreEventosService(enviar),
    inject: [EnviarNotificacaoService],
  },
];

@Module({
  imports: [AuthModule],
  controllers: [PreferenciaNotificacaoController, NotificacaoController],
  providers,
  exports: [EnviarNotificacaoService],
})
export class NotificacaoModule implements OnModuleInit {
  constructor(
    @Inject(InProcessEventPublisher) private readonly bus: InProcessEventPublisher,
    private readonly notificador: NotificarSobreEventosService,
  ) {}

  onModuleInit(): void {
    for (const nome of NotificarSobreEventosService.EVENTOS_NOTIFICAVEIS) {
      this.bus.assinar(nome, (evento) => this.notificador.notificar(evento), 'core.notificacao');
    }
  }
}
