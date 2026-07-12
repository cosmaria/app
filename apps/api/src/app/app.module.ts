import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ehAmbienteDeTeste } from './infra/infra.config';
import { PersistenceModule } from './infra/persistence.module';
import { EventosModule } from './infra/eventos.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { AutorizacaoModule } from './autorizacao/autorizacao.module';
import { PrivacidadeModule } from './privacidade/privacidade.module';
import { LgpdModule } from './lgpd/lgpd.module';
import { PerfilModule } from './perfil/perfil.module';
import { BillingModule } from './billing/billing.module';
import { NotificacaoModule } from './notificacao/notificacao.module';
import { MidiaModule } from './midia/midia.module';
import { ComplexidadeModule } from './complexidade/complexidade.module';
import { GrowModule } from './grow/grow.module';
import { MedModule } from './med/med.module';
import { IaModule } from './ia/ia.module';

/**
 * Módulo raiz do Modular Monolith.
 * - PersistenceModule (global): pool Postgres + cache Redis reais, ciclo de vida.
 * - EventosModule (global): barramento de eventos em processo (EDA, doc 04 §9).
 * - HealthModule: liveness + readiness (consulta banco/cache reais).
 * - AuthModule: autenticação (Core).
 * - AutorizacaoModule: RBAC + permissões (Core, doc 04 §11).
 * - PrivacidadeModule: Motor de Privacidade Granular (Core, doc 04 §12).
 * - LgpdModule: Consentimento, LGPD (exclusão/exportação) e Trilha de Auditoria (Core, doc 04 §21).
 * - PerfilModule: Identidade Social — Perfil Público por contexto + Vínculo de Perfis (Core, doc 06).
 * - BillingModule: assinatura única, limites de plano e webhook de pagamento (Core, doc 07).
 * - NotificacaoModule: serviço único de notificação alimentado por eventos (Core, doc 04 §15).
 * - MidiaModule: armazenamento de mídia compartilhado por Grow e Med (Core, doc 04 §16).
 * - ComplexidadeModule: complexidade progressiva e Modo Especialista (Core, doc 02 §5.0).
 * - GrowModule: núcleo do COSMARIA Grow — Genética, Ambiente, Ciclo, Planta (doc 02).
 * - MedModule: núcleo do COSMARIA Med — Tratamento, Produto, Registro de Uso (doc 03).
 * - IaModule: IA — ingestão de eventos + Motor de Correlação (doc 05).
 * Comunidade (doc 06) entra em sprints seguintes.
 */
@Module({
  imports: [
    // `ignoreEnvFile` em teste: nenhuma suíte deve alcançar o Postgres/Redis do
    // desenvolvedor por acidente (ver ehAmbienteDeTeste).
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: ehAmbienteDeTeste() }),
    PersistenceModule,
    EventosModule,
    HealthModule,
    AuthModule,
    AutorizacaoModule,
    PrivacidadeModule,
    LgpdModule,
    PerfilModule,
    BillingModule,
    NotificacaoModule,
    MidiaModule,
    ComplexidadeModule,
    GrowModule,
    MedModule,
    IaModule,
  ],
})
export class AppModule {}
