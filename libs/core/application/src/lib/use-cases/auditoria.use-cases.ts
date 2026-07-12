import { type DomainEvent, TrilhaDeAuditoria } from '@cosmaria/core-domain';
import { IdGenerator } from '../ports/id-generator.port';
import { TrilhaDeAuditoriaRepository } from '../ports/trilha-de-auditoria.repository';

/**
 * Contratos de payload dos eventos auditados (espelham o Catálogo de Domínio). Lidos por
 * NOME, nunca por `instanceof`: o barramento é durável (outbox) e entrega o evento como
 * objeto de contrato — a classe original se perde na (des)serialização. É a mesma fronteira
 * anticorrupção da IA (doc 04 §24), e o que torna o consumidor transport-agnóstico (§16.1).
 */
interface EvConfig extends DomainEvent {
  configuracaoId: string;
  autorId: string;
  modulo: string;
  tipoConteudo: string;
  conteudoId: string;
}
interface EvConsentimento extends DomainEvent {
  usuarioId: string;
  tipo: string;
  concedido: boolean;
}
interface EvContaExclusao extends DomainEvent {
  usuarioId: string;
}
interface EvExportacao extends DomainEvent {
  usuarioId: string;
  solicitacaoId: string;
}
interface EvVinculoAutorizado extends DomainEvent {
  vinculoId: string;
  usuarioId: string;
  quantidadePerfis: number;
}
interface EvVinculoRevogado extends DomainEvent {
  vinculoId: string;
  usuarioId: string;
}
interface EvAssinatura extends DomainEvent {
  assinaturaId: string;
  usuarioId: string;
  statusAnterior: string;
  statusNovo: string;
  plano: string;
}

/**
 * Assinante que traduz eventos de domínio em entradas de TrilhaDeAuditoria (doc 08 §7).
 * É o PRIMEIRO consumidor do barramento de eventos: fecha o requisito de auditoria
 * obrigatória de mudança de ConfiguraçãoDeCompartilhamento/Consentimento (doc 04 §21).
 */
export class RegistrarNaTrilhaDeAuditoriaService {
  /** Nomes de evento auditados — o composition root registra as assinaturas a partir daqui. */
  static readonly EVENTOS_AUDITADOS = [
    'ConfiguracaoDeCompartilhamentoAlterada',
    'ConsentimentoAlterado',
    'ContaExclusaoSolicitada',
    'ExportacaoDadosSolicitada',
    'VinculoDePerfisAutorizado',
    'VinculoDePerfisRevogado',
    'AssinaturaAtualizada',
  ];

  constructor(
    private readonly repo: TrilhaDeAuditoriaRepository,
    private readonly idGen: IdGenerator,
  ) {}

  async registrar(evento: DomainEvent): Promise<void> {
    const entrada = this.mapear(evento);
    if (entrada) {
      await this.repo.registrar(entrada);
    }
  }

  private mapear(evento: DomainEvent): TrilhaDeAuditoria | null {
    const id = this.idGen.gerar();
    switch (evento.nome) {
      case 'ConfiguracaoDeCompartilhamentoAlterada': {
        const e = evento as EvConfig;
        return TrilhaDeAuditoria.registrar({
          id,
          entidadeAfetada: 'ConfiguracaoDeCompartilhamento',
          entidadeId: e.configuracaoId,
          acao: 'ALTERADA',
          autorId: e.autorId,
          detalhe: { modulo: e.modulo, tipoConteudo: e.tipoConteudo, conteudoId: e.conteudoId },
        });
      }
      case 'ConsentimentoAlterado': {
        const e = evento as EvConsentimento;
        return TrilhaDeAuditoria.registrar({
          id,
          entidadeAfetada: 'ConsentimentoRegistro',
          acao: e.concedido ? 'CONCEDIDO' : 'REVOGADO',
          autorId: e.usuarioId,
          detalhe: { tipo: e.tipo },
        });
      }
      case 'ContaExclusaoSolicitada': {
        const e = evento as EvContaExclusao;
        return TrilhaDeAuditoria.registrar({
          id,
          entidadeAfetada: 'Usuario',
          entidadeId: e.usuarioId,
          acao: 'EXCLUSAO_SOLICITADA',
          autorId: e.usuarioId,
        });
      }
      case 'ExportacaoDadosSolicitada': {
        const e = evento as EvExportacao;
        return TrilhaDeAuditoria.registrar({
          id,
          entidadeAfetada: 'SolicitacaoDeExportacao',
          entidadeId: e.solicitacaoId,
          acao: 'SOLICITADA',
          autorId: e.usuarioId,
        });
      }
      case 'VinculoDePerfisAutorizado': {
        const e = evento as EvVinculoAutorizado;
        return TrilhaDeAuditoria.registrar({
          id,
          entidadeAfetada: 'RegistroDeVinculoDePerfis',
          entidadeId: e.vinculoId,
          acao: 'AUTORIZADO',
          autorId: e.usuarioId,
          // Só a quantidade: os ids dos perfis não entram na trilha, senão ela própria
          // viraria o cruzamento de contextos que o doc 06 §13 proíbe.
          detalhe: { quantidadePerfis: e.quantidadePerfis },
        });
      }
      case 'VinculoDePerfisRevogado': {
        const e = evento as EvVinculoRevogado;
        return TrilhaDeAuditoria.registrar({
          id,
          entidadeAfetada: 'RegistroDeVinculoDePerfis',
          entidadeId: e.vinculoId,
          acao: 'REVOGADO',
          autorId: e.usuarioId,
        });
      }
      case 'AssinaturaAtualizada': {
        const e = evento as EvAssinatura;
        // Doc 08 §12.6: mudança de status tem implicação financeira — trilha obrigatória.
        return TrilhaDeAuditoria.registrar({
          id,
          entidadeAfetada: 'AssinaturaPremium',
          entidadeId: e.assinaturaId,
          acao: `STATUS_${e.statusNovo}`,
          autorId: e.usuarioId,
          detalhe: { statusAnterior: e.statusAnterior, plano: e.plano },
        });
      }
      default:
        return null;
    }
  }
}

export interface TrilhaView {
  entidadeAfetada: string;
  entidadeId: string | null;
  acao: string;
  autorId: string | null;
  detalhe: Record<string, unknown>;
  registradoEm: string;
}

/** Consulta a trilha de auditoria (Administrativa — doc 09 GET /v1/admin/trilha-auditoria). */
export class ConsultarTrilhaDeAuditoriaUseCase {
  constructor(private readonly repo: TrilhaDeAuditoriaRepository) {}

  async executar(limite = 100): Promise<TrilhaView[]> {
    const entradas = await this.repo.listar(limite);
    return entradas.map((e) => ({
      entidadeAfetada: e.entidadeAfetada,
      entidadeId: e.entidadeId,
      acao: e.acao,
      autorId: e.autorId,
      detalhe: e.detalhe,
      registradoEm: e.registradoEm.toISOString(),
    }));
  }
}
