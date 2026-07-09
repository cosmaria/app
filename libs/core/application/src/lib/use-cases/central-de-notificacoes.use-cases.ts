import {
  type CanalDeNotificacao,
  type CategoriaDeNotificacao,
  type Notificacao,
  type PreferenciaDeNotificacao,
  type StatusNotificacao,
} from '@cosmaria/core-domain';
import {
  NotificacaoRepository,
  PreferenciaDeNotificacaoRepository,
} from '../ports/notificacao.repositories';
import { ResolverPreferenciaDeNotificacaoService } from './notificacao.use-cases';

export interface PreferenciaView {
  modoDiscreto: boolean;
  fusoHorario: string;
  silencioInicioMinutos: number | null;
  silencioFimMinutos: number | null;
  canaisPorCategoria: { categoria: CategoriaDeNotificacao; canais: CanalDeNotificacao[] }[];
}

const paraPreferenciaView = (p: PreferenciaDeNotificacao): PreferenciaView => ({
  modoDiscreto: p.modoDiscreto,
  fusoHorario: p.fusoHorario,
  silencioInicioMinutos: p.silencioInicioMinutos,
  silencioFimMinutos: p.silencioFimMinutos,
  canaisPorCategoria: [...p.canaisConfigurados()].map(([categoria, canais]) => ({
    categoria,
    canais,
  })),
});

/** `GET /v1/preferencia-notificacao` (doc 09). Cria a preferência padrão na 1ª leitura. */
export class ObterPreferenciaDeNotificacaoUseCase {
  constructor(private readonly resolver: ResolverPreferenciaDeNotificacaoService) {}

  async executar(usuarioId: string): Promise<PreferenciaView> {
    return paraPreferenciaView(await this.resolver.executar(usuarioId));
  }
}

export interface AtualizarPreferenciaInput {
  usuarioId: string;
  modoDiscreto?: boolean;
  fusoHorario?: string;
  /** Ambos `null` desliga o silêncio. Informar só um dos dois é ignorado. */
  silencioInicioMinutos?: number | null;
  silencioFimMinutos?: number | null;
  canaisPorCategoria?: { categoria: CategoriaDeNotificacao; canais: CanalDeNotificacao[] }[];
}

/** `PUT /v1/preferencia-notificacao` — atualização parcial (campo ausente não muda). */
export class AtualizarPreferenciaDeNotificacaoUseCase {
  constructor(
    private readonly resolver: ResolverPreferenciaDeNotificacaoService,
    private readonly repo: PreferenciaDeNotificacaoRepository,
  ) {}

  async executar(input: AtualizarPreferenciaInput): Promise<PreferenciaView> {
    const preferencia = await this.resolver.executar(input.usuarioId);

    if (input.modoDiscreto !== undefined) {
      preferencia.definirModoDiscreto(input.modoDiscreto);
    }
    if (input.fusoHorario !== undefined) {
      preferencia.definirFusoHorario(input.fusoHorario);
    }
    if (input.silencioInicioMinutos !== undefined && input.silencioFimMinutos !== undefined) {
      preferencia.definirHorarioDeSilencio(input.silencioInicioMinutos, input.silencioFimMinutos);
    }
    for (const entrada of input.canaisPorCategoria ?? []) {
      preferencia.definirCanais(entrada.categoria, entrada.canais);
    }

    await this.repo.salvar(preferencia);
    return paraPreferenciaView(preferencia);
  }
}

export interface NotificacaoView {
  notificacaoId: string;
  categoria: CategoriaDeNotificacao;
  titulo: string;
  corpo: string;
  status: StatusNotificacao;
  lida: boolean;
  criadoEm: string;
}

export interface CentralDeNotificacoesView {
  itens: NotificacaoView[];
  naoLidas: number;
}

const LIMITE_MAXIMO = 100;
const LIMITE_PADRAO = 20;

/**
 * `GET /v1/notificacoes` — a Central de Notificações (doc 10).
 *
 * Sempre paginada (convenção transversal do doc 09 §5). Devolve o conteúdo **completo**,
 * mesmo com Modo Discreto ativo: dentro do app o usuário já se autenticou, e o Modo
 * Discreto protege o que sai por canal externo e o que aparece na tela de bloqueio —
 * ocultar o conteúdo aqui tornaria a Central inútil.
 */
export class ListarNotificacoesUseCase {
  constructor(private readonly repo: NotificacaoRepository) {}

  async executar(
    usuarioId: string,
    parametros: { limite?: number; deslocamento?: number } = {},
  ): Promise<CentralDeNotificacoesView> {
    const limite = Math.min(Math.max(parametros.limite ?? LIMITE_PADRAO, 1), LIMITE_MAXIMO);
    const deslocamento = Math.max(parametros.deslocamento ?? 0, 0);

    const pagina = await this.repo.listarPorUsuario(usuarioId, { limite, deslocamento });
    return {
      itens: pagina.itens.map(paraNotificacaoView),
      naoLidas: pagina.naoLidas,
    };
  }
}

const paraNotificacaoView = (n: Notificacao): NotificacaoView => ({
  notificacaoId: n.id,
  categoria: n.categoria,
  titulo: n.titulo,
  corpo: n.corpo,
  status: n.status,
  lida: n.ehLida(),
  criadoEm: n.criadoEm.toISOString(),
});

/** `POST /v1/notificacoes/{id}/ler`. Idempotente; nunca revela notificação de outro. */
export class MarcarNotificacaoLidaUseCase {
  constructor(private readonly repo: NotificacaoRepository) {}

  async executar(input: { usuarioId: string; notificacaoId: string }): Promise<void> {
    const notificacao = await this.repo.buscarPorId(input.notificacaoId);
    if (!notificacao || notificacao.usuarioId !== input.usuarioId) {
      return;
    }
    notificacao.marcarLida();
    await this.repo.salvar(notificacao);
  }
}
