import type {
  ConsentimentoRepository,
  SolicitacaoExportacaoRepository,
  TrilhaDeAuditoriaRepository,
} from '@cosmaria/core-application';
import type {
  ConsentimentoRegistro,
  SolicitacaoDeExportacao,
  TipoConsentimento,
  TrilhaDeAuditoria,
} from '@cosmaria/core-domain';

/**
 * Repositórios em memória de Consentimento/LGPD/Auditoria — mesmas portas do
 * Postgres (LSP, doc 04 §4). Usados em testes e dev local sem banco.
 */
export class InMemoryConsentimentoRepository implements ConsentimentoRepository {
  private readonly porId = new Map<string, ConsentimentoRegistro>();

  salvar(registro: ConsentimentoRegistro): Promise<void> {
    this.porId.set(registro.id, registro);
    return Promise.resolve();
  }
  listarPorUsuario(usuarioId: string): Promise<ConsentimentoRegistro[]> {
    return Promise.resolve([...this.porId.values()].filter((r) => r.usuarioId === usuarioId));
  }
  buscarVigente(usuarioId: string, tipo: TipoConsentimento): Promise<ConsentimentoRegistro | null> {
    const vigente = [...this.porId.values()].find(
      (r) => r.usuarioId === usuarioId && r.tipo === tipo && r.estaVigente(),
    );
    return Promise.resolve(vigente ?? null);
  }
}

export class InMemoryTrilhaDeAuditoriaRepository implements TrilhaDeAuditoriaRepository {
  private readonly entradas: TrilhaDeAuditoria[] = [];

  registrar(entrada: TrilhaDeAuditoria): Promise<void> {
    this.entradas.push(entrada);
    return Promise.resolve();
  }
  listar(limite: number): Promise<TrilhaDeAuditoria[]> {
    return Promise.resolve([...this.entradas].reverse().slice(0, limite));
  }
}

export class InMemorySolicitacaoExportacaoRepository implements SolicitacaoExportacaoRepository {
  private readonly porId = new Map<string, SolicitacaoDeExportacao>();

  salvar(solicitacao: SolicitacaoDeExportacao): Promise<void> {
    this.porId.set(solicitacao.id, solicitacao);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<SolicitacaoDeExportacao | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
}
