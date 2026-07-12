import type { IdGenerator } from '@cosmaria/core-application';
import {
  ContextoDeApp,
  Escopo,
  ehContextoDeAppValido,
  ehEscopoValido,
  type DomainEvent,
} from '@cosmaria/core-domain';
import { PublicacaoComunidade } from '@cosmaria/comunidade-domain';
import type { PublicacaoComunidadeRepository } from '../ports/comunidade.repositories';

/**
 * Contrato duck-typed do evento de publicação (Grow: `GrowlogPublicado`; Med:
 * `PublicacaoComunidadeMedCriada`). A Comunidade NÃO importa as classes de evento de
 * Grow/Med (proibido por lint, doc 04 §24): lê o payload por esta interface local, que é
 * a fronteira anticorrupção — mesmo padrão do Adaptador de Ingestão da IA.
 */
interface EventoDePublicacaoRecebido extends DomainEvent {
  perfilPublicoId: string;
  contexto: string;
  modulo: string;
  tipoConteudo: string;
  conteudoId: string;
  escopo: string;
  titulo?: string | null;
  resumo?: string | null;
  dimensoes?: Record<string, string>;
  publicadoEm?: Date;
}

function ehEventoDePublicacao(evento: DomainEvent): evento is EventoDePublicacaoRecebido {
  const e = evento as Partial<EventoDePublicacaoRecebido>;
  return (
    typeof e.perfilPublicoId === 'string' &&
    typeof e.contexto === 'string' &&
    typeof e.modulo === 'string' &&
    typeof e.tipoConteudo === 'string' &&
    typeof e.conteudoId === 'string' &&
    typeof e.escopo === 'string'
  );
}

/**
 * Projeta os eventos de publicação de Grow e Med na projeção de leitura da Comunidade
 * (doc 06 §8, doc 04 §9.1). É um CONSUMIDOR do barramento: assina por nome no boot
 * (`ComunidadeModule.onModuleInit`), como a Auditoria e a IA.
 *
 * Idempotente por construção: reprojetar o mesmo conteúdo (reentrega de evento ou
 * republicação) atualiza a publicação existente em vez de criar outra (doc 06 §Riscos).
 */
export class ProjetarPublicacaoService {
  /** Nomes de evento que viram publicação — Grow e Med, um por app (doc 06 §Eventos). */
  static readonly EVENTOS_PROJETADOS = ['GrowlogPublicado', 'PublicacaoComunidadeMedCriada'];

  constructor(
    private readonly repo: PublicacaoComunidadeRepository,
    private readonly idGen: IdGenerator,
  ) {}

  async projetar(evento: DomainEvent): Promise<void> {
    if (!ehEventoDePublicacao(evento)) {
      return;
    }
    if (!ehContextoDeAppValido(evento.contexto) || !ehEscopoValido(evento.escopo)) {
      return;
    }
    const contexto = evento.contexto as ContextoDeApp;
    const escopo = evento.escopo as Escopo;

    const existente = await this.repo.buscarPorReferencia(evento.modulo, evento.conteudoId);
    if (existente) {
      existente.atualizarConteudo({
        escopo,
        titulo: evento.titulo ?? null,
        resumo: evento.resumo ?? null,
        dimensoes: evento.dimensoes ?? {},
      });
      await this.repo.salvar(existente);
      return;
    }

    const publicacao = PublicacaoComunidade.criar({
      id: this.idGen.gerar(),
      perfilPublicoId: evento.perfilPublicoId,
      contexto,
      referencia: {
        modulo: evento.modulo,
        tipoConteudo: evento.tipoConteudo,
        conteudoId: evento.conteudoId,
      },
      escopo,
      titulo: evento.titulo ?? null,
      resumo: evento.resumo ?? null,
      dimensoes: evento.dimensoes ?? {},
      publicadoEm: evento.publicadoEm ?? evento.ocorridoEm,
    });
    await this.repo.salvar(publicacao);
  }
}
