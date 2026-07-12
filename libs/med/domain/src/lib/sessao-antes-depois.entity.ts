import { AcessoNegadoError } from '@cosmaria/core-domain';
import { SessaoDepoisJaRegistradaError } from './errors/med.errors';

export interface SessaoAntesDepoisProps {
  id: string;
  usuarioId: string;
  /** A dose à qual a sessão se ancora (0—1: uma dose tem no máximo uma sessão). */
  registroDeUsoId: string;
  /** Sintoma-alvo medido antes e depois (texto livre — a condição varia por paciente). */
  sintomaAlvo: string;
  /** Intensidade do sintoma imediatamente antes do uso (escala 0–10, doc 03 §5.4). */
  intensidadeAntes: number;
  /** Nulo até o registro "depois" ser feito. */
  intensidadeDepois: number | null;
  /** Intervalo configurável até pedir o registro "depois" (minutos; inspirado no Strainprint). */
  intervaloMinutos: number;
  /** Momento em que o "depois" foi registrado. Nulo enquanto pendente. */
  registradaDepoisEm: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * SessãoAntesDepois (doc 03 §5.4, doc 08 — Arquétipo A).
 *
 * O diferencial clínico central do Med: mede o sintoma-alvo antes do uso e, após um
 * intervalo, depois — permitindo calcular a efetividade percebida por dose/produto ao
 * longo do tempo. A finalização ("depois") é **monotônica**: registra-se uma única vez,
 * como Secagem/Cura no Grow, para que a série reflita a medição real, não uma correção.
 */
export class SessaoAntesDepois {
  private constructor(private readonly props: SessaoAntesDepoisProps) {}

  static reconstituir(props: SessaoAntesDepoisProps): SessaoAntesDepois {
    return new SessaoAntesDepois(props);
  }

  /** Abre a sessão com a medição "antes". O "depois" chega depois, por `registrarDepois`. */
  static registrarAntes(params: {
    id: string;
    usuarioId: string;
    registroDeUsoId: string;
    sintomaAlvo: string;
    intensidadeAntes: number;
    intervaloMinutos: number;
    criadoEm?: Date;
  }): SessaoAntesDepois {
    const agora = params.criadoEm ?? new Date();
    return new SessaoAntesDepois({
      id: params.id,
      usuarioId: params.usuarioId,
      registroDeUsoId: params.registroDeUsoId,
      sintomaAlvo: params.sintomaAlvo.trim(),
      intensidadeAntes: params.intensidadeAntes,
      intensidadeDepois: null,
      intervaloMinutos: params.intervaloMinutos,
      registradaDepoisEm: null,
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
  get registroDeUsoId(): string {
    return this.props.registroDeUsoId;
  }
  get sintomaAlvo(): string {
    return this.props.sintomaAlvo;
  }
  get intensidadeAntes(): number {
    return this.props.intensidadeAntes;
  }
  get intensidadeDepois(): number | null {
    return this.props.intensidadeDepois;
  }
  get intervaloMinutos(): number {
    return this.props.intervaloMinutos;
  }
  get registradaDepoisEm(): Date | null {
    return this.props.registradaDepoisEm;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  estaFinalizada(): boolean {
    return this.props.registradaDepoisEm !== null;
  }

  /**
   * Variação do sintoma (antes − depois): positivo = melhora, negativo = piora. Nulo
   * enquanto o "depois" não foi registrado. Cálculo determinístico — a *interpretação*
   * clínica é da IA (doc 03 §8), não daqui.
   */
  variacao(): number | null {
    return this.props.intensidadeDepois === null
      ? null
      : this.props.intensidadeAntes - this.props.intensidadeDepois;
  }

  /** Registra o "depois" uma única vez. Repetir é conflito de estado, não sobrescrita. */
  registrarDepois(intensidadeDepois: number, agora: Date = new Date()): void {
    if (this.estaFinalizada()) {
      throw new SessaoDepoisJaRegistradaError();
    }
    this.props.intensidadeDepois = intensidadeDepois;
    this.props.registradaDepoisEm = agora;
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
