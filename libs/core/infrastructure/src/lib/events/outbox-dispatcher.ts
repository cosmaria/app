import type { OutboxRegistro, OutboxRepository } from '@cosmaria/core-application';
import type { DomainEvent } from '@cosmaria/core-domain';
import type { InProcessEventPublisher } from './in-process-event-publisher';

/** Log mínimo, sem acoplar a IA de framework — o apps/api liga a um Logger do Nest. */
export interface RegistradorDeOutbox {
  info(mensagem: string): void;
  erro(mensagem: string): void;
}

export interface OutboxDispatcherConfig {
  /** Intervalo do polling (ms). */
  intervaloMs: number;
  /** Máximo de linhas por tick. */
  lote: number;
  /** Tentativas antes do dead-letter. */
  maxTentativas: number;
  /** Base do backoff exponencial (ms). */
  backoffBaseMs: number;
  /** Teto do backoff (ms). */
  backoffTetoMs: number;
}

export const CONFIG_OUTBOX_PADRAO: OutboxDispatcherConfig = {
  intervaloMs: 1000,
  lote: 50,
  maxTentativas: 8,
  backoffBaseMs: 1000,
  backoffTetoMs: 5 * 60_000,
};

const REGISTRADOR_SILENCIOSO: RegistradorDeOutbox = {
  info: () => undefined,
  erro: () => undefined,
};

const ISO_8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/;

/** Revive strings ISO-8601 do payload (JSONB) de volta para `Date`, como no caminho síncrono. */
function reviverDatas(payload: Record<string, unknown>): Record<string, unknown> {
  const revivido: Record<string, unknown> = {};
  for (const [chave, valor] of Object.entries(payload)) {
    revivido[chave] = typeof valor === 'string' && ISO_8601.test(valor) ? new Date(valor) : valor;
  }
  return revivido;
}

/**
 * Despachante do outbox (doc 04 §9) — o motor da entrega assíncrona e durável.
 *
 * Faz *polling* das linhas devidas e entrega cada evento aos seus assinantes pendentes,
 * **por assinante** (`registro.entregarPara`): quem já teve sucesso nunca é reinvocado
 * (isolamento), e só o que falhou é reprogramado com backoff exponencial; ao estourar o
 * limite de tentativas, a linha vira dead-letter (MORTO) e permanece para inspeção. Um tick
 * nunca se sobrepõe a outro (flag de reentrância). É framework-agnóstico: o apps/api controla
 * o ciclo de vida (`iniciar`/`parar`) via OnModuleInit/OnModuleDestroy.
 */
export class OutboxDispatcher {
  private timer: ReturnType<typeof setInterval> | null = null;
  private rodando = false;
  private loteEmAndamento: Promise<void> = Promise.resolve();

  constructor(
    private readonly outbox: OutboxRepository,
    private readonly registro: Pick<InProcessEventPublisher, 'entregarPara'>,
    private readonly config: OutboxDispatcherConfig = CONFIG_OUTBOX_PADRAO,
    private readonly log: RegistradorDeOutbox = REGISTRADOR_SILENCIOSO,
    private readonly agora: () => Date = () => new Date(),
  ) {}

  /** Inicia o polling periódico. Idempotente. */
  iniciar(): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.loteEmAndamento = this.processarLote();
    }, this.config.intervaloMs);
    // Não segura o event loop no encerramento do processo (ex.: testes, shutdown).
    // (unref existe no Timeout do Node; sob a lib DOM o tipo é `number` e não o expõe.)
    (this.timer as { unref?: () => void }).unref?.();
  }

  /** Para o polling e aguarda o lote em andamento drenar (evita tocar no pool já fechado). */
  async parar(): Promise<void> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    await this.loteEmAndamento.catch(() => undefined);
  }

  /**
   * Processa um lote de eventos devidos. Público para os testes exercitarem um tick sem
   * depender do relógio. Protegido contra reentrância — um tick lento não dispara paralelo.
   */
  async processarLote(): Promise<void> {
    if (this.rodando) return;
    this.rodando = true;
    try {
      const devidos = await this.outbox.buscarDevidos(this.config.lote, this.agora());
      for (const registro of devidos) {
        await this.entregar(registro);
      }
    } catch (erro) {
      this.log.erro(`outbox: falha no lote — ${mensagemDeErro(erro)}`);
    } finally {
      this.rodando = false;
    }
  }

  private async entregar(registro: OutboxRegistro): Promise<void> {
    const evento = this.reconstruir(registro);
    const falhados: string[] = [];
    let ultimoErro = '';

    for (const assinanteId of registro.pendentes) {
      try {
        await this.registro.entregarPara(assinanteId, evento);
      } catch (erro) {
        falhados.push(assinanteId);
        ultimoErro = `${assinanteId}: ${mensagemDeErro(erro)}`;
      }
    }

    if (falhados.length === 0) {
      await this.outbox.marcarEntregue(registro.id);
      return;
    }

    const tentativas = registro.tentativas + 1;
    if (tentativas >= this.config.maxTentativas) {
      this.log.erro(
        `outbox: dead-letter ${registro.nome} (${registro.id}) após ${tentativas} tentativas — ${ultimoErro}`,
      );
      await this.outbox.marcarMorto(registro.id, falhados, ultimoErro);
      return;
    }

    const proximaEm = new Date(this.agora().getTime() + this.backoff(tentativas));
    this.log.info(
      `outbox: reprograma ${registro.nome} (${registro.id}), tentativa ${tentativas}, pendentes=[${falhados.join(',')}]`,
    );
    await this.outbox.reprogramar(registro.id, falhados, tentativas, proximaEm, ultimoErro);
  }

  /** Backoff exponencial com teto: base·2^(tentativas-1), limitado ao teto. */
  private backoff(tentativas: number): number {
    return Math.min(this.config.backoffBaseMs * 2 ** (tentativas - 1), this.config.backoffTetoMs);
  }

  private reconstruir(registro: OutboxRegistro): DomainEvent {
    return {
      ...reviverDatas(registro.payload),
      nome: registro.nome,
      ocorridoEm: registro.ocorridoEm,
      id: registro.id,
    } as DomainEvent;
  }
}

function mensagemDeErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : String(erro);
}
