import { Inject, Module, type OnModuleInit, type Provider } from '@nestjs/common';
import type { Pool } from 'pg';
import {
  EVENT_PUBLISHER,
  ID_GENERATOR,
  type EventPublisher,
  type IdGenerator,
} from '@cosmaria/core-application';
import { CryptoIdGenerator, InProcessEventPublisher } from '@cosmaria/core-infrastructure';
import {
  PERFIL_PUBLIC_API,
  type PerfilPublicApi,
  PREMIUM_PUBLIC_API,
  type PremiumPublicApi,
} from '@cosmaria/core-public-api';
import {
  BuscarPublicacoesUseCase,
  ComentarPublicacaoUseCase,
  COMENTARIO_REPOSITORY,
  CurtirPublicacaoUseCase,
  CURTIDA_REPOSITORY,
  DeixarDeSeguirUseCase,
  DescurtirPublicacaoUseCase,
  ForkarPublicacaoUseCase,
  ListarComentariosUseCase,
  ObterEstatisticasDePerfilUseCase,
  ObterFeedUseCase,
  ObterPublicacaoUseCase,
  ObterReputacaoUseCase,
  ProjetarPublicacaoService,
  PUBLICACAO_COMUNIDADE_REPOSITORY,
  RegistrarVisualizacaoDePerfilUseCase,
  REGISTRO_DE_FORK_REPOSITORY,
  SeguirPerfilUseCase,
  SEGUIMENTO_REPOSITORY,
  VISUALIZACAO_DE_PERFIL_REPOSITORY,
  type ComentarioRepository,
  type CurtidaRepository,
  type PublicacaoComunidadeRepository,
  type RegistroDeForkRepository,
  type SeguimentoRepository,
  type VisualizacaoDePerfilRepository,
} from '@cosmaria/comunidade-application';
import {
  InMemoryComentarioRepository,
  InMemoryCurtidaRepository,
  InMemoryPublicacaoComunidadeRepository,
  InMemoryRegistroDeForkRepository,
  InMemorySeguimentoRepository,
  InMemoryVisualizacaoDePerfilRepository,
  PostgresComentarioRepository,
  PostgresCurtidaRepository,
  PostgresPublicacaoComunidadeRepository,
  PostgresRegistroDeForkRepository,
  PostgresSeguimentoRepository,
  PostgresVisualizacaoDePerfilRepository,
} from '@cosmaria/comunidade-infrastructure';
import { PG_POOL } from '../infra/infra.tokens';
import { AuthModule } from '../auth/auth.module';
import { BillingModule } from '../billing/billing.module';
import { PerfilModule } from '../perfil/perfil.module';
import { ComunidadeController, InteracaoController } from './comunidade.controller';

/**
 * Composition root da Comunidade (doc 06 / doc 14 §10).
 *
 * A Comunidade é uma PROJEÇÃO de leitura: no boot, assina no barramento global os eventos
 * de publicação de Grow e Med (`GrowlogPublicado`, `PublicacaoComunidadeMedCriada`) — é o
 * quarto consumidor do EDA, depois de Auditoria, Notificações e IA. Não importa, e não pode
 * importar, nenhum módulo de Grow/Med (doc 04 §24, enforçado por lint): ouve por NOME.
 *
 * As interações sociais (seguir/curtir/comentar) publicam eventos próprios para o Serviço de
 * Notificações. Importa o PerfilModule só pela PERFIL_PUBLIC_API — nunca conhece o `usuarioId`
 * por trás de um perfil.
 */
const providers: Provider[] = [
  { provide: ID_GENERATOR, useClass: CryptoIdGenerator },
  {
    provide: PUBLICACAO_COMUNIDADE_REPOSITORY,
    useFactory: (pool: Pool | null): PublicacaoComunidadeRepository =>
      pool
        ? new PostgresPublicacaoComunidadeRepository(pool)
        : new InMemoryPublicacaoComunidadeRepository(),
    inject: [PG_POOL],
  },
  {
    provide: SEGUIMENTO_REPOSITORY,
    useFactory: (pool: Pool | null): SeguimentoRepository =>
      pool ? new PostgresSeguimentoRepository(pool) : new InMemorySeguimentoRepository(),
    inject: [PG_POOL],
  },
  {
    provide: CURTIDA_REPOSITORY,
    useFactory: (pool: Pool | null): CurtidaRepository =>
      pool ? new PostgresCurtidaRepository(pool) : new InMemoryCurtidaRepository(),
    inject: [PG_POOL],
  },
  {
    provide: COMENTARIO_REPOSITORY,
    useFactory: (pool: Pool | null): ComentarioRepository =>
      pool ? new PostgresComentarioRepository(pool) : new InMemoryComentarioRepository(),
    inject: [PG_POOL],
  },
  {
    provide: REGISTRO_DE_FORK_REPOSITORY,
    useFactory: (pool: Pool | null): RegistroDeForkRepository =>
      pool ? new PostgresRegistroDeForkRepository(pool) : new InMemoryRegistroDeForkRepository(),
    inject: [PG_POOL],
  },
  {
    provide: VISUALIZACAO_DE_PERFIL_REPOSITORY,
    useFactory: (pool: Pool | null): VisualizacaoDePerfilRepository =>
      pool
        ? new PostgresVisualizacaoDePerfilRepository(pool)
        : new InMemoryVisualizacaoDePerfilRepository(),
    inject: [PG_POOL],
  },
  {
    provide: ProjetarPublicacaoService,
    useFactory: (repo: PublicacaoComunidadeRepository, idGen: IdGenerator) =>
      new ProjetarPublicacaoService(repo, idGen),
    inject: [PUBLICACAO_COMUNIDADE_REPOSITORY, ID_GENERATOR],
  },
  {
    provide: ObterFeedUseCase,
    useFactory: (
      repo: PublicacaoComunidadeRepository,
      perfis: PerfilPublicApi,
      seguimentos: SeguimentoRepository,
    ) => new ObterFeedUseCase(repo, perfis, seguimentos),
    inject: [PUBLICACAO_COMUNIDADE_REPOSITORY, PERFIL_PUBLIC_API, SEGUIMENTO_REPOSITORY],
  },
  {
    provide: ObterPublicacaoUseCase,
    useFactory: (
      repo: PublicacaoComunidadeRepository,
      perfis: PerfilPublicApi,
      seguimentos: SeguimentoRepository,
    ) => new ObterPublicacaoUseCase(repo, perfis, seguimentos),
    inject: [PUBLICACAO_COMUNIDADE_REPOSITORY, PERFIL_PUBLIC_API, SEGUIMENTO_REPOSITORY],
  },
  {
    provide: BuscarPublicacoesUseCase,
    useFactory: (
      repo: PublicacaoComunidadeRepository,
      perfis: PerfilPublicApi,
      seguimentos: SeguimentoRepository,
    ) => new BuscarPublicacoesUseCase(repo, perfis, seguimentos),
    inject: [PUBLICACAO_COMUNIDADE_REPOSITORY, PERFIL_PUBLIC_API, SEGUIMENTO_REPOSITORY],
  },
  {
    provide: SeguirPerfilUseCase,
    useFactory: (
      seguimentos: SeguimentoRepository,
      perfis: PerfilPublicApi,
      idGen: IdGenerator,
      eventos: EventPublisher,
    ) => new SeguirPerfilUseCase(seguimentos, perfis, idGen, eventos),
    inject: [SEGUIMENTO_REPOSITORY, PERFIL_PUBLIC_API, ID_GENERATOR, EVENT_PUBLISHER],
  },
  {
    provide: DeixarDeSeguirUseCase,
    useFactory: (seguimentos: SeguimentoRepository, perfis: PerfilPublicApi) =>
      new DeixarDeSeguirUseCase(seguimentos, perfis),
    inject: [SEGUIMENTO_REPOSITORY, PERFIL_PUBLIC_API],
  },
  {
    provide: CurtirPublicacaoUseCase,
    useFactory: (
      curtidas: CurtidaRepository,
      publicacoes: PublicacaoComunidadeRepository,
      perfis: PerfilPublicApi,
      idGen: IdGenerator,
      eventos: EventPublisher,
    ) => new CurtirPublicacaoUseCase(curtidas, publicacoes, perfis, idGen, eventos),
    inject: [
      CURTIDA_REPOSITORY,
      PUBLICACAO_COMUNIDADE_REPOSITORY,
      PERFIL_PUBLIC_API,
      ID_GENERATOR,
      EVENT_PUBLISHER,
    ],
  },
  {
    provide: DescurtirPublicacaoUseCase,
    useFactory: (
      curtidas: CurtidaRepository,
      publicacoes: PublicacaoComunidadeRepository,
      perfis: PerfilPublicApi,
    ) => new DescurtirPublicacaoUseCase(curtidas, publicacoes, perfis),
    inject: [CURTIDA_REPOSITORY, PUBLICACAO_COMUNIDADE_REPOSITORY, PERFIL_PUBLIC_API],
  },
  {
    provide: ComentarPublicacaoUseCase,
    useFactory: (
      comentarios: ComentarioRepository,
      publicacoes: PublicacaoComunidadeRepository,
      perfis: PerfilPublicApi,
      idGen: IdGenerator,
      eventos: EventPublisher,
    ) => new ComentarPublicacaoUseCase(comentarios, publicacoes, perfis, idGen, eventos),
    inject: [
      COMENTARIO_REPOSITORY,
      PUBLICACAO_COMUNIDADE_REPOSITORY,
      PERFIL_PUBLIC_API,
      ID_GENERATOR,
      EVENT_PUBLISHER,
    ],
  },
  {
    provide: ListarComentariosUseCase,
    useFactory: (comentarios: ComentarioRepository, publicacoes: PublicacaoComunidadeRepository) =>
      new ListarComentariosUseCase(comentarios, publicacoes),
    inject: [COMENTARIO_REPOSITORY, PUBLICACAO_COMUNIDADE_REPOSITORY],
  },
  {
    provide: ForkarPublicacaoUseCase,
    useFactory: (
      publicacoes: PublicacaoComunidadeRepository,
      forks: RegistroDeForkRepository,
      perfis: PerfilPublicApi,
      idGen: IdGenerator,
      eventos: EventPublisher,
    ) => new ForkarPublicacaoUseCase(publicacoes, forks, perfis, idGen, eventos),
    inject: [
      PUBLICACAO_COMUNIDADE_REPOSITORY,
      REGISTRO_DE_FORK_REPOSITORY,
      PERFIL_PUBLIC_API,
      ID_GENERATOR,
      EVENT_PUBLISHER,
    ],
  },
  {
    provide: ObterReputacaoUseCase,
    useFactory: (
      perfis: PerfilPublicApi,
      seguimentos: SeguimentoRepository,
      forks: RegistroDeForkRepository,
      publicacoes: PublicacaoComunidadeRepository,
    ) => new ObterReputacaoUseCase(perfis, seguimentos, forks, publicacoes),
    inject: [
      PERFIL_PUBLIC_API,
      SEGUIMENTO_REPOSITORY,
      REGISTRO_DE_FORK_REPOSITORY,
      PUBLICACAO_COMUNIDADE_REPOSITORY,
    ],
  },
  {
    provide: RegistrarVisualizacaoDePerfilUseCase,
    useFactory: (visualizacoes: VisualizacaoDePerfilRepository, perfis: PerfilPublicApi) =>
      new RegistrarVisualizacaoDePerfilUseCase(visualizacoes, perfis),
    inject: [VISUALIZACAO_DE_PERFIL_REPOSITORY, PERFIL_PUBLIC_API],
  },
  {
    provide: ObterEstatisticasDePerfilUseCase,
    useFactory: (
      perfis: PerfilPublicApi,
      premium: PremiumPublicApi,
      visualizacoes: VisualizacaoDePerfilRepository,
      seguimentos: SeguimentoRepository,
      forks: RegistroDeForkRepository,
      publicacoes: PublicacaoComunidadeRepository,
    ) =>
      new ObterEstatisticasDePerfilUseCase(
        perfis,
        premium,
        visualizacoes,
        seguimentos,
        forks,
        publicacoes,
      ),
    inject: [
      PERFIL_PUBLIC_API,
      PREMIUM_PUBLIC_API,
      VISUALIZACAO_DE_PERFIL_REPOSITORY,
      SEGUIMENTO_REPOSITORY,
      REGISTRO_DE_FORK_REPOSITORY,
      PUBLICACAO_COMUNIDADE_REPOSITORY,
    ],
  },
];

@Module({
  // BillingModule só pela PREMIUM_PUBLIC_API (gate das estatísticas avançadas de perfil).
  imports: [AuthModule, PerfilModule, BillingModule],
  controllers: [ComunidadeController, InteracaoController],
  providers,
})
export class ComunidadeModule implements OnModuleInit {
  constructor(
    @Inject(InProcessEventPublisher) private readonly bus: InProcessEventPublisher,
    private readonly projetor: ProjetarPublicacaoService,
  ) {}

  onModuleInit(): void {
    for (const nome of ProjetarPublicacaoService.EVENTOS_PROJETADOS) {
      this.bus.assinar(nome, (evento) => this.projetor.projetar(evento));
    }
  }
}
