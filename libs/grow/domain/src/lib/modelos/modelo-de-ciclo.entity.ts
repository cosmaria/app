import { AcessoNegadoError } from '@cosmaria/core-domain';
import type { FaseDeVida } from '../catalogos';

export interface ModeloDeCicloProps {
  id: string;
  usuarioId: string;
  nome: string;
  /** Ambiente padrão sugerido pelo template (opcional). Referência fraca: se o ambiente
   *  for excluído, vira null — o template continua útil, o usuário só re-escolhe. */
  ambienteId: string | null;
  /** Genética padrão sugerida (opcional). Mesma referência fraca. */
  geneticaId: string | null;
  faseInicial: FaseDeVida | null;
  /** Rotina padrão do ciclo — texto livre (checklist/observações reutilizáveis). */
  rotinaPadrao: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * ModeloDeCiclo (doc 02 §7, doc 08 §289 — Arquétipo A, funcionalidade **Premium**).
 *
 * Template **nomeado e reutilizável** de configuração de ciclo (ambiente/genética/rotina
 * padrão), distinto de simplesmente clonar o último ciclo: o clone copia um ciclo real;
 * o modelo é uma receita nomeada que o usuário mantém e reaproveita. O gate de Premium é
 * responsabilidade do caso de uso (via PREMIUM_PUBLIC_API), não desta entidade.
 */
export class ModeloDeCiclo {
  private constructor(private readonly props: ModeloDeCicloProps) {}

  static reconstituir(props: ModeloDeCicloProps): ModeloDeCiclo {
    return new ModeloDeCiclo(props);
  }

  static criar(params: {
    id: string;
    usuarioId: string;
    nome: string;
    ambienteId?: string | null;
    geneticaId?: string | null;
    faseInicial?: FaseDeVida | null;
    rotinaPadrao?: string | null;
    criadoEm?: Date;
  }): ModeloDeCiclo {
    const agora = params.criadoEm ?? new Date();
    return new ModeloDeCiclo({
      id: params.id,
      usuarioId: params.usuarioId,
      nome: params.nome.trim(),
      ambienteId: params.ambienteId ?? null,
      geneticaId: params.geneticaId ?? null,
      faseInicial: params.faseInicial ?? null,
      rotinaPadrao: params.rotinaPadrao ?? null,
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get nome(): string {
    return this.props.nome;
  }
  get ambienteId(): string | null {
    return this.props.ambienteId;
  }
  get geneticaId(): string | null {
    return this.props.geneticaId;
  }
  get faseInicial(): FaseDeVida | null {
    return this.props.faseInicial;
  }
  get rotinaPadrao(): string | null {
    return this.props.rotinaPadrao;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
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
