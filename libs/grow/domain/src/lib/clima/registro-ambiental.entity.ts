import { AcessoNegadoError } from '@cosmaria/core-domain';
import { arredondar, calcularDli, calcularVpdKpa } from './calculos-ambientais';

/**
 * Origem do registro (doc 08 §6). Existe desde o MVP mesmo que só `MANUAL` seja usado:
 * quando entrarem sensores IoT ou importação (doc 05 §16), nenhuma migração de schema
 * será necessária — só um valor diferente nesta coluna.
 */
export enum OrigemDoRegistro {
  MANUAL = 'MANUAL',
  SENSOR = 'SENSOR',
  IMPORTADO = 'IMPORTADO',
}

export function ehOrigemDoRegistroValida(valor: string): valor is OrigemDoRegistro {
  return (Object.values(OrigemDoRegistro) as string[]).includes(valor);
}

export interface RegistroAmbientalProps {
  id: string;
  usuarioId: string;
  cicloId: string;
  /**
   * Nulo quando a medição é do ambiente (temperatura, umidade), e preenchido quando é
   * específica de uma planta (pH/EC do substrato dela). É o que permite o "check-in
   * diário único" do doc 02 §4 sem duplicar a leitura de ar por planta.
   */
  plantaId: string | null;
  registradoEm: Date;
  origem: OrigemDoRegistro;

  // Medições brutas. Todas opcionais: o iniciante registra só temperatura e umidade.
  temperaturaC: number | null;
  umidadeRelativa: number | null;
  ph: number | null;
  ec: number | null;
  ppfd: number | null;
  horasDeLuz: number | null;

  // Derivados, calculados na criação a partir dos brutos acima.
  vpdKpa: number | null;
  dli: number | null;

  observacoes: string | null;
}

/**
 * RegistroAmbiental (doc 02 §5.6, doc 08 §12.2 — Arquétipo B, série temporal).
 *
 * **Append-only**: nenhuma escrita é um `UPDATE` (doc 08 §6). Corrigir uma medição é
 * registrar outra, com novo timestamp — o histórico do que o usuário observou naquele
 * momento é o dado, e reescrevê-lo falsificaria a série que a IA analisa.
 *
 * Os derivados (VPD, DLI) são calculados **uma vez, na criação**, e persistidos: as
 * fórmulas são determinísticas, e guardá-los evita recalcular a série inteira a cada
 * leitura ou comparação entre ciclos.
 */
export class RegistroAmbiental {
  private constructor(private readonly props: RegistroAmbientalProps) {}

  static reconstituir(props: RegistroAmbientalProps): RegistroAmbiental {
    return new RegistroAmbiental(props);
  }

  static registrar(params: {
    id: string;
    usuarioId: string;
    cicloId: string;
    plantaId?: string | null;
    registradoEm?: Date;
    origem?: OrigemDoRegistro;
    temperaturaC?: number | null;
    umidadeRelativa?: number | null;
    ph?: number | null;
    ec?: number | null;
    ppfd?: number | null;
    horasDeLuz?: number | null;
    deltaFolhaC?: number | null;
    observacoes?: string | null;
  }): RegistroAmbiental {
    const temperaturaC = params.temperaturaC ?? null;
    const umidadeRelativa = params.umidadeRelativa ?? null;
    const ppfd = params.ppfd ?? null;
    const horasDeLuz = params.horasDeLuz ?? null;

    // Derivado só existe quando TODOS os seus insumos existem. Um VPD calculado a partir
    // de umidade ausente seria um número inventado dentro de uma série científica.
    const vpdKpa =
      temperaturaC !== null && umidadeRelativa !== null
        ? arredondar(
            calcularVpdKpa({
              temperaturaC,
              umidadeRelativa,
              deltaFolhaC: params.deltaFolhaC ?? 0,
            }),
            3,
          )
        : null;

    const dli =
      ppfd !== null && horasDeLuz !== null
        ? arredondar(calcularDli({ ppfd, horasDeLuz }), 3)
        : null;

    return new RegistroAmbiental({
      id: params.id,
      usuarioId: params.usuarioId,
      cicloId: params.cicloId,
      plantaId: params.plantaId ?? null,
      registradoEm: params.registradoEm ?? new Date(),
      origem: params.origem ?? OrigemDoRegistro.MANUAL,
      temperaturaC,
      umidadeRelativa,
      ph: params.ph ?? null,
      ec: params.ec ?? null,
      ppfd,
      horasDeLuz,
      vpdKpa,
      dli,
      observacoes: params.observacoes ?? null,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get cicloId(): string {
    return this.props.cicloId;
  }
  get plantaId(): string | null {
    return this.props.plantaId;
  }
  get registradoEm(): Date {
    return this.props.registradoEm;
  }
  get origem(): OrigemDoRegistro {
    return this.props.origem;
  }
  get temperaturaC(): number | null {
    return this.props.temperaturaC;
  }
  get umidadeRelativa(): number | null {
    return this.props.umidadeRelativa;
  }
  get ph(): number | null {
    return this.props.ph;
  }
  get ec(): number | null {
    return this.props.ec;
  }
  get ppfd(): number | null {
    return this.props.ppfd;
  }
  get horasDeLuz(): number | null {
    return this.props.horasDeLuz;
  }
  get vpdKpa(): number | null {
    return this.props.vpdKpa;
  }
  get dli(): number | null {
    return this.props.dli;
  }
  get observacoes(): string | null {
    return this.props.observacoes;
  }

  /** Um registro sem nenhuma medição não é um check-in — é ruído. */
  possuiAlgumaMedicao(): boolean {
    const { temperaturaC, umidadeRelativa, ph, ec, ppfd, horasDeLuz } = this.props;
    return [temperaturaC, umidadeRelativa, ph, ec, ppfd, horasDeLuz].some((v) => v !== null);
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
