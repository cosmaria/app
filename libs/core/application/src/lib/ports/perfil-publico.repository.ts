import type { ContextoDeApp, PerfilPublico } from '@cosmaria/core-domain';

/** Resultado de uma criação idempotente: o perfil efetivamente persistido e se ele é novo. */
export interface ResultadoInsercaoPerfil {
  perfil: PerfilPublico;
  /** `false` quando outra requisição concorrente já havia criado o perfil. */
  criado: boolean;
}

/**
 * Repositório de PerfilPúblico (doc 08 §12.1).
 *
 * Regra de acesso a dado (doc 06 §13): **nenhuma** consulta aqui retorna perfis de
 * contextos diferentes da mesma Conta juntos. `listarPorUsuario` existe apenas para os
 * fluxos internos do próprio dono (LGPD, vínculo) e nunca alimenta feed, busca ou
 * qualquer superfície pública. Terceiros só cruzam contextos via `buscarPorIds`, e só
 * depois de o caso de uso confirmar um `RegistroDeVinculoDePerfis` vigente.
 */
export interface PerfilPublicoRepository {
  /**
   * Cria o perfil **só se** a Conta ainda não tiver um naquele contexto, devolvendo o
   * perfil que de fato ficou persistido. É onde mora a idempotência da criação lazy
   * (doc 06, Riscos Técnicos): duas requisições concorrentes convergem para a mesma
   * linha, e apenas uma delas recebe `criado: true` — logo, `PerfilPublicoCriado` é
   * publicado uma única vez.
   */
  inserirSeNaoExistir(perfil: PerfilPublico): Promise<ResultadoInsercaoPerfil>;

  /** Persiste a edição de um perfil já existente. */
  salvar(perfil: PerfilPublico): Promise<void>;

  buscarPorId(id: string): Promise<PerfilPublico | null>;

  /** Chave natural: uma Conta tem no máximo um perfil por contexto. */
  buscarPorUsuarioEContexto(
    usuarioId: string,
    contexto: ContextoDeApp,
  ): Promise<PerfilPublico | null>;

  buscarPorIds(ids: string[]): Promise<PerfilPublico[]>;

  /** Todos os perfis do próprio dono — nunca exposto a terceiros. */
  listarPorUsuario(usuarioId: string): Promise<PerfilPublico[]>;
}

export const PERFIL_PUBLICO_REPOSITORY = Symbol('PerfilPublicoRepository');
