import type {
  PerfilPublicoRepository,
  ResultadoInsercaoPerfil,
  VinculoDePerfisRepository,
} from '@cosmaria/core-application';
import type {
  ContextoDeApp,
  PerfilPublico,
  RegistroDeVinculoDePerfis,
} from '@cosmaria/core-domain';

/**
 * Repositórios em memória de Identidade Social — mesmas portas do Postgres (LSP,
 * doc 04 §4). Usados em testes e dev local sem banco.
 */
export class InMemoryPerfilPublicoRepository implements PerfilPublicoRepository {
  private readonly porId = new Map<string, PerfilPublico>();

  /** Node é single-threaded neste ponto: a checagem síncrona já é a chave natural. */
  async inserirSeNaoExistir(perfil: PerfilPublico): Promise<ResultadoInsercaoPerfil> {
    const existente = await this.buscarPorUsuarioEContexto(perfil.usuarioId, perfil.contexto);
    if (existente) {
      return { perfil: existente, criado: false };
    }
    this.porId.set(perfil.id, perfil);
    return { perfil, criado: true };
  }

  salvar(perfil: PerfilPublico): Promise<void> {
    this.porId.set(perfil.id, perfil);
    return Promise.resolve();
  }

  buscarPorId(id: string): Promise<PerfilPublico | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }

  buscarPorUsuarioEContexto(
    usuarioId: string,
    contexto: ContextoDeApp,
  ): Promise<PerfilPublico | null> {
    const perfil = [...this.porId.values()].find(
      (p) => p.usuarioId === usuarioId && p.contexto === contexto,
    );
    return Promise.resolve(perfil ?? null);
  }

  buscarPorIds(ids: string[]): Promise<PerfilPublico[]> {
    return Promise.resolve(
      ids.map((id) => this.porId.get(id)).filter((p): p is PerfilPublico => !!p),
    );
  }

  listarPorUsuario(usuarioId: string): Promise<PerfilPublico[]> {
    return Promise.resolve([...this.porId.values()].filter((p) => p.usuarioId === usuarioId));
  }
}

export class InMemoryVinculoDePerfisRepository implements VinculoDePerfisRepository {
  private readonly porId = new Map<string, RegistroDeVinculoDePerfis>();

  salvar(vinculo: RegistroDeVinculoDePerfis): Promise<void> {
    this.porId.set(vinculo.id, vinculo);
    return Promise.resolve();
  }

  buscarPorId(id: string): Promise<RegistroDeVinculoDePerfis | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }

  buscarVigentePorPerfil(perfilId: string): Promise<RegistroDeVinculoDePerfis | null> {
    const vinculo = [...this.porId.values()].find(
      (v) => v.estaVigente() && v.contemPerfil(perfilId),
    );
    return Promise.resolve(vinculo ?? null);
  }

  listarPorUsuario(usuarioId: string): Promise<RegistroDeVinculoDePerfis[]> {
    return Promise.resolve([...this.porId.values()].filter((v) => v.usuarioId === usuarioId));
  }
}
