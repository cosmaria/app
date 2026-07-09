import {
  type CanalDeNotificacao,
  type CategoriaDeNotificacao,
  Notificacao,
  PoliticaDeDespacho,
  PreferenciaDeNotificacao,
  type StatusNotificacao,
} from '@cosmaria/core-domain';
import { IdGenerator } from '../ports/id-generator.port';
import { DespachanteDeNotificacao } from '../ports/despachante-de-notificacao.port';
import {
  NotificacaoRepository,
  PreferenciaDeNotificacaoRepository,
} from '../ports/notificacao.repositories';
import { RegistroDeIdempotenciaRepository } from '../ports/idempotencia.port';

/**
 * Janela anti-spam: a mesma notificação (mesma chave de agrupamento) não sai duas vezes
 * por canal externo dentro deste intervalo. O registro na Central continua acontecendo.
 */
export const JANELA_ANTI_SPAM_SEGUNDOS = 3600;

/**
 * Converte "agora" para minutos desde a meia-noite **no fuso do usuário**.
 * Usa `Intl` em vez de aritmética de offset porque só ele acerta horário de verão.
 * Fuso inválido cai em UTC — nunca deixa uma notificação falhar por configuração ruim.
 */
export function minutosDoDiaNoFuso(agora: Date, fusoHorario: string): number {
  try {
    const partes = new Intl.DateTimeFormat('en-US', {
      timeZone: fusoHorario,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(agora);

    const valor = (tipo: string): number =>
      Number(partes.find((p) => p.type === tipo)?.value ?? '0');
    // Em alguns ICU, meia-noite vem como "24".
    return (valor('hour') % 24) * 60 + valor('minute');
  } catch {
    return agora.getUTCHours() * 60 + agora.getUTCMinutes();
  }
}

/** Resolve a preferência da Conta, criando a padrão na primeira vez (criação lazy). */
export class ResolverPreferenciaDeNotificacaoService {
  constructor(
    private readonly repo: PreferenciaDeNotificacaoRepository,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(usuarioId: string): Promise<PreferenciaDeNotificacao> {
    const existente = await this.repo.buscarPorUsuario(usuarioId);
    if (existente) {
      return existente;
    }
    const padrao = PreferenciaDeNotificacao.padrao({ id: this.idGen.gerar(), usuarioId });
    await this.repo.salvar(padrao);
    // Releitura: sob concorrência, quem perdeu o INSERT precisa da linha real.
    return (await this.repo.buscarPorUsuario(usuarioId)) ?? padrao;
  }
}

export interface EnviarNotificacaoInput {
  usuarioId: string;
  categoria: CategoriaDeNotificacao;
  titulo: string;
  corpo: string;
  tituloDiscreto?: string;
  corpoDiscreto?: string;
  /**
   * Identidade lógica do aviso (ex.: `assinatura:ATIVA`). Duas notificações com a mesma
   * chave dentro da janela anti-spam só saem uma vez por canal externo.
   */
  chaveDeAgrupamento: string;
}

export interface NotificacaoDespachadaView {
  notificacaoId: string;
  status: StatusNotificacao;
  canaisDespachados: CanalDeNotificacao[];
}

/**
 * Serviço ÚNICO de notificação do Core (doc 04 §15).
 *
 * Nenhum módulo despacha por conta própria: todos publicam eventos, e é aqui que
 * preferências, Modo Discreto, horário de silêncio e anti-spam decidem o que sai.
 *
 * Invariante central: **silenciar nunca descarta**. A notificação é sempre persistida —
 * o silêncio só impede o envio externo, e o usuário a encontra na Central.
 */
export class EnviarNotificacaoService {
  constructor(
    private readonly preferencias: ResolverPreferenciaDeNotificacaoService,
    private readonly notificacoes: NotificacaoRepository,
    private readonly despachante: DespachanteDeNotificacao,
    private readonly antiSpam: RegistroDeIdempotenciaRepository,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(input: EnviarNotificacaoInput): Promise<NotificacaoDespachadaView> {
    const preferencia = await this.preferencias.executar(input.usuarioId);

    const chave = `notificacao:${input.usuarioId}:${input.chaveDeAgrupamento}`;
    const primeiraNaJanela = await this.antiSpam.registrarSeNova(chave, JANELA_ANTI_SPAM_SEGUNDOS);

    const decisao = PoliticaDeDespacho.decidir({
      preferencia,
      categoria: input.categoria,
      minutosDoDia: minutosDoDiaNoFuso(new Date(), preferencia.fusoHorario),
      repetida: !primeiraNaJanela,
    });

    const notificacao = Notificacao.criar({
      id: this.idGen.gerar(),
      usuarioId: input.usuarioId,
      categoria: input.categoria,
      titulo: input.titulo,
      corpo: input.corpo,
      tituloDiscreto: input.tituloDiscreto,
      corpoDiscreto: input.corpoDiscreto,
    });

    if (decisao.silenciada) {
      notificacao.marcarSilenciada();
      await this.notificacoes.salvar(notificacao);
      return this.resumir(notificacao);
    }

    // Persiste ANTES de despachar: um canal externo indisponível não pode fazer a
    // notificação sumir da Central.
    notificacao.marcarEnviada(decisao.canaisExternos);
    await this.notificacoes.salvar(notificacao);

    const entregues = await this.despachar(
      notificacao,
      decisao.canaisExternos,
      preferencia.modoDiscreto,
    );

    // Reconcilia o registro com o que de fato saiu — a Central não mente sobre o envio.
    if (entregues.length !== decisao.canaisExternos.length) {
      if (entregues.length === 0) {
        notificacao.marcarSilenciada();
      } else {
        notificacao.marcarEnviada(entregues);
      }
      await this.notificacoes.salvar(notificacao);
    }

    return this.resumir(notificacao);
  }

  /** Devolve os canais efetivamente entregues. Falha de canal nunca propaga (doc 04 §15). */
  private async despachar(
    notificacao: Notificacao,
    canais: CanalDeNotificacao[],
    modoDiscreto: boolean,
  ): Promise<CanalDeNotificacao[]> {
    // O conteúdo é resolvido AQUI: o despachante nunca vê o texto sensível quando o
    // Modo Discreto está ativo (doc 01 §15).
    const conteudo = notificacao.conteudo(modoDiscreto);
    const suportados = this.despachante.canaisSuportados();
    const entregues: CanalDeNotificacao[] = [];

    for (const canal of canais.filter((c) => suportados.includes(c))) {
      try {
        await this.despachante.despachar({
          usuarioId: notificacao.usuarioId,
          canal,
          categoria: notificacao.categoria,
          conteudo,
        });
        entregues.push(canal);
      } catch {
        // Provedor externo fora do ar não pode derrubar a operação de negócio que
        // originou o aviso (ex.: cancelar assinatura). A notificação segue na Central.
      }
    }
    return entregues;
  }

  private resumir(notificacao: Notificacao): NotificacaoDespachadaView {
    return {
      notificacaoId: notificacao.id,
      status: notificacao.status,
      canaisDespachados: notificacao.canaisDespachados,
    };
  }
}
