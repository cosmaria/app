export enum StatusExportacao {
  PENDENTE = 'PENDENTE',
  PRONTA = 'PRONTA',
  EXPIRADA = 'EXPIRADA',
}

export interface SolicitacaoDeExportacaoProps {
  id: string;
  usuarioId: string;
  status: StatusExportacao;
  /** Link para baixar o pacote quando PRONTA (gerado por job assíncrono — doc 04 §21.3). */
  urlDownload: string | null;
  solicitadoEm: Date;
  concluidoEm: Date | null;
}

/**
 * SolicitaçãoDeExportação (portabilidade LGPD Art. 18, doc 04 §21.3).
 * O Core registra a solicitação e publica o evento; cada módulo contribui sua fatia
 * de dados de forma assíncrona. Este agregado rastreia o status até o pacote ficar pronto.
 */
export class SolicitacaoDeExportacao {
  private constructor(private readonly props: SolicitacaoDeExportacaoProps) {}

  static reconstituir(props: SolicitacaoDeExportacaoProps): SolicitacaoDeExportacao {
    return new SolicitacaoDeExportacao(props);
  }

  static criar(params: {
    id: string;
    usuarioId: string;
    solicitadoEm?: Date;
  }): SolicitacaoDeExportacao {
    return new SolicitacaoDeExportacao({
      id: params.id,
      usuarioId: params.usuarioId,
      status: StatusExportacao.PENDENTE,
      urlDownload: null,
      solicitadoEm: params.solicitadoEm ?? new Date(),
      concluidoEm: null,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get status(): StatusExportacao {
    return this.props.status;
  }
  get urlDownload(): string | null {
    return this.props.urlDownload;
  }
  get solicitadoEm(): Date {
    return this.props.solicitadoEm;
  }
  get concluidoEm(): Date | null {
    return this.props.concluidoEm;
  }

  marcarPronta(urlDownload: string, agora: Date = new Date()): void {
    this.props.status = StatusExportacao.PRONTA;
    this.props.urlDownload = urlDownload;
    this.props.concluidoEm = agora;
  }
}
