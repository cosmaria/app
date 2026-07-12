import type { EventPublisher } from '@cosmaria/core-application';
import type { DomainEvent } from '@cosmaria/core-domain';
import type { GrowPublicApi, LoteSnapshot } from '@cosmaria/grow-public-api';
import {
  LoteNaoEncontradoParaVinculoError,
  Produto,
  ProdutoNaoEncontradoError,
  TipoDeProduto,
} from '@cosmaria/med-domain';
import type { ProdutoRepository } from '../ports/med.repositories';
import {
  DesvincularProdutoDoLoteUseCase,
  VincularProdutoALoteUseCase,
} from './vinculo-lote.use-cases';

class ProdutosFake implements ProdutoRepository {
  readonly porId = new Map<string, Produto>();
  async salvar(p: Produto): Promise<void> {
    this.porId.set(p.id, p);
  }
  async buscarPorId(id: string): Promise<Produto | null> {
    return this.porId.get(id) ?? null;
  }
  async listarPorTratamento(): Promise<Produto[]> {
    return [];
  }
  async remover(id: string): Promise<void> {
    this.porId.delete(id);
  }
  async possuiRegistros(): Promise<boolean> {
    return false;
  }
}

class GrowFake implements GrowPublicApi {
  constructor(private readonly snapshot: LoteSnapshot | null) {}
  async obterLoteSnapshot(): Promise<LoteSnapshot | null> {
    return this.snapshot;
  }
}

class EventosFake implements EventPublisher {
  readonly publicados: DomainEvent[] = [];
  async publicar(e: DomainEvent): Promise<void> {
    this.publicados.push(e);
  }
}

const SNAPSHOT: LoteSnapshot = {
  loteId: 'lote-1',
  codigo: 'OG-2026-01',
  pesoSecoGramas: 90,
  geradoEm: '2026-06-01T00:00:00.000Z',
};

const novoProduto = () =>
  Produto.criar({
    id: 'prod-1',
    usuarioId: 'u1',
    tratamentoId: 't1',
    nome: 'Óleo',
    tipo: TipoDeProduto.OLEO,
  });

describe('VincularProdutoALoteUseCase', () => {
  it('vincula copiando o snapshot do Grow e publica ProdutoVinculadoALote', async () => {
    const produtos = new ProdutosFake();
    await produtos.salvar(novoProduto());
    const eventos = new EventosFake();

    const view = await new VincularProdutoALoteUseCase(
      produtos,
      new GrowFake(SNAPSHOT),
      eventos,
    ).executar({ usuarioId: 'u1', produtoId: 'prod-1', loteId: 'lote-1' });

    expect(view.loteId).toBe('lote-1');
    expect(view.loteVinculado?.codigo).toBe('OG-2026-01');
    expect(view.loteVinculado?.pesoSecoGramas).toBe(90);
    expect(eventos.publicados.map((e) => e.nome)).toContain('ProdutoVinculadoALote');
  });

  it('404 quando o Lote não existe/não é do usuário (GROW_PUBLIC_API devolve null)', async () => {
    const produtos = new ProdutosFake();
    await produtos.salvar(novoProduto());
    await expect(
      new VincularProdutoALoteUseCase(produtos, new GrowFake(null), new EventosFake()).executar({
        usuarioId: 'u1',
        produtoId: 'prod-1',
        loteId: 'inexistente',
      }),
    ).rejects.toBeInstanceOf(LoteNaoEncontradoParaVinculoError);
  });

  it('404 quando o produto é de outro usuário', async () => {
    const produtos = new ProdutosFake();
    await produtos.salvar(novoProduto());
    await expect(
      new VincularProdutoALoteUseCase(produtos, new GrowFake(SNAPSHOT), new EventosFake()).executar(
        { usuarioId: 'intruso', produtoId: 'prod-1', loteId: 'lote-1' },
      ),
    ).rejects.toBeInstanceOf(ProdutoNaoEncontradoError);
  });
});

describe('DesvincularProdutoDoLoteUseCase', () => {
  it('desvincula e publica ProdutoDesvinculadoDoLote; é idempotente', async () => {
    const produtos = new ProdutosFake();
    const produto = novoProduto();
    produto.vincularLote({
      loteId: 'lote-1',
      codigo: 'OG',
      pesoSecoGramas: 90,
      geradoEm: new Date(),
    });
    await produtos.salvar(produto);
    const eventos = new EventosFake();
    const uc = new DesvincularProdutoDoLoteUseCase(produtos, eventos);

    await uc.executar({ usuarioId: 'u1', produtoId: 'prod-1' });
    expect(produtos.porId.get('prod-1')?.estaVinculadoALote()).toBe(false);
    expect(eventos.publicados.map((e) => e.nome)).toContain('ProdutoDesvinculadoDoLote');

    // Idempotente: segunda chamada não publica de novo.
    await uc.executar({ usuarioId: 'u1', produtoId: 'prod-1' });
    expect(eventos.publicados.filter((e) => e.nome === 'ProdutoDesvinculadoDoLote')).toHaveLength(
      1,
    );
  });
});
