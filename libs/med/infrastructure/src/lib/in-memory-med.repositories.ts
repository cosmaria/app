import type {
  EfeitoRepository,
  ModeloDeTratamentoRepository,
  ProdutoRepository,
  RegistroDeUsoRepository,
  SessaoAntesDepoisRepository,
  SintomaDiarioRepository,
  TratamentoRepository,
} from '@cosmaria/med-application';
import type {
  ModeloDeTratamento,
  Produto,
  RegistroDeEfeito,
  RegistroDeSintomaDiario,
  RegistroDeUso,
  SessaoAntesDepois,
  Tratamento,
} from '@cosmaria/med-domain';
import { StatusDoTratamento } from '@cosmaria/med-domain';

/**
 * Repositórios do Med em memória — mesmas portas do Postgres (LSP, doc 04 §4).
 *
 * `possuiProdutos`/`possuiRegistros` cruzam agregados, então os repositórios precisam
 * enxergar uns aos outros. Em vez de um singleton global, o composition root injeta os
 * "vizinhos" explicitamente — o mesmo que o Postgres faz com um `EXISTS`.
 */
export class InMemoryTratamentoRepository implements TratamentoRepository {
  private readonly porId = new Map<string, Tratamento>();
  private produtos: InMemoryProdutoRepository | null = null;

  /** Ligação tardia: o repositório de produtos é criado depois deste. */
  conectarProdutos(produtos: InMemoryProdutoRepository): void {
    this.produtos = produtos;
  }

  salvar(t: Tratamento): Promise<void> {
    this.porId.set(t.id, t);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Tratamento | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorUsuario(usuarioId: string, apenasAtivos = false): Promise<Tratamento[]> {
    const itens = [...this.porId.values()]
      .filter((t) => t.usuarioId === usuarioId)
      .filter((t) => !apenasAtivos || t.status === StatusDoTratamento.ATIVO)
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
    return Promise.resolve(itens);
  }
  remover(id: string): Promise<void> {
    this.porId.delete(id);
    return Promise.resolve();
  }
  possuiProdutos(tratamentoId: string): Promise<boolean> {
    return Promise.resolve(this.produtos?.existeNoTratamento(tratamentoId) ?? false);
  }
}

export class InMemoryProdutoRepository implements ProdutoRepository {
  private readonly porId = new Map<string, Produto>();
  private registros: InMemoryRegistroDeUsoRepository | null = null;

  conectarRegistros(registros: InMemoryRegistroDeUsoRepository): void {
    this.registros = registros;
  }

  salvar(p: Produto): Promise<void> {
    this.porId.set(p.id, p);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Produto | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorTratamento(tratamentoId: string): Promise<Produto[]> {
    const itens = [...this.porId.values()]
      .filter((p) => p.tratamentoId === tratamentoId)
      .sort((a, b) => a.criadoEm.getTime() - b.criadoEm.getTime());
    return Promise.resolve(itens);
  }
  remover(id: string): Promise<void> {
    this.porId.delete(id);
    return Promise.resolve();
  }
  possuiRegistros(produtoId: string): Promise<boolean> {
    return Promise.resolve(this.registros?.existeParaProduto(produtoId) ?? false);
  }

  /** Usado por `InMemoryTratamentoRepository.possuiProdutos`. */
  existeNoTratamento(tratamentoId: string): boolean {
    return [...this.porId.values()].some((p) => p.tratamentoId === tratamentoId);
  }

  /** Ids dos produtos de um tratamento — usado pelo repo de registros para agregar por tratamento. */
  idsDoTratamento(tratamentoId: string): string[] {
    return [...this.porId.values()].filter((p) => p.tratamentoId === tratamentoId).map((p) => p.id);
  }
}

export class InMemoryRegistroDeUsoRepository implements RegistroDeUsoRepository {
  private readonly porId = new Map<string, RegistroDeUso>();
  private produtos: InMemoryProdutoRepository | null = null;

  conectarProdutos(produtos: InMemoryProdutoRepository): void {
    this.produtos = produtos;
  }

  salvar(r: RegistroDeUso): Promise<void> {
    this.porId.set(r.id, r);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<RegistroDeUso | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorProduto(produtoId: string): Promise<RegistroDeUso[]> {
    return Promise.resolve(this.ordenados((r) => r.produtoId === produtoId));
  }
  listarPorTratamento(tratamentoId: string): Promise<RegistroDeUso[]> {
    const ids = new Set(this.produtos?.idsDoTratamento(tratamentoId) ?? []);
    return Promise.resolve(this.ordenados((r) => ids.has(r.produtoId)));
  }
  existeParaProduto(produtoId: string): boolean {
    return [...this.porId.values()].some((r) => r.produtoId === produtoId);
  }

  /** Mais recentes primeiro, por horário de uso (empate desfeito pela criação). */
  private ordenados(filtro: (r: RegistroDeUso) => boolean): RegistroDeUso[] {
    return [...this.porId.values()].filter(filtro).sort((a, b) => {
      const porUso = b.usadoEm.getTime() - a.usadoEm.getTime();
      return porUso !== 0 ? porUso : b.criadoEm.getTime() - a.criadoEm.getTime();
    });
  }
}

export class InMemorySessaoAntesDepoisRepository implements SessaoAntesDepoisRepository {
  private readonly porId = new Map<string, SessaoAntesDepois>();
  private registros: InMemoryRegistroDeUsoRepository | null = null;

  /** Ligação tardia: o repo de doses resolve dose → produto → tratamento. */
  conectarRegistros(registros: InMemoryRegistroDeUsoRepository): void {
    this.registros = registros;
  }

  salvar(s: SessaoAntesDepois): Promise<void> {
    this.porId.set(s.id, s);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<SessaoAntesDepois | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  buscarPorRegistroDeUso(registroDeUsoId: string): Promise<SessaoAntesDepois | null> {
    return Promise.resolve(
      [...this.porId.values()].find((s) => s.registroDeUsoId === registroDeUsoId) ?? null,
    );
  }
  async listarPorTratamento(tratamentoId: string): Promise<SessaoAntesDepois[]> {
    const doses = await (this.registros?.listarPorTratamento(tratamentoId) ?? Promise.resolve([]));
    const ids = new Set(doses.map((d) => d.id));
    return [...this.porId.values()].filter((s) => ids.has(s.registroDeUsoId));
  }
}

export class InMemorySintomaDiarioRepository implements SintomaDiarioRepository {
  private readonly porId = new Map<string, RegistroDeSintomaDiario>();

  salvar(r: RegistroDeSintomaDiario): Promise<void> {
    this.porId.set(r.id, r);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<RegistroDeSintomaDiario | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorUsuario(
    usuarioId: string,
    janela?: { de?: Date; ate?: Date },
  ): Promise<RegistroDeSintomaDiario[]> {
    const itens = [...this.porId.values()]
      .filter((r) => r.usuarioId === usuarioId)
      .filter((r) => !janela?.de || r.registradoEm >= janela.de)
      .filter((r) => !janela?.ate || r.registradoEm <= janela.ate)
      .sort((a, b) => b.registradoEm.getTime() - a.registradoEm.getTime());
    return Promise.resolve(itens);
  }
}

export class InMemoryEfeitoRepository implements EfeitoRepository {
  private readonly porId = new Map<string, RegistroDeEfeito>();
  private registros: InMemoryRegistroDeUsoRepository | null = null;

  /**
   * Ligação tardia: o repo de doses já resolve dose → produto → tratamento (via sua
   * própria conexão com produtos), então o efeito só precisa dele para o agregado.
   */
  conectarRegistros(registros: InMemoryRegistroDeUsoRepository): void {
    this.registros = registros;
  }

  salvar(e: RegistroDeEfeito): Promise<void> {
    this.porId.set(e.id, e);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<RegistroDeEfeito | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorRegistroDeUso(registroDeUsoId: string): Promise<RegistroDeEfeito[]> {
    const itens = [...this.porId.values()]
      .filter((e) => e.registroDeUsoId === registroDeUsoId)
      .sort((a, b) => b.registradoEm.getTime() - a.registradoEm.getTime());
    return Promise.resolve(itens);
  }
  async listarPorTratamento(tratamentoId: string): Promise<RegistroDeEfeito[]> {
    const doses = await (this.registros?.listarPorTratamento(tratamentoId) ?? Promise.resolve([]));
    const ids = new Set(doses.map((d) => d.id));
    return [...this.porId.values()]
      .filter((e) => ids.has(e.registroDeUsoId))
      .sort((a, b) => b.registradoEm.getTime() - a.registradoEm.getTime());
  }
}

export class InMemoryModeloDeTratamentoRepository implements ModeloDeTratamentoRepository {
  private readonly porId = new Map<string, ModeloDeTratamento>();

  salvar(m: ModeloDeTratamento): Promise<void> {
    this.porId.set(m.id, m);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<ModeloDeTratamento | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorUsuario(usuarioId: string): Promise<ModeloDeTratamento[]> {
    const itens = [...this.porId.values()]
      .filter((m) => m.usuarioId === usuarioId)
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
    return Promise.resolve(itens);
  }
  remover(id: string): Promise<void> {
    this.porId.delete(id);
    return Promise.resolve();
  }
}
