// @cosmaria/shared-contracts — Contratos HTTP compartilhados backend ↔ mobile (doc 14 §9).

export type {
  RegistrarRequest,
  RegistrarResponse,
  LoginRequest,
  RefreshRequest,
  UsuarioResumoDTO,
  AutenticacaoResponse,
  VerificarPermissaoResponse,
  MinhaAutorizacaoResponse,
} from './lib/auth.dto';

export type {
  PerfilPublicoResponse,
  AtualizarPerfilRequest,
  AutorizarVinculoPerfisRequest,
  VinculoPerfisResponse,
} from './lib/perfil.dto';

export type {
  AssinaturaResponse,
  IniciarUpgradeRequest,
  UpgradeResponse,
  AplicarCupomRequest,
  LimitesResponse,
} from './lib/billing.dto';

export type {
  PreferenciaNotificacaoResponse,
  AtualizarPreferenciaNotificacaoRequest,
  NotificacaoItemResponse,
  CentralDeNotificacoesResponse,
} from './lib/notificacao.dto';
