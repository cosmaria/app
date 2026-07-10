import { AcessoNegadoError } from '@cosmaria/core-domain';
import { FaseDeVida, type OrigemDoMaterial, transicaoDeFasePermitida } from './catalogos';
import { TransicaoDeFaseInvalidaError } from './errors/grow.errors';

export interface PlantaProps {
  id: string;
  usuarioId: string;
  cicloId: string;
  geneticaId: string;
  /** Apelido dado pelo usuário (ex.: "Planta 3"). Texto livre, nunca traduzido. */
  nome: string;
  origem: OrigemDoMaterial;
  /** Quando origem é CLONE, a planta-mãe de onde veio (doc 02 §5.1). */
  plantaMaeId: string | null;
  faseAtual: FaseDeVida;
  germinadaEm: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * Planta (doc 02 §5.2, doc 08 §12.2 — Arquétipo A). É a unidade central de registro.
 *
 * Tem fase **própria**, e não a do ciclo: num mesmo ciclo, plantas amadurecem em ritmos
 * diferentes, e é justamente isso que sustenta a colheita escalonada (0—N colheitas por
 * ciclo, doc 04 §25). Forçar a fase da planta a acompanhar a do ciclo tornaria essa
 * correção impossível.
 */
export class Planta {
  private constructor(private readonly props: PlantaProps) {}

  static reconstituir(props: PlantaProps): Planta {
    return new Planta(props);
  }

  static criar(params: {
    id: string;
    usuarioId: string;
    cicloId: string;
    geneticaId: string;
    nome: string;
    origem: OrigemDoMaterial;
    plantaMaeId?: string | null;
    faseInicial?: FaseDeVida;
    germinadaEm?: Date | null;
    criadoEm?: Date;
  }): Planta {
    const agora = params.criadoEm ?? new Date();
    return new Planta({
      id: params.id,
      usuarioId: params.usuarioId,
      cicloId: params.cicloId,
      geneticaId: params.geneticaId,
      nome: params.nome.trim(),
      origem: params.origem,
      plantaMaeId: params.plantaMaeId ?? null,
      faseAtual: params.faseInicial ?? FaseDeVida.GERMINACAO,
      germinadaEm: params.germinadaEm ?? null,
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
  get cicloId(): string {
    return this.props.cicloId;
  }
  get geneticaId(): string {
    return this.props.geneticaId;
  }
  get nome(): string {
    return this.props.nome;
  }
  get origem(): OrigemDoMaterial {
    return this.props.origem;
  }
  get plantaMaeId(): string | null {
    return this.props.plantaMaeId;
  }
  get faseAtual(): FaseDeVida {
    return this.props.faseAtual;
  }
  get germinadaEm(): Date | null {
    return this.props.germinadaEm;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  /** Mesma regra do ciclo: avançar (e pular) pode; retroceder, não. */
  avancarFase(proxima: FaseDeVida, agora: Date = new Date()): void {
    if (!transicaoDeFasePermitida(this.props.faseAtual, proxima)) {
      throw new TransicaoDeFaseInvalidaError(this.props.faseAtual, proxima);
    }
    this.props.faseAtual = proxima;
    this.props.atualizadoEm = agora;
  }

  atualizar(campos: { nome?: string; germinadaEm?: Date | null }, agora: Date = new Date()): void {
    if (campos.nome !== undefined) {
      this.props.nome = campos.nome.trim();
    }
    if (campos.germinadaEm !== undefined) {
      this.props.germinadaEm = campos.germinadaEm;
    }
    this.props.atualizadoEm = agora;
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
