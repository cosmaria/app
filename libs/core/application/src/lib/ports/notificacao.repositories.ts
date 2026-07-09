import type { Notificacao, PreferenciaDeNotificacao } from '@cosmaria/core-domain';

/** Preferência de notificação: uma linha por Usuário (Arquétipo D, doc 08 §12.1). */
export interface PreferenciaDeNotificacaoRepository {
  salvar(preferencia: PreferenciaDeNotificacao): Promise<void>;
  buscarPorUsuario(usuarioId: string): Promise<PreferenciaDeNotificacao | null>;
}

export const PREFERENCIA_DE_NOTIFICACAO_REPOSITORY = Symbol('PreferenciaDeNotificacaoRepository');

export interface PaginaDeNotificacoes {
  itens: Notificacao[];
  /** Total de não lidas do usuário — o badge da Central (doc 10). */
  naoLidas: number;
}

export interface NotificacaoRepository {
  salvar(notificacao: Notificacao): Promise<void>;
  buscarPorId(id: string): Promise<Notificacao | null>;
  /** Lista paginada, mais recentes primeiro (paginação obrigatória — doc 09 §5). */
  listarPorUsuario(
    usuarioId: string,
    parametros: { limite: number; deslocamento: number },
  ): Promise<PaginaDeNotificacoes>;
}

export const NOTIFICACAO_REPOSITORY = Symbol('NotificacaoRepository');
