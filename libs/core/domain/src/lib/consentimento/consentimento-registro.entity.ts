import type { TipoConsentimento } from './tipo-consentimento';

export interface ConsentimentoRegistroProps {
  id: string;
  usuarioId: string;
  tipo: TipoConsentimento;
  /** Versão do texto aceito — permite auditar QUAL texto o usuário consentiu. */
  versaoTexto: string;
  concedidoEm: Date;
  /** Nulo enquanto vigente; preenchido ao revogar (nunca sobrescreve — doc 08 §12.1). */
  revogadoEm: Date | null;
}

/**
 * ConsentimentoRegistro (doc 04 §21.1, doc 08 §12.1). É o próprio mecanismo de
 * versionamento: revogar NÃO apaga — cria o estado revogado, preservando o histórico.
 */
export class ConsentimentoRegistro {
  private constructor(private readonly props: ConsentimentoRegistroProps) {}

  static reconstituir(props: ConsentimentoRegistroProps): ConsentimentoRegistro {
    return new ConsentimentoRegistro(props);
  }

  static conceder(params: {
    id: string;
    usuarioId: string;
    tipo: TipoConsentimento;
    versaoTexto: string;
    concedidoEm?: Date;
  }): ConsentimentoRegistro {
    return new ConsentimentoRegistro({
      id: params.id,
      usuarioId: params.usuarioId,
      tipo: params.tipo,
      versaoTexto: params.versaoTexto,
      concedidoEm: params.concedidoEm ?? new Date(),
      revogadoEm: null,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get tipo(): TipoConsentimento {
    return this.props.tipo;
  }
  get versaoTexto(): string {
    return this.props.versaoTexto;
  }
  get concedidoEm(): Date {
    return this.props.concedidoEm;
  }
  get revogadoEm(): Date | null {
    return this.props.revogadoEm;
  }

  estaVigente(): boolean {
    return this.props.revogadoEm === null;
  }

  revogar(agora: Date = new Date()): void {
    if (this.props.revogadoEm === null) {
      this.props.revogadoEm = agora;
    }
  }
}
