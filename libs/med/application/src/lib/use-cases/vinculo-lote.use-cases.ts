import type { EventPublisher } from '@cosmaria/core-application';
import type { GrowPublicApi } from '@cosmaria/grow-public-api';
import {
  LoteNaoEncontradoParaVinculoError,
  ProdutoDesvinculadoDoLote,
  ProdutoVinculadoALote,
} from '@cosmaria/med-domain';
import { ProdutoRepository } from '../ports/med.repositories';
import { buscarProdutoDoDono, paraProdutoView, type ProdutoView } from './produto.use-cases';

/**
 * `POST /v1/produtos/{id}/vincular-lote` (doc 03 §5.2/§18, doc 09).
 *
 * Vínculo OPT-IN entre um produto do Med e um Lote do próprio cultivo (Grow) — a integração
 * Grow↔Med nunca é automática (doc 00). O Med resolve o Lote **pela public-api do Grow**
 * (por ID + snapshot, doc 04 §23) e nunca lê o schema do Grow. Publica `ProdutoVinculadoALote`,
 * o consentimento que habilita a IA a considerar dados do Grow na correlação cruzada.
 * Idempotente: revincular ao mesmo lote apenas reatualiza o snapshot.
 */
export class VincularProdutoALoteUseCase {
  constructor(
    private readonly produtos: ProdutoRepository,
    private readonly grow: GrowPublicApi,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: {
    usuarioId: string;
    produtoId: string;
    loteId: string;
  }): Promise<ProdutoView> {
    const produto = await buscarProdutoDoDono(this.produtos, input.usuarioId, input.produtoId);

    // Lote inexistente ou de outro usuário responde igual: 404 (não confirma existência).
    const snapshot = await this.grow.obterLoteSnapshot(input.usuarioId, input.loteId);
    if (!snapshot) {
      throw new LoteNaoEncontradoParaVinculoError();
    }

    produto.vincularLote({
      loteId: snapshot.loteId,
      codigo: snapshot.codigo,
      pesoSecoGramas: snapshot.pesoSecoGramas,
      geradoEm: new Date(snapshot.geradoEm),
    });
    await this.produtos.salvar(produto);
    await this.eventos.publicar(
      new ProdutoVinculadoALote(produto.id, produto.usuarioId, snapshot.loteId),
    );
    return paraProdutoView(produto);
  }
}

/** `DELETE /v1/produtos/{id}/vincular-lote` — opt-out; idempotente. */
export class DesvincularProdutoDoLoteUseCase {
  constructor(
    private readonly produtos: ProdutoRepository,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: { usuarioId: string; produtoId: string }): Promise<void> {
    const produto = await buscarProdutoDoDono(this.produtos, input.usuarioId, input.produtoId);
    const estavaVinculado = produto.estaVinculadoALote();
    produto.desvincularLote();
    await this.produtos.salvar(produto);
    if (estavaVinculado) {
      await this.eventos.publicar(new ProdutoDesvinculadoDoLote(produto.id, produto.usuarioId));
    }
  }
}
