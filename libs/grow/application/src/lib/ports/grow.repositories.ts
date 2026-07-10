import type {
  Ambiente,
  CicloCultivo,
  Genetica,
  Planta,
  RegistroAmbiental,
} from '@cosmaria/grow-domain';

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

export interface PaginaDeRegistros {
  itens: RegistroAmbiental[];
  total: number;
}

/**
 * Série temporal (Arquétipo B, doc 08 §6). **Append-only**: não existe `atualizar` nem
 * `remover` — corrigir uma medição é registrar outra. A porta não oferece a operação
 * justamente para que nenhum caso de uso futuro possa reescrever o histórico por engano.
 */
export interface RegistroAmbientalRepository {
  salvar(registro: RegistroAmbiental): Promise<void>;
  buscarPorId(id: string): Promise<RegistroAmbiental | null>;
  /** Mais recentes primeiro, paginado (doc 09 §5). */
  listarPorCiclo(
    cicloId: string,
    parametros: { limite: number; deslocamento: number },
  ): Promise<PaginaDeRegistros>;
}

export const REGISTRO_AMBIENTAL_REPOSITORY = Symbol('RegistroAmbientalRepository');
