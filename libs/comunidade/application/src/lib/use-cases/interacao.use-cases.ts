import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import {
  Comentario,
  Curtida,
  PerfilSeguido,
  PublicacaoComentada,
  PublicacaoCurtida,
  PublicacaoNaoEncontradaError,
  Seguimento,
  SeguimentoInvalidoError,
} from '@cosmaria/comunidade-domain';
import type { PerfilPublicApi } from '@cosmaria/core-public-api';
import {
  type ComentarioRepository,
  type CurtidaRepository,
  type PublicacaoComunidadeRepository,
  type SeguimentoRepository,
} from '../ports/comunidade.repositories';

export interface ComentarioView {
  comentarioId: string;
  perfilPublicoId: string;
  texto: string;
  criadoEm: string;
}

const paraComentarioView = (c: Comentario): ComentarioView => ({
  comentarioId: c.id,
  perfilPublicoId: c.perfilId,
  texto: c.texto,
  criadoEm: c.criadoEm.toISOString(),
});

/**
 * `POST /v1/comunidade/seguir/{perfilId}` (doc 06 §Lista de APIs).
 *
 * Seguir é sempre entre dois perfis do **mesmo contexto** (doc 06 §2). O `perfilId` alvo é
 * de um contexto; o seguidor é resolvido nesse mesmo contexto. Seguir a si mesmo ou um perfil
 * de outro contexto é recusado. Idempotente: seguir de novo não duplica nem erra.
 */
export class SeguirPerfilUseCase {
  constructor(
    private readonly seguimentos: SeguimentoRepository,
    private readonly perfis: PerfilPublicApi,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: { usuarioId: string; perfilAlvoId: string }): Promise<void> {
    const alvo = await this.perfis.obterPorId(input.perfilAlvoId);
    // O seguidor é o perfil do próprio visualizador NO MESMO contexto do alvo.
    const seguidor = await this.perfis.obterOuCriar(input.usuarioId, alvo.contexto);
    if (seguidor.perfilId === alvo.perfilId) {
      throw new SeguimentoInvalidoError();
    }
    if (await this.seguimentos.existe(seguidor.perfilId, alvo.perfilId)) {
      return;
    }
    const seguimento = Seguimento.criar({
      id: this.idGen.gerar(),
      seguidorPerfilId: seguidor.perfilId,
      seguidoPerfilId: alvo.perfilId,
      contexto: alvo.contexto,
    });
    await this.seguimentos.salvar(seguimento);
    await this.eventos.publicar(new PerfilSeguido(alvo.perfilId, seguidor.perfilId, alvo.contexto));
  }
}

/** `DELETE /v1/comunidade/seguir/{perfilId}` — deixar de seguir; idempotente. */
export class DeixarDeSeguirUseCase {
  constructor(
    private readonly seguimentos: SeguimentoRepository,
    private readonly perfis: PerfilPublicApi,
  ) {}

  async executar(input: { usuarioId: string; perfilAlvoId: string }): Promise<void> {
    const alvo = await this.perfis.obterPorId(input.perfilAlvoId);
    const seguidor = await this.perfis.obterOuCriar(input.usuarioId, alvo.contexto);
    await this.seguimentos.remover(seguidor.perfilId, alvo.perfilId);
  }
}

/** `POST /v1/comunidade/publicacoes/{id}/curtir` — idempotente; incrementa o contador. */
export class CurtirPublicacaoUseCase {
  constructor(
    private readonly curtidas: CurtidaRepository,
    private readonly publicacoes: PublicacaoComunidadeRepository,
    private readonly perfis: PerfilPublicApi,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: { usuarioId: string; publicacaoId: string }): Promise<void> {
    const publicacao = await this.publicacoes.buscarPorId(input.publicacaoId);
    if (!publicacao) {
      throw new PublicacaoNaoEncontradaError();
    }
    const perfil = await this.perfis.obterOuCriar(input.usuarioId, publicacao.contexto);
    if (await this.curtidas.existe(perfil.perfilId, publicacao.id)) {
      return;
    }
    await this.curtidas.salvar(
      Curtida.criar({
        id: this.idGen.gerar(),
        perfilId: perfil.perfilId,
        publicacaoId: publicacao.id,
        contexto: publicacao.contexto,
      }),
    );
    await this.publicacoes.ajustarCurtidas(publicacao.id, +1);
    await this.eventos.publicar(
      new PublicacaoCurtida(
        publicacao.id,
        publicacao.perfilPublicoId,
        perfil.perfilId,
        publicacao.contexto,
      ),
    );
  }
}

/** `DELETE /v1/comunidade/publicacoes/{id}/curtir` — descurtir; idempotente. */
export class DescurtirPublicacaoUseCase {
  constructor(
    private readonly curtidas: CurtidaRepository,
    private readonly publicacoes: PublicacaoComunidadeRepository,
    private readonly perfis: PerfilPublicApi,
  ) {}

  async executar(input: { usuarioId: string; publicacaoId: string }): Promise<void> {
    const publicacao = await this.publicacoes.buscarPorId(input.publicacaoId);
    if (!publicacao) {
      throw new PublicacaoNaoEncontradaError();
    }
    const perfil = await this.perfis.obterOuCriar(input.usuarioId, publicacao.contexto);
    if (!(await this.curtidas.existe(perfil.perfilId, publicacao.id))) {
      return;
    }
    await this.curtidas.remover(perfil.perfilId, publicacao.id);
    await this.publicacoes.ajustarCurtidas(publicacao.id, -1);
  }
}

/** `POST /v1/comunidade/publicacoes/{id}/comentarios` — comenta; incrementa o contador. */
export class ComentarPublicacaoUseCase {
  constructor(
    private readonly comentarios: ComentarioRepository,
    private readonly publicacoes: PublicacaoComunidadeRepository,
    private readonly perfis: PerfilPublicApi,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: {
    usuarioId: string;
    publicacaoId: string;
    texto: string;
  }): Promise<ComentarioView> {
    const publicacao = await this.publicacoes.buscarPorId(input.publicacaoId);
    if (!publicacao) {
      throw new PublicacaoNaoEncontradaError();
    }
    const perfil = await this.perfis.obterOuCriar(input.usuarioId, publicacao.contexto);
    const comentario = Comentario.criar({
      id: this.idGen.gerar(),
      perfilId: perfil.perfilId,
      publicacaoId: publicacao.id,
      contexto: publicacao.contexto,
      texto: input.texto,
    });
    await this.comentarios.salvar(comentario);
    await this.publicacoes.ajustarComentarios(publicacao.id, +1);
    await this.eventos.publicar(
      new PublicacaoComentada(
        publicacao.id,
        publicacao.perfilPublicoId,
        perfil.perfilId,
        comentario.id,
        publicacao.contexto,
      ),
    );
    return paraComentarioView(comentario);
  }
}

/** `GET /v1/comunidade/publicacoes/{id}/comentarios` — lista os comentários (recentes primeiro). */
export class ListarComentariosUseCase {
  constructor(
    private readonly comentarios: ComentarioRepository,
    private readonly publicacoes: PublicacaoComunidadeRepository,
  ) {}

  async executar(input: { publicacaoId: string; limite?: number }): Promise<ComentarioView[]> {
    const publicacao = await this.publicacoes.buscarPorId(input.publicacaoId);
    if (!publicacao) {
      throw new PublicacaoNaoEncontradaError();
    }
    const limite = Math.min(Math.max(1, Math.trunc(input.limite ?? 50)), 200);
    const lista = await this.comentarios.listarPorPublicacao(publicacao.id, limite);
    return lista.map(paraComentarioView);
  }
}
