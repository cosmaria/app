import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import type { DomainEvent } from '@cosmaria/core-domain';
import {
  type Produto,
  ProdutoComRegistrosError,
  ProdutoNaoEncontradoError,
  type RegistroDeUso,
  TipoDeProduto,
  type Tratamento,
  TratamentoComProdutosError,
  TratamentoEncerradoError,
  TratamentoNaoEncontradoError,
  UnidadeDeDose,
  ViaDeAdministracao,
} from '@cosmaria/med-domain';
import type {
  ProdutoRepository,
  RegistroDeUsoRepository,
  TratamentoRepository,
} from '../ports/med.repositories';
import {
  AtualizarTratamentoUseCase,
  CriarTratamentoUseCase,
  EncerrarTratamentoUseCase,
  ListarTratamentosUseCase,
  RemoverTratamentoUseCase,
} from './tratamento.use-cases';
import {
  CriarProdutoUseCase,
  ListarProdutosDoTratamentoUseCase,
  RemoverProdutoUseCase,
} from './produto.use-cases';
import { ListarUsosDoTratamentoUseCase, RegistrarUsoUseCase } from './registro-uso.use-cases';

class TratamentosFake implements TratamentoRepository {
  readonly porId = new Map<string, Tratamento>();
  produtos: ProdutosFake | null = null;

  salvar(t: Tratamento): Promise<void> {
    this.porId.set(t.id, t);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Tratamento | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorUsuario(usuarioId: string, apenasAtivos = false): Promise<Tratamento[]> {
    return Promise.resolve(
      [...this.porId.values()].filter(
        (t) => t.usuarioId === usuarioId && (!apenasAtivos || t.estaAtivo()),
      ),
    );
  }
  remover(id: string): Promise<void> {
    this.porId.delete(id);
    return Promise.resolve();
  }
  possuiProdutos(tratamentoId: string): Promise<boolean> {
    return Promise.resolve(
      [...(this.produtos?.porId.values() ?? [])].some((p) => p.tratamentoId === tratamentoId),
    );
  }
}

class ProdutosFake implements ProdutoRepository {
  readonly porId = new Map<string, Produto>();
  registros: RegistrosFake | null = null;

  salvar(p: Produto): Promise<void> {
    this.porId.set(p.id, p);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Produto | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorTratamento(tratamentoId: string): Promise<Produto[]> {
    return Promise.resolve([...this.porId.values()].filter((p) => p.tratamentoId === tratamentoId));
  }
  remover(id: string): Promise<void> {
    this.porId.delete(id);
    return Promise.resolve();
  }
  possuiRegistros(produtoId: string): Promise<boolean> {
    return Promise.resolve(
      [...(this.registros?.porId.values() ?? [])].some((r) => r.produtoId === produtoId),
    );
  }
}

class RegistrosFake implements RegistroDeUsoRepository {
  readonly porId = new Map<string, RegistroDeUso>();
  produtos: ProdutosFake | null = null;

  salvar(r: RegistroDeUso): Promise<void> {
    this.porId.set(r.id, r);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<RegistroDeUso | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorProduto(produtoId: string): Promise<RegistroDeUso[]> {
    return Promise.resolve([...this.porId.values()].filter((r) => r.produtoId === produtoId));
  }
  listarPorTratamento(tratamentoId: string): Promise<RegistroDeUso[]> {
    const ids = new Set(
      [...(this.produtos?.porId.values() ?? [])]
        .filter((p) => p.tratamentoId === tratamentoId)
        .map((p) => p.id),
    );
    return Promise.resolve([...this.porId.values()].filter((r) => ids.has(r.produtoId)));
  }
}

class EventosFake implements EventPublisher {
  readonly publicados: DomainEvent[] = [];
  publicar(evento: DomainEvent): Promise<void> {
    this.publicados.push(evento);
    return Promise.resolve();
  }
  nomes(): string[] {
    return this.publicados.map((e) => e.nome);
  }
}

const ids = (prefixo: string): IdGenerator => {
  let n = 0;
  return { gerar: () => `${prefixo}-${++n}` };
};

const montar = () => {
  const tratamentos = new TratamentosFake();
  const produtos = new ProdutosFake();
  const registros = new RegistrosFake();
  tratamentos.produtos = produtos;
  produtos.registros = registros;
  registros.produtos = produtos;
  const eventos = new EventosFake();
  return { tratamentos, produtos, registros, eventos };
};

const USUARIO = 'u1';

describe('Med — casos de uso do núcleo', () => {
  describe('Tratamento', () => {
    it('cria, publica TratamentoCriado e lista', async () => {
      const { tratamentos, eventos } = montar();
      const criar = new CriarTratamentoUseCase(tratamentos, ids('t'), eventos);
      const view = await criar.executar({ usuarioId: USUARIO, condicao: 'Insônia' });
      expect(view.status).toBe('ATIVO');
      expect(eventos.nomes()).toEqual(['TratamentoCriado']);

      const lista = await new ListarTratamentosUseCase(tratamentos).executar(USUARIO);
      expect(lista).toHaveLength(1);
    });

    it('recusa atualização de tratamento de outro usuário como inexistente', async () => {
      const { tratamentos, eventos } = montar();
      const criar = new CriarTratamentoUseCase(tratamentos, ids('t'), eventos);
      const { tratamentoId } = await criar.executar({ usuarioId: USUARIO, condicao: 'Dor' });
      const atualizar = new AtualizarTratamentoUseCase(tratamentos);
      await expect(
        atualizar.executar({ usuarioId: 'intruso', tratamentoId, objetivo: 'x' }),
      ).rejects.toThrow(TratamentoNaoEncontradoError);
    });

    it('encerra uma vez, publica TratamentoEncerrado e é idempotente', async () => {
      const { tratamentos, eventos } = montar();
      const criar = new CriarTratamentoUseCase(tratamentos, ids('t'), eventos);
      const { tratamentoId } = await criar.executar({ usuarioId: USUARIO, condicao: 'Dor' });
      const encerrar = new EncerrarTratamentoUseCase(tratamentos, eventos);
      await encerrar.executar({ usuarioId: USUARIO, tratamentoId });
      await encerrar.executar({ usuarioId: USUARIO, tratamentoId });
      expect(eventos.nomes().filter((n) => n === 'TratamentoEncerrado')).toHaveLength(1);
    });

    it('bloqueia exclusão de tratamento com produtos', async () => {
      const { tratamentos, produtos, eventos } = montar();
      const { tratamentoId } = await new CriarTratamentoUseCase(
        tratamentos,
        ids('t'),
        eventos,
      ).executar({ usuarioId: USUARIO, condicao: 'Dor' });
      await new CriarProdutoUseCase(produtos, tratamentos, ids('p'), eventos).executar({
        usuarioId: USUARIO,
        tratamentoId,
        nome: 'Óleo',
        tipo: TipoDeProduto.OLEO,
      });
      await expect(
        new RemoverTratamentoUseCase(tratamentos).executar({ usuarioId: USUARIO, tratamentoId }),
      ).rejects.toThrow(TratamentoComProdutosError);
    });
  });

  describe('Produto', () => {
    it('recusa criar produto em tratamento encerrado', async () => {
      const { tratamentos, produtos, eventos } = montar();
      const criarT = new CriarTratamentoUseCase(tratamentos, ids('t'), eventos);
      const { tratamentoId } = await criarT.executar({ usuarioId: USUARIO, condicao: 'Dor' });
      await new EncerrarTratamentoUseCase(tratamentos, eventos).executar({
        usuarioId: USUARIO,
        tratamentoId,
      });
      await expect(
        new CriarProdutoUseCase(produtos, tratamentos, ids('p'), eventos).executar({
          usuarioId: USUARIO,
          tratamentoId,
          nome: 'Óleo',
          tipo: TipoDeProduto.OLEO,
        }),
      ).rejects.toThrow(TratamentoEncerradoError);
    });

    it('lista produtos de um tratamento e publica ProdutoRegistrado', async () => {
      const { tratamentos, produtos, eventos } = montar();
      const { tratamentoId } = await new CriarTratamentoUseCase(
        tratamentos,
        ids('t'),
        eventos,
      ).executar({ usuarioId: USUARIO, condicao: 'Dor' });
      await new CriarProdutoUseCase(produtos, tratamentos, ids('p'), eventos).executar({
        usuarioId: USUARIO,
        tratamentoId,
        nome: 'Óleo',
        tipo: TipoDeProduto.OLEO,
      });
      const lista = await new ListarProdutosDoTratamentoUseCase(produtos, tratamentos).executar({
        usuarioId: USUARIO,
        tratamentoId,
      });
      expect(lista).toHaveLength(1);
      expect(eventos.nomes()).toContain('ProdutoRegistrado');
    });

    it('bloqueia exclusão de produto com doses', async () => {
      const { tratamentos, produtos, registros, eventos } = montar();
      const { tratamentoId } = await new CriarTratamentoUseCase(
        tratamentos,
        ids('t'),
        eventos,
      ).executar({ usuarioId: USUARIO, condicao: 'Dor' });
      const { produtoId } = await new CriarProdutoUseCase(
        produtos,
        tratamentos,
        ids('p'),
        eventos,
      ).executar({ usuarioId: USUARIO, tratamentoId, nome: 'Óleo', tipo: TipoDeProduto.OLEO });
      await new RegistrarUsoUseCase(registros, produtos, ids('r'), eventos).executar({
        usuarioId: USUARIO,
        produtoId,
        quantidade: 2,
        unidade: UnidadeDeDose.GOTAS,
        via: ViaDeAdministracao.SUBLINGUAL,
      });
      await expect(
        new RemoverProdutoUseCase(produtos).executar({ usuarioId: USUARIO, produtoId }),
      ).rejects.toThrow(ProdutoComRegistrosError);
    });
  });

  describe('RegistroDeUso', () => {
    it('registra dose, publica DoseRegistrada e agrega por tratamento', async () => {
      const { tratamentos, produtos, registros, eventos } = montar();
      const { tratamentoId } = await new CriarTratamentoUseCase(
        tratamentos,
        ids('t'),
        eventos,
      ).executar({ usuarioId: USUARIO, condicao: 'Dor' });
      const { produtoId } = await new CriarProdutoUseCase(
        produtos,
        tratamentos,
        ids('p'),
        eventos,
      ).executar({ usuarioId: USUARIO, tratamentoId, nome: 'Óleo', tipo: TipoDeProduto.OLEO });
      await new RegistrarUsoUseCase(registros, produtos, ids('r'), eventos).executar({
        usuarioId: USUARIO,
        produtoId,
        quantidade: 5,
        unidade: UnidadeDeDose.MG,
        via: ViaDeAdministracao.ORAL,
      });
      expect(eventos.nomes()).toContain('DoseRegistrada');

      const doses = await new ListarUsosDoTratamentoUseCase(registros, tratamentos).executar({
        usuarioId: USUARIO,
        tratamentoId,
      });
      expect(doses).toHaveLength(1);
    });

    it('recusa registrar dose em produto de outro usuário', async () => {
      const { tratamentos, produtos, registros, eventos } = montar();
      const { tratamentoId } = await new CriarTratamentoUseCase(
        tratamentos,
        ids('t'),
        eventos,
      ).executar({ usuarioId: USUARIO, condicao: 'Dor' });
      const { produtoId } = await new CriarProdutoUseCase(
        produtos,
        tratamentos,
        ids('p'),
        eventos,
      ).executar({ usuarioId: USUARIO, tratamentoId, nome: 'Óleo', tipo: TipoDeProduto.OLEO });
      await expect(
        new RegistrarUsoUseCase(registros, produtos, ids('r'), eventos).executar({
          usuarioId: 'intruso',
          produtoId,
          quantidade: 5,
          unidade: UnidadeDeDose.MG,
          via: ViaDeAdministracao.ORAL,
        }),
      ).rejects.toThrow(ProdutoNaoEncontradoError);
    });
  });
});
