import { AcessoNegadoError } from '@cosmaria/core-domain';
import { FonteDeDadosClimaticos } from './catalogos-outdoor';

export interface DadosClimaticosProps {
  id: string;
  usuarioId: string;
  ambienteId: string;
  /**
   * Localização **aproximada** e opt-in (doc 02 §5.3/§16 — privacidade). Texto livre do
   * usuário (ex.: "Curitiba, PR"). Nunca exigimos coordenada exata: outdoor não pode custar
   * a privacidade de quem cultiva.
   */
  localizacaoAproximada: string | null;
  latitudeAproximada: number | null;
  longitudeAproximada: number | null;
  fonte: FonteDeDadosClimaticos;
  observacoes: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * DadosClimáticos (doc 02 §6, doc 08 §12 — Arquétipo A, entidade do **Módulo Outdoor**).
 *
 * Enriquece um ambiente **outdoor** (0—1 por ambiente) com localização aproximada e o
 * gancho para dados climáticos/solares. É **desacoplada**: o núcleo Ambiente/Planta/Ciclo
 * nunca depende dela, e ela referencia o Ambiente só por id. No MVP a `fonte` é sempre
 * MANUAL — a API climática externa (Versão 2) entrará como adaptador plugável, sem alterar
 * este agregado.
 */
export class DadosClimaticos {
  private constructor(private readonly props: DadosClimaticosProps) {}

  static reconstituir(props: DadosClimaticosProps): DadosClimaticos {
    return new DadosClimaticos(props);
  }

  static configurar(params: {
    id: string;
    usuarioId: string;
    ambienteId: string;
    localizacaoAproximada?: string | null;
    latitudeAproximada?: number | null;
    longitudeAproximada?: number | null;
    fonte?: FonteDeDadosClimaticos;
    observacoes?: string | null;
    criadoEm?: Date;
  }): DadosClimaticos {
    const agora = params.criadoEm ?? new Date();
    return new DadosClimaticos({
      id: params.id,
      usuarioId: params.usuarioId,
      ambienteId: params.ambienteId,
      localizacaoAproximada: params.localizacaoAproximada?.trim() || null,
      latitudeAproximada: params.latitudeAproximada ?? null,
      longitudeAproximada: params.longitudeAproximada ?? null,
      fonte: params.fonte ?? FonteDeDadosClimaticos.MANUAL,
      observacoes: params.observacoes ?? null,
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
  get ambienteId(): string {
    return this.props.ambienteId;
  }
  get localizacaoAproximada(): string | null {
    return this.props.localizacaoAproximada;
  }
  get latitudeAproximada(): number | null {
    return this.props.latitudeAproximada;
  }
  get longitudeAproximada(): number | null {
    return this.props.longitudeAproximada;
  }
  get fonte(): FonteDeDadosClimaticos {
    return this.props.fonte;
  }
  get observacoes(): string | null {
    return this.props.observacoes;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  /** Atualiza a configuração. Campo ausente não muda; `null` limpa. */
  atualizar(
    campos: {
      localizacaoAproximada?: string | null;
      latitudeAproximada?: number | null;
      longitudeAproximada?: number | null;
      observacoes?: string | null;
    },
    agora: Date = new Date(),
  ): void {
    if (campos.localizacaoAproximada !== undefined) {
      this.props.localizacaoAproximada = campos.localizacaoAproximada?.trim() || null;
    }
    if (campos.latitudeAproximada !== undefined) {
      this.props.latitudeAproximada = campos.latitudeAproximada;
    }
    if (campos.longitudeAproximada !== undefined) {
      this.props.longitudeAproximada = campos.longitudeAproximada;
    }
    if (campos.observacoes !== undefined) {
      this.props.observacoes = campos.observacoes;
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
