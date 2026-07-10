import type { Ambiente, CicloCultivo, Genetica, Planta } from '@cosmaria/grow-domain';

/**
 * Repositórios do Grow (schema `grow`, doc 04 §16 — schema por módulo).
 *
 * Toda consulta é escopada ao dono: nenhum método aceita "buscar qualquer um por id" sem
 * que o caso de uso confira a posse. O Grow nunca lê o schema de outro módulo.
 */
export interface GeneticaRepository {
  salvar(genetica: Genetica): Promise<void>;
  buscarPorId(id: string): Promise<Genetica | null>;
  listarPorUsuario(usuarioId: string): Promise<Genetica[]>;
  remover(id: string): Promise<void>;
  /** Existe alguma planta originada por esta genética? (bloqueia exclusão) */
  possuiPlantas(geneticaId: string): Promise<boolean>;
}

export const GENETICA_REPOSITORY = Symbol('GeneticaRepository');

export interface AmbienteRepository {
  salvar(ambiente: Ambiente): Promise<void>;
  buscarPorId(id: string): Promise<Ambiente | null>;
  listarPorUsuario(usuarioId: string): Promise<Ambiente[]>;
  remover(id: string): Promise<void>;
  /** Quantos ambientes o usuário tem hoje — entrada do gate de `LimiteDePlano`. */
  contarPorUsuario(usuarioId: string): Promise<number>;
  /** Existe algum ciclo neste ambiente? (bloqueia exclusão — o espaço tem histórico) */
  possuiCiclos(ambienteId: string): Promise<boolean>;
}

export const AMBIENTE_REPOSITORY = Symbol('AmbienteRepository');

export interface CicloRepository {
  salvar(ciclo: CicloCultivo): Promise<void>;
  buscarPorId(id: string): Promise<CicloCultivo | null>;
  listarPorUsuario(usuarioId: string, apenasAtivos?: boolean): Promise<CicloCultivo[]>;
}

export const CICLO_REPOSITORY = Symbol('CicloRepository');

export interface PlantaRepository {
  salvar(planta: Planta): Promise<void>;
  buscarPorId(id: string): Promise<Planta | null>;
  listarPorCiclo(cicloId: string): Promise<Planta[]>;
}

export const PLANTA_REPOSITORY = Symbol('PlantaRepository');
