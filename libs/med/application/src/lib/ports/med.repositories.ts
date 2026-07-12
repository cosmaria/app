import type {
  ModeloDeTratamento,
  Produto,
  RegistroDeEfeito,
  RegistroDeSintomaDiario,
  RegistroDeUso,
  SessaoAntesDepois,
  Tratamento,
} from '@cosmaria/med-domain';

/**
 * Repositórios do Med (schema `med`, doc 04 §16 — schema por módulo).
 *
 * Toda consulta é escopada ao dono: nenhum método aceita "buscar qualquer um por id" sem
 * que o caso de uso confira a posse. O Med nunca lê o schema de outro módulo (doc 04 §24).
 */
export interface TratamentoRepository {
  salvar(tratamento: Tratamento): Promise<void>;
  buscarPorId(id: string): Promise<Tratamento | null>;
  listarPorUsuario(usuarioId: string, apenasAtivos?: boolean): Promise<Tratamento[]>;
  remover(id: string): Promise<void>;
  /** Existe algum produto neste tratamento? (bloqueia exclusão — o tratamento tem histórico) */
  possuiProdutos(tratamentoId: string): Promise<boolean>;
}

export const TRATAMENTO_REPOSITORY = Symbol('TratamentoRepository');

export interface ProdutoRepository {
  salvar(produto: Produto): Promise<void>;
  buscarPorId(id: string): Promise<Produto | null>;
  listarPorTratamento(tratamentoId: string): Promise<Produto[]>;
  remover(id: string): Promise<void>;
  /** Existe alguma dose registrada para este produto? (bloqueia exclusão) */
  possuiRegistros(produtoId: string): Promise<boolean>;
}

export const PRODUTO_REPOSITORY = Symbol('ProdutoRepository');

/**
 * Série temporal de doses (Arquétipo B, doc 08 §6). **Append-only**: não existe
 * `atualizar` nem `remover`. A porta não oferece a operação justamente para que nenhum
 * caso de uso futuro reescreva a série clínica por engano.
 */
export interface RegistroDeUsoRepository {
  salvar(registro: RegistroDeUso): Promise<void>;
  buscarPorId(id: string): Promise<RegistroDeUso | null>;
  /** Mais recentes primeiro. */
  listarPorProduto(produtoId: string): Promise<RegistroDeUso[]>;
  /** Doses de todos os produtos de um tratamento — base da evolução clínica (doc 03 §5.6). */
  listarPorTratamento(tratamentoId: string): Promise<RegistroDeUso[]>;
}

export const REGISTRO_DE_USO_REPOSITORY = Symbol('RegistroDeUsoRepository');

export interface SessaoAntesDepoisRepository {
  salvar(sessao: SessaoAntesDepois): Promise<void>;
  buscarPorId(id: string): Promise<SessaoAntesDepois | null>;
  /** A sessão (0—1) de uma dose. */
  buscarPorRegistroDeUso(registroDeUsoId: string): Promise<SessaoAntesDepois | null>;
  /** Sessões de todas as doses de um tratamento — usado pela evolução clínica (doc 03 §5.6). */
  listarPorTratamento(tratamentoId: string): Promise<SessaoAntesDepois[]>;
}

export const SESSAO_REPOSITORY = Symbol('SessaoAntesDepoisRepository');

/**
 * Linha de base diária (Arquétipo B, append-only). Sem `atualizar`/`remover`: cada
 * check-in é um ponto imutável da série longitudinal.
 */
export interface SintomaDiarioRepository {
  salvar(registro: RegistroDeSintomaDiario): Promise<void>;
  buscarPorId(id: string): Promise<RegistroDeSintomaDiario | null>;
  /** Mais recentes primeiro; janela opcional [de, ate] por `registradoEm`. */
  listarPorUsuario(
    usuarioId: string,
    janela?: { de?: Date; ate?: Date },
  ): Promise<RegistroDeSintomaDiario[]>;
}

export const SINTOMA_DIARIO_REPOSITORY = Symbol('SintomaDiarioRepository');

/** Efeitos de uma dose (Arquétipo B, append-only, 0—N por dose). */
export interface EfeitoRepository {
  salvar(efeito: RegistroDeEfeito): Promise<void>;
  buscarPorId(id: string): Promise<RegistroDeEfeito | null>;
  listarPorRegistroDeUso(registroDeUsoId: string): Promise<RegistroDeEfeito[]>;
  /** Efeitos de todas as doses de um tratamento — usado pela evolução clínica (doc 03 §5.6). */
  listarPorTratamento(tratamentoId: string): Promise<RegistroDeEfeito[]>;
}

export const EFEITO_REPOSITORY = Symbol('EfeitoRepository');

/** Templates de tratamento (Premium). CRUD sem update — modelo se cria e se remove. */
export interface ModeloDeTratamentoRepository {
  salvar(modelo: ModeloDeTratamento): Promise<void>;
  buscarPorId(id: string): Promise<ModeloDeTratamento | null>;
  listarPorUsuario(usuarioId: string): Promise<ModeloDeTratamento[]>;
  remover(id: string): Promise<void>;
}

export const MODELO_DE_TRATAMENTO_REPOSITORY = Symbol('ModeloDeTratamentoRepository');
