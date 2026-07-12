import type {
  Comentario,
  Curtida,
  PublicacaoComunidade,
  RegistroDeFork,
  Seguimento,
} from '@cosmaria/comunidade-domain';
import type { ContextoDeApp } from '@cosmaria/core-domain';

/** Filtro de leitura do feed (escopado por contexto, doc 06 §2). */
export interface FiltroDeFeed {
  /** Perfil do visualizador no contexto — vê PUBLICO de todos + tudo que é dele. */
  perfilDoVisualizador: string;
  /** Perfis que o visualizador segue — habilitam ver publicações de escopo SEGUIDORES. */
  seguindoPerfilIds: string[];
  limite: number;
  /** Paginação por cursor: só publicações anteriores a este instante. */
  publicadasAntesDe?: Date;
}

/** Busca estruturada por parâmetro técnico (Com-2). */
export interface FiltroDeBusca {
  perfilDoVisualizador: string;
  seguindoPerfilIds: string[];
  chave: string;
  valor: string;
  limite: number;
}

/**
 * Projeção de leitura da Comunidade (doc 06 §8). Uma publicação é única por conteúdo de
 * origem (`modulo` + `conteudoId`): reprojetar o mesmo conteúdo atualiza, não duplica —
 * é o que torna a projeção idempotente diante de reentrega de evento (doc 06 §Riscos).
 */
export interface PublicacaoComunidadeRepository {
  salvar(publicacao: PublicacaoComunidade): Promise<void>;
  buscarPorId(id: string): Promise<PublicacaoComunidade | null>;
  buscarPorReferencia(modulo: string, conteudoId: string): Promise<PublicacaoComunidade | null>;
  listarFeed(contexto: ContextoDeApp, filtro: FiltroDeFeed): Promise<PublicacaoComunidade[]>;
  buscar(contexto: ContextoDeApp, filtro: FiltroDeBusca): Promise<PublicacaoComunidade[]>;
  /** Ajuste atômico dos contadores denormalizados (doc 08 §escalabilidade). */
  ajustarCurtidas(publicacaoId: string, delta: number): Promise<void>;
  ajustarComentarios(publicacaoId: string, delta: number): Promise<void>;
  /** Soma dos sinais recebidos pelas publicações de um perfil (reputação, Com-5). */
  somarContadoresRecebidos(perfilPublicoId: string): Promise<ContadoresRecebidos>;
}

/** Agregado de leitura: quantas publicações e quantos sinais um perfil acumulou. */
export interface ContadoresRecebidos {
  publicacoes: number;
  curtidas: number;
  comentarios: number;
}

export const PUBLICACAO_COMUNIDADE_REPOSITORY = Symbol('PublicacaoComunidadeRepository');

/** Grafo social escopado por contexto (doc 06 §12). Seguir é idempotente. */
export interface SeguimentoRepository {
  salvar(seguimento: Seguimento): Promise<void>;
  remover(seguidorPerfilId: string, seguidoPerfilId: string): Promise<void>;
  existe(seguidorPerfilId: string, seguidoPerfilId: string): Promise<boolean>;
  /** IDs dos perfis que este perfil segue — alimenta a visibilidade SEGUIDORES do feed. */
  listarSeguidosIds(seguidorPerfilId: string): Promise<string[]>;
  contarSeguidores(perfilId: string): Promise<number>;
  contarSeguindo(perfilId: string): Promise<number>;
}

export const SEGUIMENTO_REPOSITORY = Symbol('SeguimentoRepository');

/** Curtidas — 0—1 por (perfil, publicação). Curtir é idempotente. */
export interface CurtidaRepository {
  salvar(curtida: Curtida): Promise<void>;
  remover(perfilId: string, publicacaoId: string): Promise<void>;
  existe(perfilId: string, publicacaoId: string): Promise<boolean>;
}

export const CURTIDA_REPOSITORY = Symbol('CurtidaRepository');

/** Comentários — N por publicação, mais recentes primeiro. */
export interface ComentarioRepository {
  salvar(comentario: Comentario): Promise<void>;
  listarPorPublicacao(publicacaoId: string, limite: number): Promise<Comentario[]>;
}

export const COMENTARIO_REPOSITORY = Symbol('ComentarioRepository');

/** Grafo de atribuição de forks (doc 06 §8) — quem forkou de quem. Idempotente por par. */
export interface RegistroDeForkRepository {
  salvar(registro: RegistroDeFork): Promise<void>;
  existe(forkerPerfilId: string, publicacaoOrigemId: string): Promise<boolean>;
  /** Total de forks que um perfil recebeu (soma sobre suas publicações) — reputação (Com-5). */
  contarForksRecebidos(autorOriginalPerfilId: string): Promise<number>;
}

export const REGISTRO_DE_FORK_REPOSITORY = Symbol('RegistroDeForkRepository');

/** Total de visualizações de um perfil num dia (agregado, sem log individual — doc 08 minimização). */
export interface ContagemDiaria {
  dia: string;
  total: number;
}

/**
 * VisualizacaoDePerfil (doc 06 §11, Catálogo) — contador AGREGADO por dia, nunca um log de
 * quem visitou (minimização de dado, retenção curta). Premium só lê; registrar é livre.
 */
export interface VisualizacaoDePerfilRepository {
  /** Incrementa o contador do dia (upsert) para o perfil visitado. */
  incrementar(perfilId: string, dia: string): Promise<void>;
  total(perfilId: string): Promise<number>;
  /** Contagem por dia a partir de uma data (YYYY-MM-DD), do mais recente ao mais antigo. */
  porDia(perfilId: string, desdeDia: string): Promise<ContagemDiaria[]>;
}

export const VISUALIZACAO_DE_PERFIL_REPOSITORY = Symbol('VisualizacaoDePerfilRepository');
