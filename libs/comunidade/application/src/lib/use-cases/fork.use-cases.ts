import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import { ContextoDeApp } from '@cosmaria/core-domain';
import {
  ConteudoNaoForkavelError,
  GrowlogForkRealizado,
  PublicacaoNaoEncontradaError,
  RegistroDeFork,
} from '@cosmaria/comunidade-domain';
import type { PerfilPublicApi } from '@cosmaria/core-public-api';
import {
  type PublicacaoComunidadeRepository,
  type RegistroDeForkRepository,
} from '../ports/comunidade.repositories';

/** Config devolvida ao cliente para pré-preencher um novo ciclo (doc 02 §9.2). */
export interface ConfiguracaoDeForkView {
  conteudoOrigemId: string;
  titulo: string | null;
  dimensoes: Record<string, string>;
}

/**
 * `POST /v1/comunidade/publicacoes/{id}/fork` (doc 06 §7.2, doc 02 §9.2).
 *
 * Fork é exclusivo do contexto Grow: copiar a configuração de um Growlog compartilhado como
 * ponto de partida de um novo cultivo. A Comunidade registra a ATRIBUIÇÃO (`RegistroDeFork`,
 * base da reputação por perfil), emite `GrowlogForkRealizado` e devolve a config — o cliente
 * inicia o novo ciclo pela API normal do Grow (o Grow nunca é acoplado aqui).
 *
 * Idempotente por (forker, publicação): forkar de novo devolve a config sem duplicar a
 * atribuição. Forkar a própria publicação é permitido (reusar o próprio cultivo como modelo).
 */
export class ForkarPublicacaoUseCase {
  constructor(
    private readonly publicacoes: PublicacaoComunidadeRepository,
    private readonly forks: RegistroDeForkRepository,
    private readonly perfis: PerfilPublicApi,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: {
    usuarioId: string;
    publicacaoId: string;
  }): Promise<ConfiguracaoDeForkView> {
    const publicacao = await this.publicacoes.buscarPorId(input.publicacaoId);
    if (!publicacao) {
      throw new PublicacaoNaoEncontradaError();
    }
    // Fork é exclusivo do Grow (doc 06 §7.2).
    if (publicacao.contexto !== ContextoDeApp.GROW) {
      throw new ConteudoNaoForkavelError();
    }

    const config: ConfiguracaoDeForkView = {
      conteudoOrigemId: publicacao.referencia.conteudoId,
      titulo: publicacao.titulo,
      dimensoes: publicacao.dimensoes,
    };

    const forker = await this.perfis.obterOuCriar(input.usuarioId, publicacao.contexto);
    if (await this.forks.existe(forker.perfilId, publicacao.id)) {
      return config;
    }

    await this.forks.salvar(
      RegistroDeFork.criar({
        id: this.idGen.gerar(),
        publicacaoOrigemId: publicacao.id,
        conteudoOrigemId: publicacao.referencia.conteudoId,
        autorOriginalPerfilId: publicacao.perfilPublicoId,
        forkerPerfilId: forker.perfilId,
        contexto: publicacao.contexto,
      }),
    );
    await this.eventos.publicar(
      new GrowlogForkRealizado(
        publicacao.id,
        publicacao.referencia.conteudoId,
        publicacao.perfilPublicoId,
        forker.perfilId,
        publicacao.contexto,
      ),
    );
    return config;
  }
}
