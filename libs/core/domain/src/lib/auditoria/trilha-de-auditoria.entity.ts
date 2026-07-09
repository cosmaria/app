export interface TrilhaDeAuditoriaProps {
  id: string;
  /** Entidade afetada (ex.: 'ConfiguracaoDeCompartilhamento', 'ConsentimentoRegistro'). */
  entidadeAfetada: string;
  entidadeId: string | null;
  /** Ação/tipo de mudança (ex.: 'ALTERADA', 'CONCEDIDO', 'REVOGADO', 'EXCLUSAO_SOLICITADA'). */
  acao: string;
  /** Quem causou a mudança (usuarioId), ou null se foi o sistema. */
  autorId: string | null;
  /** Resumo do valor anterior/novo — nunca o dado sensível bruto (doc 08 §7). */
  detalhe: Record<string, unknown>;
  registradoEm: Date;
}

/**
 * TrilhaDeAuditoria (doc 08 §7) — mecanismo ÚNICO de auditoria, append-only.
 * Aplicado a qualquer entidade crítica (doc 08 §14): consentimento, compartilhamento,
 * assinatura, vínculo de perfis. Nunca é alterada nem apagada depois de registrada.
 */
export class TrilhaDeAuditoria {
  private constructor(private readonly props: TrilhaDeAuditoriaProps) {}

  static reconstituir(props: TrilhaDeAuditoriaProps): TrilhaDeAuditoria {
    return new TrilhaDeAuditoria(props);
  }

  static registrar(params: {
    id: string;
    entidadeAfetada: string;
    entidadeId?: string | null;
    acao: string;
    autorId?: string | null;
    detalhe?: Record<string, unknown>;
    registradoEm?: Date;
  }): TrilhaDeAuditoria {
    return new TrilhaDeAuditoria({
      id: params.id,
      entidadeAfetada: params.entidadeAfetada,
      entidadeId: params.entidadeId ?? null,
      acao: params.acao,
      autorId: params.autorId ?? null,
      detalhe: params.detalhe ?? {},
      registradoEm: params.registradoEm ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }
  get entidadeAfetada(): string {
    return this.props.entidadeAfetada;
  }
  get entidadeId(): string | null {
    return this.props.entidadeId;
  }
  get acao(): string {
    return this.props.acao;
  }
  get autorId(): string | null {
    return this.props.autorId;
  }
  get detalhe(): Record<string, unknown> {
    return this.props.detalhe;
  }
  get registradoEm(): Date {
    return this.props.registradoEm;
  }
}
