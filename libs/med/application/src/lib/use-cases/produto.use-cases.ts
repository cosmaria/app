import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import {
  Produto,
  ProdutoComRegistrosError,
  ProdutoNaoEncontradoError,
  ProdutoRegistrado,
  type TipoDeProduto,
} from '@cosmaria/med-domain';
import { ProdutoRepository, TratamentoRepository } from '../ports/med.repositories';
import { buscarTratamentoDoDono } from './tratamento.use-cases';

export interface LoteVinculadoView {
  loteId: string;
  codigo: string;
  pesoSecoGramas: number;
  geradoEm: string;
}

export interface ProdutoView {
  produtoId: string;
  tratamentoId: string;
  nome: string;
  tipo: TipoDeProduto;
  concentracaoCbd: string | null;
  concentracaoThc: string | null;
  fabricante: string | null;
  loteId: string | null;
  /** Snapshot do Lote vinculado (procedência Grow), quando houver vínculo opt-in. */
  loteVinculado: LoteVinculadoView | null;
  criadoEm: string;
}

export const paraProdutoView = (p: Produto): ProdutoView => {
  const vinculo = p.loteVinculado;
  return {
    produtoId: p.id,
    tratamentoId: p.tratamentoId,
    nome: p.nome,
    tipo: p.tipo,
    concentracaoCbd: p.concentracaoCbd,
    concentracaoThc: p.concentracaoThc,
    fabricante: p.fabricante,
    loteId: p.loteId,
    loteVinculado: vinculo
      ? {
          loteId: vinculo.loteId,
          codigo: vinculo.codigo,
          pesoSecoGramas: vinculo.pesoSecoGramas,
          geradoEm: vinculo.geradoEm.toISOString(),
        }
      : null,
    criadoEm: p.criadoEm.toISOString(),
  };
};

export async function buscarProdutoDoDono(
  repo: ProdutoRepository,
  usuarioId: string,
  produtoId: string,
): Promise<Produto> {
  const produto = await repo.buscarPorId(produtoId);
  if (!produto || !produto.pertenceA(usuarioId)) {
    throw new ProdutoNaoEncontradoError();
  }
  return produto;
}

export interface CriarProdutoInput {
  usuarioId: string;
  tratamentoId: string;
  nome: string;
  tipo: TipoDeProduto;
  concentracaoCbd?: string | null;
  concentracaoThc?: string | null;
  fabricante?: string | null;
}

/**
 * `POST /v1/produtos`. Exige um tratamento ativo do próprio usuário: cadastrar produto num
 * tratamento encerrado registraria uso onde a fase clínica já terminou (doc 03 §5.1/5.2).
 */
export class CriarProdutoUseCase {
  constructor(
    private readonly produtos: ProdutoRepository,
    private readonly tratamentos: TratamentoRepository,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: CriarProdutoInput): Promise<ProdutoView> {
    const tratamento = await buscarTratamentoDoDono(
      this.tratamentos,
      input.usuarioId,
      input.tratamentoId,
    );
    tratamento.garantirAtivo();

    const produto = Produto.criar({ id: this.idGen.gerar(), ...input });
    await this.produtos.salvar(produto);
    await this.eventos.publicar(
      new ProdutoRegistrado(produto.id, produto.usuarioId, produto.tratamentoId),
    );
    return paraProdutoView(produto);
  }
}

/** `GET /v1/tratamentos/{id}/produtos` — produtos de um tratamento do próprio usuário. */
export class ListarProdutosDoTratamentoUseCase {
  constructor(
    private readonly produtos: ProdutoRepository,
    private readonly tratamentos: TratamentoRepository,
  ) {}

  async executar(input: { usuarioId: string; tratamentoId: string }): Promise<ProdutoView[]> {
    await buscarTratamentoDoDono(this.tratamentos, input.usuarioId, input.tratamentoId);
    const produtos = await this.produtos.listarPorTratamento(input.tratamentoId);
    return produtos.map(paraProdutoView);
  }
}

/** `GET /v1/produtos/{id}`. */
export class ObterProdutoUseCase {
  constructor(private readonly produtos: ProdutoRepository) {}

  async executar(input: { usuarioId: string; produtoId: string }): Promise<ProdutoView> {
    const produto = await buscarProdutoDoDono(this.produtos, input.usuarioId, input.produtoId);
    return paraProdutoView(produto);
  }
}

export interface AtualizarProdutoInput {
  usuarioId: string;
  produtoId: string;
  nome?: string;
  tipo?: TipoDeProduto;
  concentracaoCbd?: string | null;
  concentracaoThc?: string | null;
  fabricante?: string | null;
}

/** `PUT /v1/produtos/{id}` — atualização parcial. */
export class AtualizarProdutoUseCase {
  constructor(private readonly produtos: ProdutoRepository) {}

  async executar(input: AtualizarProdutoInput): Promise<ProdutoView> {
    const produto = await buscarProdutoDoDono(this.produtos, input.usuarioId, input.produtoId);
    produto.atualizar(input);
    await this.produtos.salvar(produto);
    return paraProdutoView(produto);
  }
}

/** `DELETE /v1/produtos/{id}` — recusa se já houver doses registradas. */
export class RemoverProdutoUseCase {
  constructor(private readonly produtos: ProdutoRepository) {}

  async executar(input: { usuarioId: string; produtoId: string }): Promise<void> {
    const produto = await buscarProdutoDoDono(this.produtos, input.usuarioId, input.produtoId);
    if (await this.produtos.possuiRegistros(produto.id)) {
      throw new ProdutoComRegistrosError();
    }
    await this.produtos.remover(produto.id);
  }
}
