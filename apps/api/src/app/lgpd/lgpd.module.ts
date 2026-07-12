import { Inject, Module, type OnModuleInit, type Provider } from '@nestjs/common';
import type { Pool } from 'pg';
import {
  CONSENTIMENTO_REPOSITORY,
  ConsultarExportacaoUseCase,
  ConsultarTrilhaDeAuditoriaUseCase,
  EVENT_PUBLISHER,
  ID_GENERATOR,
  ListarConsentimentosUseCase,
  RegistrarConsentimentoUseCase,
  RegistrarNaTrilhaDeAuditoriaService,
  RevogarConsentimentoUseCase,
  SOLICITACAO_EXPORTACAO_REPOSITORY,
  SolicitarExclusaoContaUseCase,
  SolicitarExportacaoUseCase,
  TRILHA_DE_AUDITORIA_REPOSITORY,
  USUARIO_REPOSITORY,
  type ConsentimentoRepository,
  type EventPublisher,
  type IdGenerator,
  type SolicitacaoExportacaoRepository,
  type TrilhaDeAuditoriaRepository,
  type UsuarioRepository,
} from '@cosmaria/core-application';
import {
  CryptoIdGenerator,
  InMemoryConsentimentoRepository,
  InMemorySolicitacaoExportacaoRepository,
  InMemoryTrilhaDeAuditoriaRepository,
  InProcessEventPublisher,
  PostgresConsentimentoRepository,
  PostgresSolicitacaoExportacaoRepository,
  PostgresTrilhaDeAuditoriaRepository,
} from '@cosmaria/core-infrastructure';
import { PG_POOL } from '../infra/infra.tokens';
import { AuthModule } from '../auth/auth.module';
import { AutorizacaoModule } from '../autorizacao/autorizacao.module';
import { ConsentimentoController } from './consentimento.controller';
import { ContaController } from './conta.controller';
import { TrilhaAuditoriaController } from './trilha-auditoria.controller';

/**
 * Composition root de Consentimento & Conformidade LGPD + Trilha de Auditoria
 * (doc 04 §21, doc 08 §7). No boot, registra o assinante de auditoria no barramento
 * global de eventos — é o primeiro consumidor do EDA (doc 04 §9).
 */
const providers: Provider[] = [
  { provide: ID_GENERATOR, useClass: CryptoIdGenerator },
  // USUARIO_REPOSITORY vem do AuthModule (mesma instância) — não é criado aqui.
  {
    provide: CONSENTIMENTO_REPOSITORY,
    useFactory: (pool: Pool | null): ConsentimentoRepository =>
      pool ? new PostgresConsentimentoRepository(pool) : new InMemoryConsentimentoRepository(),
    inject: [PG_POOL],
  },
  {
    provide: TRILHA_DE_AUDITORIA_REPOSITORY,
    useFactory: (pool: Pool | null): TrilhaDeAuditoriaRepository =>
      pool
        ? new PostgresTrilhaDeAuditoriaRepository(pool)
        : new InMemoryTrilhaDeAuditoriaRepository(),
    inject: [PG_POOL],
  },
  {
    provide: SOLICITACAO_EXPORTACAO_REPOSITORY,
    useFactory: (pool: Pool | null): SolicitacaoExportacaoRepository =>
      pool
        ? new PostgresSolicitacaoExportacaoRepository(pool)
        : new InMemorySolicitacaoExportacaoRepository(),
    inject: [PG_POOL],
  },
  {
    provide: RegistrarConsentimentoUseCase,
    useFactory: (repo: ConsentimentoRepository, idGen: IdGenerator, eventos: EventPublisher) =>
      new RegistrarConsentimentoUseCase(repo, idGen, eventos),
    inject: [CONSENTIMENTO_REPOSITORY, ID_GENERATOR, EVENT_PUBLISHER],
  },
  {
    provide: RevogarConsentimentoUseCase,
    useFactory: (repo: ConsentimentoRepository, eventos: EventPublisher) =>
      new RevogarConsentimentoUseCase(repo, eventos),
    inject: [CONSENTIMENTO_REPOSITORY, EVENT_PUBLISHER],
  },
  {
    provide: ListarConsentimentosUseCase,
    useFactory: (repo: ConsentimentoRepository) => new ListarConsentimentosUseCase(repo),
    inject: [CONSENTIMENTO_REPOSITORY],
  },
  {
    provide: SolicitarExclusaoContaUseCase,
    useFactory: (repo: UsuarioRepository, eventos: EventPublisher) =>
      new SolicitarExclusaoContaUseCase(repo, eventos),
    inject: [USUARIO_REPOSITORY, EVENT_PUBLISHER],
  },
  {
    provide: SolicitarExportacaoUseCase,
    useFactory: (
      repo: SolicitacaoExportacaoRepository,
      idGen: IdGenerator,
      eventos: EventPublisher,
    ) => new SolicitarExportacaoUseCase(repo, idGen, eventos),
    inject: [SOLICITACAO_EXPORTACAO_REPOSITORY, ID_GENERATOR, EVENT_PUBLISHER],
  },
  {
    provide: ConsultarExportacaoUseCase,
    useFactory: (repo: SolicitacaoExportacaoRepository) => new ConsultarExportacaoUseCase(repo),
    inject: [SOLICITACAO_EXPORTACAO_REPOSITORY],
  },
  {
    provide: ConsultarTrilhaDeAuditoriaUseCase,
    useFactory: (repo: TrilhaDeAuditoriaRepository) => new ConsultarTrilhaDeAuditoriaUseCase(repo),
    inject: [TRILHA_DE_AUDITORIA_REPOSITORY],
  },
  {
    provide: RegistrarNaTrilhaDeAuditoriaService,
    useFactory: (repo: TrilhaDeAuditoriaRepository, idGen: IdGenerator) =>
      new RegistrarNaTrilhaDeAuditoriaService(repo, idGen),
    inject: [TRILHA_DE_AUDITORIA_REPOSITORY, ID_GENERATOR],
  },
];

@Module({
  imports: [AuthModule, AutorizacaoModule],
  controllers: [ConsentimentoController, ContaController, TrilhaAuditoriaController],
  providers,
})
export class LgpdModule implements OnModuleInit {
  constructor(
    @Inject(InProcessEventPublisher) private readonly bus: InProcessEventPublisher,
    private readonly auditoria: RegistrarNaTrilhaDeAuditoriaService,
  ) {}

  onModuleInit(): void {
    // Auditoria passa a ouvir os eventos críticos do barramento (doc 08 §7).
    for (const nome of RegistrarNaTrilhaDeAuditoriaService.EVENTOS_AUDITADOS) {
      this.bus.assinar(nome, (evento) => this.auditoria.registrar(evento), 'core.auditoria');
    }
  }
}
