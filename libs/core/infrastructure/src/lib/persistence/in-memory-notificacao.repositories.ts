import type {
  NotificacaoRepository,
  PaginaDeNotificacoes,
  PreferenciaDeNotificacaoRepository,
} from '@cosmaria/core-application';
import type { Notificacao, PreferenciaDeNotificacao } from '@cosmaria/core-domain';

/** Mesmas portas do Postgres (LSP, doc 04 §4). Usados em testes e dev sem banco. */
export class InMemoryPreferenciaDeNotificacaoRepository implements PreferenciaDeNotificacaoRepository {
  private readonly porUsuario = new Map<string, PreferenciaDeNotificacao>();

  salvar(preferencia: PreferenciaDeNotificacao): Promise<void> {
    this.porUsuario.set(preferencia.usuarioId, preferencia);
    return Promise.resolve();
  }

  buscarPorUsuario(usuarioId: string): Promise<PreferenciaDeNotificacao | null> {
    return Promise.resolve(this.porUsuario.get(usuarioId) ?? null);
  }
}

export class InMemoryNotificacaoRepository implements NotificacaoRepository {
  private readonly porId = new Map<string, Notificacao>();

  salvar(notificacao: Notificacao): Promise<void> {
    this.porId.set(notificacao.id, notificacao);
    return Promise.resolve();
  }

  buscarPorId(id: string): Promise<Notificacao | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }

  listarPorUsuario(
    usuarioId: string,
    parametros: { limite: number; deslocamento: number },
  ): Promise<PaginaDeNotificacoes> {
    const doUsuario = [...this.porId.values()]
      .filter((n) => n.usuarioId === usuarioId)
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());

    return Promise.resolve({
      itens: doUsuario.slice(parametros.deslocamento, parametros.deslocamento + parametros.limite),
      naoLidas: doUsuario.filter((n) => !n.ehLida()).length,
    });
  }
}
