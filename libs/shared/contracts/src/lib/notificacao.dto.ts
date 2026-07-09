/**
 * Contratos HTTP de Notificações (doc 09 — /v1/preferencia-notificacao, /v1/notificacoes).
 * Tipos puros, compartilhados entre backend (apps/api) e mobile (apps/mobile).
 */

export interface PreferenciaNotificacaoResponse {
  modoDiscreto: boolean;
  /** Fuso IANA (ex.: 'America/Sao_Paulo'). O horário de silêncio é local, não UTC. */
  fusoHorario: string;
  /** Minutos desde a meia-noite local. `null` nos dois = sem silêncio. */
  silencioInicioMinutos: number | null;
  silencioFimMinutos: number | null;
  canaisPorCategoria: { categoria: string; canais: string[] }[];
}

/** Corpo de `PUT /v1/preferencia-notificacao`. Campo ausente não é alterado. */
export interface AtualizarPreferenciaNotificacaoRequest {
  modoDiscreto?: boolean;
  fusoHorario?: string;
  silencioInicioMinutos?: number | null;
  silencioFimMinutos?: number | null;
  canaisPorCategoria?: { categoria: string; canais: string[] }[];
}

export interface NotificacaoItemResponse {
  notificacaoId: string;
  categoria: string;
  titulo: string;
  corpo: string;
  /** ENVIADA | SILENCIADA | PENDENTE. Silenciada = registrada sem envio externo. */
  status: string;
  lida: boolean;
  criadoEm: string;
}

/** Resposta de `GET /v1/notificacoes` — sempre paginada (doc 09 §5). */
export interface CentralDeNotificacoesResponse {
  itens: NotificacaoItemResponse[];
  naoLidas: number;
}
