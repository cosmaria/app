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
