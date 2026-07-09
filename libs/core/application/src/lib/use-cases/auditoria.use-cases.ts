import {
  ConfiguracaoDeCompartilhamentoAlterada,
  ConsentimentoAlterado,
  ContaExclusaoSolicitada,
  type DomainEvent,
  ExportacaoDadosSolicitada,
  TrilhaDeAuditoria,
  VinculoDePerfisAutorizado,
  VinculoDePerfisRevogado,
} from '@cosmaria/core-domain';
import { IdGenerator } from '../ports/id-generator.port';
import { TrilhaDeAuditoriaRepository } from '../ports/trilha-de-auditoria.repository';

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
    if (evento instanceof ConfiguracaoDeCompartilhamentoAlterada) {
      return TrilhaDeAuditoria.registrar({
        id,
        entidadeAfetada: 'ConfiguracaoDeCompartilhamento',
        entidadeId: evento.configuracaoId,
        acao: 'ALTERADA',
        autorId: evento.autorId,
        detalhe: {
          modulo: evento.modulo,
          tipoConteudo: evento.tipoConteudo,
          conteudoId: evento.conteudoId,
        },
      });
    }
    if (evento instanceof ConsentimentoAlterado) {
      return TrilhaDeAuditoria.registrar({
        id,
        entidadeAfetada: 'ConsentimentoRegistro',
        acao: evento.concedido ? 'CONCEDIDO' : 'REVOGADO',
        autorId: evento.usuarioId,
        detalhe: { tipo: evento.tipo },
      });
    }
    if (evento instanceof ContaExclusaoSolicitada) {
      return TrilhaDeAuditoria.registrar({
        id,
        entidadeAfetada: 'Usuario',
        entidadeId: evento.usuarioId,
        acao: 'EXCLUSAO_SOLICITADA',
        autorId: evento.usuarioId,
      });
    }
    if (evento instanceof ExportacaoDadosSolicitada) {
      return TrilhaDeAuditoria.registrar({
        id,
        entidadeAfetada: 'SolicitacaoDeExportacao',
        entidadeId: evento.solicitacaoId,
        acao: 'SOLICITADA',
        autorId: evento.usuarioId,
      });
    }
    if (evento instanceof VinculoDePerfisAutorizado) {
      return TrilhaDeAuditoria.registrar({
        id,
        entidadeAfetada: 'RegistroDeVinculoDePerfis',
        entidadeId: evento.vinculoId,
        acao: 'AUTORIZADO',
        autorId: evento.usuarioId,
        // Só a quantidade: os ids dos perfis não entram na trilha, senão ela própria
        // viraria o cruzamento de contextos que o doc 06 §13 proíbe.
        detalhe: { quantidadePerfis: evento.quantidadePerfis },
      });
    }
    if (evento instanceof VinculoDePerfisRevogado) {
      return TrilhaDeAuditoria.registrar({
        id,
        entidadeAfetada: 'RegistroDeVinculoDePerfis',
        entidadeId: evento.vinculoId,
        acao: 'REVOGADO',
        autorId: evento.usuarioId,
      });
    }
    return null;
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
