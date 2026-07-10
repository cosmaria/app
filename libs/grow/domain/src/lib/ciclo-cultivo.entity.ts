import { AcessoNegadoError } from '@cosmaria/core-domain';
import { CicloEncerradoError, TransicaoDeFaseInvalidaError } from './errors/grow.errors';
import { FaseDeVida, transicaoDeFasePermitida } from './catalogos';

/** Transição de fase datada — a base de toda métrica de duração (doc 02 §5.12). */
export interface TransicaoDeFase {
  fase: FaseDeVida;
  ocorridaEm: Date;
}

export interface CicloCultivoProps {
  id: string;
  usuarioId: string;
  ambienteId: string;
  nome: string;
  faseAtual: FaseDeVida;
  /** Histórico append-only de transições, incluindo a fase inicial. */
  transicoes: TransicaoDeFase[];
  iniciadoEm: Date;
  /** Nulo enquanto ativo. */
  encerradoEm: Date | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * CicloCultivo (doc 02 §5.2, doc 08 §12.2 — Arquétipo A, entidade central do Grow).
 *
 * Agrupa uma ou mais plantas cultivadas juntas no tempo e no ambiente. Toda transição de
 * fase é registrada **com timestamp**: é dessa lista que saem as durações de fase, a
 * comparação entre ciclos e boa parte do que a IA analisa.
 *
 * Um ciclo encerrado é imutável — nenhuma escrita é aceita depois disso.
 */
export class CicloCultivo {
  private constructor(private readonly props: CicloCultivoProps) {}

  static reconstituir(props: CicloCultivoProps): CicloCultivo {
    return new CicloCultivo(props);
  }

  static iniciar(params: {
    id: string;
    usuarioId: string;
    ambienteId: string;
    nome: string;
    faseInicial?: FaseDeVida;
    iniciadoEm?: Date;
  }): CicloCultivo {
    const agora = params.iniciadoEm ?? new Date();
    const fase = params.faseInicial ?? FaseDeVida.GERMINACAO;
    return new CicloCultivo({
      id: params.id,
      usuarioId: params.usuarioId,
      ambienteId: params.ambienteId,
      nome: params.nome.trim(),
      faseAtual: fase,
      // A fase inicial já entra no histórico: sem ela, a duração da primeira fase
      // não teria marco de início.
      transicoes: [{ fase, ocorridaEm: agora }],
      iniciadoEm: agora,
      encerradoEm: null,
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
  get nome(): string {
    return this.props.nome;
  }
  get faseAtual(): FaseDeVida {
    return this.props.faseAtual;
  }
  get iniciadoEm(): Date {
    return this.props.iniciadoEm;
  }
  get encerradoEm(): Date | null {
    return this.props.encerradoEm;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  transicoes(): TransicaoDeFase[] {
    return this.props.transicoes.map((t) => ({ ...t }));
  }

  estaAtivo(): boolean {
    return this.props.encerradoEm === null;
  }

  /** Duração de cada fase já concluída, em dias. A fase atual não entra: ainda corre. */
  duracaoDasFasesEmDias(): { fase: FaseDeVida; dias: number }[] {
    const duracoes: { fase: FaseDeVida; dias: number }[] = [];
    for (let i = 0; i < this.props.transicoes.length - 1; i++) {
      const atual = this.props.transicoes[i];
      const proxima = this.props.transicoes[i + 1];
      const ms = proxima.ocorridaEm.getTime() - atual.ocorridaEm.getTime();
      duracoes.push({ fase: atual.fase, dias: ms / 86_400_000 });
    }
    return duracoes;
  }

  /**
   * Avança a fase. Pular fases é permitido (uma autoflorescente pode ir do vegetativo
   * direto à floração); retroceder não é, porque corromperia as durações já calculadas.
   */
  avancarFase(proxima: FaseDeVida, agora: Date = new Date()): void {
    this.garantirAtivo();
    if (!transicaoDeFasePermitida(this.props.faseAtual, proxima)) {
      throw new TransicaoDeFaseInvalidaError(this.props.faseAtual, proxima);
    }
    this.props.faseAtual = proxima;
    this.props.transicoes.push({ fase: proxima, ocorridaEm: agora });
    this.props.atualizadoEm = agora;
  }

  renomear(nome: string, agora: Date = new Date()): void {
    this.garantirAtivo();
    this.props.nome = nome.trim();
    this.props.atualizadoEm = agora;
  }

  /** Encerrar é irreversível: o histórico do ciclo vira dado imutável. */
  encerrar(agora: Date = new Date()): void {
    this.garantirAtivo();
    this.props.encerradoEm = agora;
    this.props.atualizadoEm = agora;
  }

  garantirAtivo(): void {
    if (!this.estaAtivo()) {
      throw new CicloEncerradoError();
    }
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
