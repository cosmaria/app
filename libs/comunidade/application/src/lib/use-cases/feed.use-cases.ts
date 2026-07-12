import { type ContextoDeApp, type ContextoDeVisualizacao } from '@cosmaria/core-domain';
import { PublicacaoComunidade, PublicacaoNaoEncontradaError } from '@cosmaria/comunidade-domain';
import type { PerfilPublicApi } from '@cosmaria/core-public-api';
import {
  type FiltroDeFeed,
  type PublicacaoComunidadeRepository,
  type SeguimentoRepository,
} from '../ports/comunidade.repositories';

/** Projeção de leitura de uma publicação (o snapshot que o feed/detalhe expõem). */
export interface PublicacaoView {
  publicacaoId: string;
  perfilPublicoId: string;
  contexto: string;
  modulo: string;
  tipoConteudo: string;
  conteudoId: string;
  titulo: string | null;
  resumo: string | null;
  dimensoes: Record<string, string>;
  curtidas: number;
  comentarios: number;
  publicadoEm: string;
}

export const paraPublicacaoView = (p: PublicacaoComunidade): PublicacaoView => ({
  publicacaoId: p.id,
  perfilPublicoId: p.perfilPublicoId,
  contexto: p.contexto,
  modulo: p.referencia.modulo,
  tipoConteudo: p.referencia.tipoConteudo,
  conteudoId: p.referencia.conteudoId,
  titulo: p.titulo,
  resumo: p.resumo,
  dimensoes: p.dimensoes,
  curtidas: p.curtidas,
  comentarios: p.comentarios,
  publicadoEm: p.publicadoEm.toISOString(),
});

const LIMITE_PADRAO = 20;
const LIMITE_MAXIMO = 100;

export const normalizarLimite = (limite?: number): number =>
  Math.min(Math.max(1, Math.trunc(limite ?? LIMITE_PADRAO)), LIMITE_MAXIMO);

/**
 * `GET /v1/comunidade/feed?contexto=grow|med` (doc 06 §Lista de APIs).
 *
 * Escopado por contexto: um feed do Grow nunca mostra publicações do Med, mesmo da mesma
 * Conta (doc 06 §2). O Perfil Público do visualizador é resolvido pela PERFIL_PUBLIC_API —
 * a Comunidade nunca conhece o `usuarioId`. Publicações de escopo SEGUIDORES entram no feed
 * quando o visualizador segue o autor (grafo social, doc 06 §12).
 */
export class ObterFeedUseCase {
  constructor(
    private readonly repo: PublicacaoComunidadeRepository,
    private readonly perfis: PerfilPublicApi,
    private readonly seguimentos: SeguimentoRepository,
  ) {}

  async executar(input: {
    usuarioId: string;
    contexto: ContextoDeApp;
    limite?: number;
    publicadasAntesDe?: Date;
  }): Promise<PublicacaoView[]> {
    const perfil = await this.perfis.obterOuCriar(input.usuarioId, input.contexto);
    const seguindoPerfilIds = await this.seguimentos.listarSeguidosIds(perfil.perfilId);
    const filtro: FiltroDeFeed = {
      perfilDoVisualizador: perfil.perfilId,
      seguindoPerfilIds,
      limite: normalizarLimite(input.limite),
      publicadasAntesDe: input.publicadasAntesDe,
    };
    const publicacoes = await this.repo.listarFeed(input.contexto, filtro);
    return publicacoes.map(paraPublicacaoView);
  }
}

/**
 * `GET /v1/comunidade/publicacoes/{id}`.
 *
 * Aplica a regra de escopo do Motor de Privacidade: quem não pode ver recebe 404 (não 403 —
 * não confirmamos a existência de conteúdo fora do alcance, doc 06 §13). O contexto de
 * seguidor é resolvido pelo grafo social.
 */
export class ObterPublicacaoUseCase {
  constructor(
    private readonly repo: PublicacaoComunidadeRepository,
    private readonly perfis: PerfilPublicApi,
    private readonly seguimentos: SeguimentoRepository,
  ) {}

  async executar(input: { usuarioId: string; publicacaoId: string }): Promise<PublicacaoView> {
    const publicacao = await this.repo.buscarPorId(input.publicacaoId);
    if (!publicacao) {
      throw new PublicacaoNaoEncontradaError();
    }
    const perfil = await this.perfis.obterOuCriar(input.usuarioId, publicacao.contexto);
    const ehAutor = publicacao.publicadoPor(perfil.perfilId);
    const ehSeguidor =
      !ehAutor && (await this.seguimentos.existe(perfil.perfilId, publicacao.perfilPublicoId));
    const ctx: ContextoDeVisualizacao = {
      ehAutor,
      ehSeguidor,
      ehAmigo: false,
      possuiLink: false,
    };
    if (!publicacao.visivelPara(ctx)) {
      throw new PublicacaoNaoEncontradaError();
    }
    return paraPublicacaoView(publicacao);
  }
}
