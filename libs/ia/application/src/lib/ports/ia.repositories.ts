import type { DominioDeDado, Fator, PontoDeSerie } from '@cosmaria/ia-domain';

/** Janela temporal opcional [de, ate] por `ocorridoEm`. */
export interface JanelaTemporal {
  de?: Date;
  ate?: Date;
}

/**
 * Série temporal própria da IA (schema `ia`, doc 04 §16 / doc 05 §6). **Append-only**: só
 * grava e lê pontos; a IA nunca escreve de volta nem lê o schema de outro módulo (doc 04 §24).
 */
export interface PontoDeSerieRepository {
  salvarVarios(pontos: PontoDeSerie[]): Promise<void>;
  /** Pontos de um fator do usuário, ordem cronológica, janela opcional. */
  listarPorFator(
    usuarioId: string,
    dominio: DominioDeDado,
    fator: Fator,
    janela?: JanelaTemporal,
  ): Promise<PontoDeSerie[]>;
  /** Quantos pontos o usuário tem de um fator — entrada do cold-start (doc 05 §8). */
  contarPorFator(usuarioId: string, dominio: DominioDeDado, fator: Fator): Promise<number>;
  /** Ponto mais recente de um fator — entrada do Motor de Alertas (doc 05 §6.3). */
  ultimoPorFator(
    usuarioId: string,
    dominio: DominioDeDado,
    fator: Fator,
  ): Promise<PontoDeSerie | null>;
}

export const PONTO_DE_SERIE_REPOSITORY = Symbol('PontoDeSerieRepository');

export const POLITICA_DE_AGREGACAO = Symbol('PoliticaDeAgregacao');
