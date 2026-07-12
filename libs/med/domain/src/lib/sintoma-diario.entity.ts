import { AcessoNegadoError } from '@cosmaria/core-domain';
import { SintomaDiarioSemMedicaoError } from './errors/med.errors';

/**
 * As dimensões de bem-estar da linha de base (doc 03 §5.3). Escala 0–10, todas opcionais:
 * o paciente registra em segundos o que faz sentido no dia, sem obrigação de preencher tudo.
 */
export interface MedicoesDeBemEstar {
  humor: number | null;
  ansiedade: number | null;
  dor: number | null;
  sono: number | null;
  apetite: number | null;
}

export interface RegistroDeSintomaDiarioProps extends MedicoesDeBemEstar {
  id: string;
  usuarioId: string;
  /** Momento do check-in — posiciona o ponto na linha de base longitudinal (doc 03 §5.3). */
  registradoEm: Date;
  observacoes: string | null;
  criadoEm: Date;
}

const DIMENSOES: (keyof MedicoesDeBemEstar)[] = ['humor', 'ansiedade', 'dor', 'sono', 'apetite'];

/**
 * RegistroDeSintomaDiario — linha de base diária (doc 03 §5.3, doc 08 — Arquétipo B).
 *
 * **Append-only**: cada check-in é um ponto imutável na série, mesmo em dias sem uso de
 * produto. É o que sustenta a visão longitudinal de bem-estar — o diferencial do Med sobre
 * apps focados só na sessão de consumo. Um check-in sem nenhuma medição é ruído, não registro.
 */
export class RegistroDeSintomaDiario {
  private constructor(private readonly props: RegistroDeSintomaDiarioProps) {}

  static reconstituir(props: RegistroDeSintomaDiarioProps): RegistroDeSintomaDiario {
    return new RegistroDeSintomaDiario(props);
  }

  static registrar(params: {
    id: string;
    usuarioId: string;
    humor?: number | null;
    ansiedade?: number | null;
    dor?: number | null;
    sono?: number | null;
    apetite?: number | null;
    registradoEm?: Date;
    observacoes?: string | null;
    criadoEm?: Date;
  }): RegistroDeSintomaDiario {
    const agora = params.criadoEm ?? new Date();
    const props: RegistroDeSintomaDiarioProps = {
      id: params.id,
      usuarioId: params.usuarioId,
      humor: params.humor ?? null,
      ansiedade: params.ansiedade ?? null,
      dor: params.dor ?? null,
      sono: params.sono ?? null,
      apetite: params.apetite ?? null,
      registradoEm: params.registradoEm ?? agora,
      observacoes: params.observacoes ?? null,
      criadoEm: agora,
    };
    if (DIMENSOES.every((d) => props[d] === null)) {
      throw new SintomaDiarioSemMedicaoError();
    }
    return new RegistroDeSintomaDiario(props);
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get humor(): number | null {
    return this.props.humor;
  }
  get ansiedade(): number | null {
    return this.props.ansiedade;
  }
  get dor(): number | null {
    return this.props.dor;
  }
  get sono(): number | null {
    return this.props.sono;
  }
  get apetite(): number | null {
    return this.props.apetite;
  }
  get registradoEm(): Date {
    return this.props.registradoEm;
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
