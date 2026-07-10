// @cosmaria/core-domain — Domínio do Core (doc 08 §12.1, doc 14).
// Puro: sem framework, sem SDK externo (enforçado pelo eslint, doc 14 §6).

export { StatusConta } from './lib/usuario/status-conta';
export { Email } from './lib/usuario/email.vo';
export { Usuario } from './lib/usuario/usuario.entity';
export type { UsuarioProps } from './lib/usuario/usuario.entity';
export { SessaoDeAutenticacao } from './lib/sessao/sessao-de-autenticacao.entity';
export type { SessaoDeAutenticacaoProps } from './lib/sessao/sessao-de-autenticacao.entity';
export { Papel, ehPapelValido } from './lib/autorizacao/papel';
export { Permissao, ehPermissaoValida } from './lib/autorizacao/permissao';
export { PoliticaDeAutorizacao } from './lib/autorizacao/politica-de-autorizacao';
export { Escopo, ehEscopoValido } from './lib/privacidade/escopo';
export { MotorDePrivacidade } from './lib/privacidade/motor-de-privacidade';
export { ConfiguracaoDeCompartilhamento } from './lib/privacidade/configuracao-de-compartilhamento.entity';
export type { ConfiguracaoDeCompartilhamentoProps } from './lib/privacidade/configuracao-de-compartilhamento.entity';
export { VISUALIZADOR_ANONIMO } from './lib/privacidade/contexto-de-visualizacao';
export type { ContextoDeVisualizacao } from './lib/privacidade/contexto-de-visualizacao';
export type { DomainEvent } from './lib/eventos/domain-event';
export { ConfiguracaoDeCompartilhamentoAlterada } from './lib/eventos/configuracao-de-compartilhamento-alterada.event';
export { ConsentimentoAlterado } from './lib/eventos/consentimento-alterado.event';
export { ContaExclusaoSolicitada } from './lib/eventos/conta-exclusao-solicitada.event';
export { ExportacaoDadosSolicitada } from './lib/eventos/exportacao-dados-solicitada.event';
export { PerfilPublicoCriado } from './lib/eventos/perfil-publico-criado.event';
export {
  VinculoDePerfisAutorizado,
  VinculoDePerfisRevogado,
} from './lib/eventos/vinculo-de-perfis.events';

export {
  AssinaturaAtualizada,
  PagamentoRecebido,
  PagamentoFalhou,
  LimitePremiumAtingido,
} from './lib/eventos/billing.events';

// Billing & Premium (doc 07, doc 08 §12.6)
export {
  Plano,
  ehPlanoValido,
  CicloDeCobranca,
  ehCicloDeCobrancaValido,
} from './lib/billing/plano';
export { StatusAssinatura, ehStatusAssinaturaValido } from './lib/billing/status-assinatura';
export { AssinaturaPremium } from './lib/billing/assinatura-premium.entity';
export type { AssinaturaPremiumProps } from './lib/billing/assinatura-premium.entity';
export { LimiteDePlano, ChavesDeLimite } from './lib/billing/limite-de-plano.entity';
export type { LimiteDePlanoProps } from './lib/billing/limite-de-plano.entity';
export { CupomOuPromocao, TipoDeDesconto } from './lib/billing/cupom-ou-promocao.entity';
export type { CupomOuPromocaoProps } from './lib/billing/cupom-ou-promocao.entity';
export {
  PeriodoGratuitoConfiguracao,
  PrecoRegional,
} from './lib/billing/catalogo-de-cobranca.entities';
export type {
  PeriodoGratuitoConfiguracaoProps,
  PrecoRegionalProps,
} from './lib/billing/catalogo-de-cobranca.entities';

// Complexidade Progressiva (doc 02 §5.0 — módulo transversal do Core)
export {
  NivelDeComplexidade,
  ehNivelDeComplexidadeValido,
  ordemDoNivel,
  nivelAlcanca,
} from './lib/complexidade/nivel-de-complexidade';
export { PreferenciaDeComplexidade } from './lib/complexidade/preferencia-de-complexidade.entity';
export type { PreferenciaDeComplexidadeProps } from './lib/complexidade/preferencia-de-complexidade.entity';

// Armazenamento de Mídia (doc 04 §7.1/§16, doc 08 §12.1 — capacidade do Core)
export { Midia, TipoDeMidia, tipoDeMidiaDoMime } from './lib/midia/midia.entity';
export type { MidiaProps } from './lib/midia/midia.entity';

// Notificações (doc 04 §15)
export {
  CategoriaDeNotificacao,
  ehCategoriaDeNotificacaoValida,
  CanalDeNotificacao,
  ehCanalDeNotificacaoValido,
  CANAIS_EXTERNOS,
} from './lib/notificacao/categoria-e-canal';
export { PreferenciaDeNotificacao } from './lib/notificacao/preferencia-de-notificacao.entity';
export type { PreferenciaDeNotificacaoProps } from './lib/notificacao/preferencia-de-notificacao.entity';
export { Notificacao, StatusNotificacao } from './lib/notificacao/notificacao.entity';
export type { NotificacaoProps, ConteudoDeNotificacao } from './lib/notificacao/notificacao.entity';
export { PoliticaDeDespacho } from './lib/notificacao/politica-de-despacho';
export type { DecisaoDeDespacho } from './lib/notificacao/politica-de-despacho';

// Identidade Social — Perfil Público por contexto (doc 06 §4)
export { ContextoDeApp, ehContextoDeAppValido } from './lib/perfil/contexto-de-app';
export { PoliticaDeNomeDePerfil } from './lib/perfil/politica-de-nome-de-perfil';
export { PerfilPublico } from './lib/perfil/perfil-publico.entity';
export type { PerfilPublicoProps } from './lib/perfil/perfil-publico.entity';
export { RegistroDeVinculoDePerfis } from './lib/perfil/registro-de-vinculo-de-perfis.entity';
export type { RegistroDeVinculoDePerfisProps } from './lib/perfil/registro-de-vinculo-de-perfis.entity';

// Consentimento & LGPD (doc 04 §21)
export {
  TipoConsentimento,
  ehTipoConsentimentoValido,
} from './lib/consentimento/tipo-consentimento';
export { ConsentimentoRegistro } from './lib/consentimento/consentimento-registro.entity';
export type { ConsentimentoRegistroProps } from './lib/consentimento/consentimento-registro.entity';
export { TrilhaDeAuditoria } from './lib/auditoria/trilha-de-auditoria.entity';
export type { TrilhaDeAuditoriaProps } from './lib/auditoria/trilha-de-auditoria.entity';
export {
  SolicitacaoDeExportacao,
  StatusExportacao,
} from './lib/lgpd/solicitacao-de-exportacao.entity';
export type { SolicitacaoDeExportacaoProps } from './lib/lgpd/solicitacao-de-exportacao.entity';
export {
  DomainError,
  CredenciaisInvalidasError,
  ContaInativaError,
  SessaoInvalidaError,
  EmailJaCadastradoError,
  EmailInvalidoError,
  AcessoNegadoError,
} from './lib/errors/auth.errors';
export {
  PerfilNaoEncontradoError,
  VinculoDePerfisDesabilitadoError,
  VinculoDePerfisInvalidoError,
} from './lib/errors/perfil.errors';
export {
  AssinaturaJaAtivaError,
  AssinaturaNaoPremiumError,
  CupomInvalidoError,
  PrecoNaoConfiguradoError,
  AssinaturaDePayloadInvalidaError,
  LimiteDePlanoAtingidoError,
} from './lib/errors/billing.errors';
export {
  MidiaNaoEncontradaError,
  TipoDeMidiaNaoSuportadoError,
  MidiaAcimaDoLimiteError,
} from './lib/errors/midia.errors';
