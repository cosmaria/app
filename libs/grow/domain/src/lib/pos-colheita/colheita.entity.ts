import { AcessoNegadoError } from '@cosmaria/core-domain';
import { ColheitaSemPlantasError } from '../errors/grow.errors';

export interface ColheitaProps {
  id: string;
  usuarioId: string;
  cicloId: string;
  /**
   * Subconjunto de plantas do ciclo colhidas nesta colheita. É isso que sustenta a
   * colheita **escalonada** (0—N colheitas por ciclo, doc 04 §25): plantas que amadurecem
   * em datas diferentes viram colheitas diferentes, cada uma sobre as suas plantas.
   */
  plantaIds: string[];
  /** Peso do material fresco, em gramas. Opcional: nem todo cultivador pesa a úmido. */
  pesoUmidoGramas: number | null;
  colhidoEm: Date;
  observacoes: string | null;
  criadoEm: Date;
}

/**
 * Colheita (doc 02 §5.11, doc 08 §12.2 — Arquétipo B).
 *
 * Uma colheita é um **fato histórico**: uma vez registrada, não muda. As etapas seguintes
 * (secagem, cura, lote) são entidades próprias que a referenciam, nunca edições dela.
 *
 * Cardinalidade corrigida na auditoria (doc 04 §25): não é 1—1 com o ciclo. Um ciclo tem
 * 0—N colheitas, cada uma sobre um subconjunto de plantas.
 */
export class Colheita {
  private constructor(private readonly props: ColheitaProps) {}

  static reconstituir(props: ColheitaProps): Colheita {
    return new Colheita(props);
  }

  static registrar(params: {
    id: string;
    usuarioId: string;
    cicloId: string;
    plantaIds: string[];
    pesoUmidoGramas?: number | null;
    colhidoEm?: Date;
    observacoes?: string | null;
    criadoEm?: Date;
  }): Colheita {
    // Sem plantas não há colheita: seria um registro sobre o nada, e quebraria a métrica
    // de rendimento por planta, que divide pelo número de plantas desta colheita.
    const plantaIds = [...new Set(params.plantaIds)];
    if (plantaIds.length === 0) {
      throw new ColheitaSemPlantasError();
    }
    const agora = params.criadoEm ?? new Date();
    return new Colheita({
      id: params.id,
      usuarioId: params.usuarioId,
      cicloId: params.cicloId,
      plantaIds,
      pesoUmidoGramas: params.pesoUmidoGramas ?? null,
      colhidoEm: params.colhidoEm ?? agora,
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
  get cicloId(): string {
    return this.props.cicloId;
  }
  get plantaIds(): string[] {
    return [...this.props.plantaIds];
  }
  get pesoUmidoGramas(): number | null {
    return this.props.pesoUmidoGramas;
  }
  get colhidoEm(): Date {
    return this.props.colhidoEm;
  }
  get observacoes(): string | null {
    return this.props.observacoes;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  /** Base do rendimento por planta calculado no Lote. */
  quantidadeDePlantas(): number {
    return this.props.plantaIds.length;
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
