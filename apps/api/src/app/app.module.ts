import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PersistenceModule } from './infra/persistence.module';
import { EventosModule } from './infra/eventos.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AutorizacaoModule } from './autorizacao/autorizacao.module';
import { PrivacidadeModule } from './privacidade/privacidade.module';
import { LgpdModule } from './lgpd/lgpd.module';

/**
 * Módulo raiz do Modular Monolith.
 * - PersistenceModule (global): pool Postgres + cache Redis reais, ciclo de vida.
 * - EventosModule (global): barramento de eventos em processo (EDA, doc 04 §9).
 * - HealthModule: liveness + readiness (consulta banco/cache reais).
 * - AuthModule: autenticação (Core).
 * - AutorizacaoModule: RBAC + permissões (Core, doc 04 §11).
 * - PrivacidadeModule: Motor de Privacidade Granular (Core, doc 04 §12).
 * - LgpdModule: Consentimento, LGPD (exclusão/exportação) e Trilha de Auditoria (Core, doc 04 §21).
 * Grow, Med, Comunidade e IA (doc 04) entram em sprints seguintes.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PersistenceModule,
    EventosModule,
    HealthModule,
    AuthModule,
    AutorizacaoModule,
    PrivacidadeModule,
    LgpdModule,
  ],
})
export class AppModule {}
