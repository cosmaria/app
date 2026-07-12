import { AcessoNegadoError } from '@cosmaria/core-domain';
import { UnidadeDeDose, ViaDeAdministracao } from './catalogos';

export interface RegistroDeUsoProps {
  id: string;
  usuarioId: string;
  produtoId: string;
  /** Quantidade da dose, na `unidade` informada. */
  quantidade: number;
  unidade: UnidadeDeDose;
  via: ViaDeAdministracao;
  /** Momento em que a dose foi tomada — a espinha da correlação dose × sintoma (doc 03 §8). */
  usadoEm: Date;
  observacoes: string | null;
  criadoEm: Date;
}

/**
 * RegistroDeUso — uma dose (doc 03 §5.2, doc 08 — Arquétipo B, histórico imutável).
 *
 * **Append-only**: uma dose registrada não se edita nem se apaga; corrigir é registrar
 * outra. O agregado não expõe `atualizar` de propósito — a série clínica precisa refletir
 * o que de fato aconteceu, não uma versão retocada.
 */
export class RegistroDeUso {
  private constructor(private readonly props: RegistroDeUsoProps) {}

  static reconstituir(props: RegistroDeUsoProps): RegistroDeUso {
    return new RegistroDeUso(props);
  }

  static registrar(params: {
    id: string;
    usuarioId: string;
    produtoId: string;
    quantidade: number;
    unidade: UnidadeDeDose;
    via: ViaDeAdministracao;
    usadoEm?: Date;
    observacoes?: string | null;
    criadoEm?: Date;
  }): RegistroDeUso {
    const agora = params.criadoEm ?? new Date();
    return new RegistroDeUso({
      id: params.id,
      usuarioId: params.usuarioId,
      produtoId: params.produtoId,
      quantidade: params.quantidade,
      unidade: params.unidade,
      via: params.via,
      usadoEm: params.usadoEm ?? agora,
      observacoes: params.observacoes ?? null,
      criadoEm: agora,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get produtoId(): string {
    return this.props.produtoId;
  }
  get quantidade(): number {
    return this.props.quantidade;
  }
  get unidade(): UnidadeDeDose {
    return this.props.unidade;
  }
  get via(): ViaDeAdministracao {
    return this.props.via;
  }
  get usadoEm(): Date {
    return this.props.usadoEm;
  }
  get observacoes(): string | null {
    return this.props.observacoes;
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
