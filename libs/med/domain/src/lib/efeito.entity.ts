import { AcessoNegadoError } from '@cosmaria/core-domain';
import { TipoDeEfeito } from './catalogos';

export interface RegistroDeEfeitoProps {
  id: string;
  usuarioId: string;
  /** A dose que produziu o efeito (0—N: uma dose pode ter vários efeitos). */
  registroDeUsoId: string;
  tipo: TipoDeEfeito;
  descricao: string;
  /** Intensidade percebida (escala 0–10), quando o paciente quer registrá-la. */
  intensidade: number | null;
  duracaoMinutos: number | null;
  registradoEm: Date;
  criadoEm: Date;
}

/**
 * RegistroDeEfeito — efeito positivo ou adverso de uma dose (doc 03 §5.5, doc 08 —
 * Arquétipo B, append-only). É o que permite à IA identificar padrões de efeito adverso
 * (ex.: um produto consistentemente associado a boca seca) — mas a *interpretação* é da IA
 * (doc 03 §8); aqui só se registra o fato.
 */
export class RegistroDeEfeito {
  private constructor(private readonly props: RegistroDeEfeitoProps) {}

  static reconstituir(props: RegistroDeEfeitoProps): RegistroDeEfeito {
    return new RegistroDeEfeito(props);
  }

  static registrar(params: {
    id: string;
    usuarioId: string;
    registroDeUsoId: string;
    tipo: TipoDeEfeito;
    descricao: string;
    intensidade?: number | null;
    duracaoMinutos?: number | null;
    registradoEm?: Date;
    criadoEm?: Date;
  }): RegistroDeEfeito {
    const agora = params.criadoEm ?? new Date();
    return new RegistroDeEfeito({
      id: params.id,
      usuarioId: params.usuarioId,
      registroDeUsoId: params.registroDeUsoId,
      tipo: params.tipo,
      descricao: params.descricao.trim(),
      intensidade: params.intensidade ?? null,
      duracaoMinutos: params.duracaoMinutos ?? null,
      registradoEm: params.registradoEm ?? agora,
      criadoEm: agora,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get registroDeUsoId(): string {
    return this.props.registroDeUsoId;
  }
  get tipo(): TipoDeEfeito {
    return this.props.tipo;
  }
  get descricao(): string {
    return this.props.descricao;
  }
  get intensidade(): number | null {
    return this.props.intensidade;
  }
  get duracaoMinutos(): number | null {
    return this.props.duracaoMinutos;
  }
  get registradoEm(): Date {
    return this.props.registradoEm;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  pertenceA(usuarioId: string): boolean {
    return this.props.usuarioId === usuarioId;
  }

  garantirAutoria(usuarioId: string): void {
    if (!this.pertenceA(usuarioId)) {
      throw new AcessoNegadoError();
    }
  }
}
