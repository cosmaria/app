// @cosmaria/core-application — Casos de uso e portas do Core (doc 14).
// Puro: depende só do domínio; nunca de framework ou SDK externo (doc 14 §6).

// Ports (tokens de injeção como valores; contratos como tipos)
export { ID_GENERATOR } from './lib/ports/id-generator.port';
export type { IdGenerator } from './lib/ports/id-generator.port';
export { PASSWORD_HASHER } from './lib/ports/password-hasher.port';
export type { PasswordHasher } from './lib/ports/password-hasher.port';
export { TOKEN_SERVICE } from './lib/ports/token-service.port';
export type {
  TokenService,
  AccessTokenGerado,
  AccessTokenPayload,
  RefreshTokenGerado,
  RefreshTokenPayload,
} from './lib/ports/token-service.port';
export { USUARIO_REPOSITORY } from './lib/ports/usuario.repository';
export type { UsuarioRepository } from './lib/ports/usuario.repository';
export { SESSAO_REPOSITORY } from './lib/ports/sessao.repository';
export type { SessaoRepository } from './lib/ports/sessao.repository';
export { CACHE_PORT } from './lib/ports/cache.port';
export type { CachePort } from './lib/ports/cache.port';
export { EVENT_PUBLISHER } from './lib/ports/event-publisher.port';
export type { EventPublisher } from './lib/ports/event-publisher.port';
export { CONFIGURACAO_COMPARTILHAMENTO_REPOSITORY } from './lib/ports/configuracao-de-compartilhamento.repository';
export type { ConfiguracaoDeCompartilhamentoRepository } from './lib/ports/configuracao-de-compartilhamento.repository';
export { CONSENTIMENTO_REPOSITORY } from './lib/ports/consentimento.repository';
export type { ConsentimentoRepository } from './lib/ports/consentimento.repository';
export { TRILHA_DE_AUDITORIA_REPOSITORY } from './lib/ports/trilha-de-auditoria.repository';
export type { TrilhaDeAuditoriaRepository } from './lib/ports/trilha-de-auditoria.repository';
export { SOLICITACAO_EXPORTACAO_REPOSITORY } from './lib/ports/solicitacao-exportacao.repository';
export type { SolicitacaoExportacaoRepository } from './lib/ports/solicitacao-exportacao.repository';

// Use cases
export { RegistrarUsuarioUseCase } from './lib/use-cases/registrar-usuario.use-case';
export type {
  RegistrarUsuarioInput,
  RegistrarUsuarioOutput,
} from './lib/use-cases/registrar-usuario.use-case';
export { LoginUseCase } from './lib/use-cases/login.use-case';
export type { LoginInput } from './lib/use-cases/login.use-case';
export { RefreshTokenUseCase } from './lib/use-cases/refresh-token.use-case';
export type { RefreshTokenInput } from './lib/use-cases/refresh-token.use-case';
export { ValidarAccessTokenUseCase } from './lib/use-cases/validar-access-token.use-case';
export type { IdentidadeAutenticada } from './lib/use-cases/validar-access-token.use-case';
export type { ResultadoAutenticacao } from './lib/use-cases/resultado-autenticacao';

// Motor de Privacidade (doc 04 §12)
export { DefinirCompartilhamentoUseCase } from './lib/use-cases/definir-compartilhamento.use-case';
export type { DefinirCompartilhamentoInput } from './lib/use-cases/definir-compartilhamento.use-case';
export { FiltrarConteudoUseCase } from './lib/use-cases/filtrar-conteudo.use-case';
export type { FiltrarConteudoInput } from './lib/use-cases/filtrar-conteudo.use-case';
export { DimensoesVisiveisUseCase } from './lib/use-cases/dimensoes-visiveis.use-case';
export type { DimensoesVisiveisInput } from './lib/use-cases/dimensoes-visiveis.use-case';
export type { CompartilhamentoResumo } from './lib/use-cases/compartilhamento-resumo';

// Consentimento & LGPD + Auditoria (doc 04 §21, doc 08 §7)
export {
  RegistrarConsentimentoUseCase,
  RevogarConsentimentoUseCase,
  ListarConsentimentosUseCase,
} from './lib/use-cases/consentimento.use-cases';
export type { ConsentimentoView } from './lib/use-cases/consentimento.use-cases';
export {
  SolicitarExclusaoContaUseCase,
  SolicitarExportacaoUseCase,
  ConsultarExportacaoUseCase,
} from './lib/use-cases/conta-lgpd.use-cases';
export type { ExportacaoView } from './lib/use-cases/conta-lgpd.use-cases';
export {
  RegistrarNaTrilhaDeAuditoriaService,
  ConsultarTrilhaDeAuditoriaUseCase,
} from './lib/use-cases/auditoria.use-cases';
export type { TrilhaView } from './lib/use-cases/auditoria.use-cases';
