export interface SessaoDeAutenticacaoProps {
  id: string;
  usuarioId: string;
  /** Guarda o HASH do refresh token, nunca o valor bruto (segurança, doc 08 §14). */
  refreshTokenHash: string;
  expiraEm: Date;
  revogadaEm: Date | null;
  criadoEm: Date;
}

/**
 * Entidade SessaoDeAutenticacao (doc 08 §14 — vida curta, Arquétipo E).
 * Representa um refresh token emitido. É revogada na rotação (refresh) e no logout.
 * Nunca armazena o refresh token em claro — só seu hash.
 */
export class SessaoDeAutenticacao {
  private constructor(private readonly props: SessaoDeAutenticacaoProps) {}

  static reconstituir(props: SessaoDeAutenticacaoProps): SessaoDeAutenticacao {
    return new SessaoDeAutenticacao(props);
  }

  static criar(params: {
    id: string;
    usuarioId: string;
    refreshTokenHash: string;
    expiraEm: Date;
    criadoEm?: Date;
  }): SessaoDeAutenticacao {
    return new SessaoDeAutenticacao({
      id: params.id,
      usuarioId: params.usuarioId,
      refreshTokenHash: params.refreshTokenHash,
      expiraEm: params.expiraEm,
      revogadaEm: null,
      criadoEm: params.criadoEm ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get usuarioId(): string {
    return this.props.usuarioId;
  }

  get refreshTokenHash(): string {
    return this.props.refreshTokenHash;
  }

  get expiraEm(): Date {
    return this.props.expiraEm;
  }

  get revogadaEm(): Date | null {
    return this.props.revogadaEm;
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  estaValida(agora: Date = new Date()): boolean {
    return this.props.revogadaEm === null && this.props.expiraEm.getTime() > agora.getTime();
  }

  revogar(agora: Date = new Date()): void {
    if (this.props.revogadaEm === null) {
      this.props.revogadaEm = agora;
    }
  }
}
