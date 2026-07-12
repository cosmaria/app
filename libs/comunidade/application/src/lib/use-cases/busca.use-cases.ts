import { type ContextoDeApp } from '@cosmaria/core-domain';
import type { PerfilPublicApi } from '@cosmaria/core-public-api';
import {
  type FiltroDeBusca,
  type PublicacaoComunidadeRepository,
  type SeguimentoRepository,
} from '../ports/comunidade.repositories';
import { normalizarLimite, paraPublicacaoView, type PublicacaoView } from './feed.use-cases';

/**
 * `GET /v1/comunidade/busca?contexto=&chave=&valor=` (doc 06 §7.1, §Lista de APIs).
 *
 * Busca ESTRUTURADA por parâmetro técnico (genética/LED/fertilizante no Grow; produto/
 * sintoma/concentração no Med) — não busca em texto livre. Escopada por contexto, e limitada
 * ao que o visualizador pode ver (PUBLICO de todos + SEGUIDORES de quem ele segue + o que é
 * dele), exatamente como o feed.
 */
export class BuscarPublicacoesUseCase {
  constructor(
    private readonly repo: PublicacaoComunidadeRepository,
    private readonly perfis: PerfilPublicApi,
    private readonly seguimentos: SeguimentoRepository,
  ) {}

  async executar(input: {
    usuarioId: string;
    contexto: ContextoDeApp;
    chave: string;
    valor: string;
    limite?: number;
  }): Promise<PublicacaoView[]> {
    const perfil = await this.perfis.obterOuCriar(input.usuarioId, input.contexto);
    const seguindoPerfilIds = await this.seguimentos.listarSeguidosIds(perfil.perfilId);
    const filtro: FiltroDeBusca = {
      perfilDoVisualizador: perfil.perfilId,
      seguindoPerfilIds,
      chave: input.chave,
      valor: input.valor,
      limite: normalizarLimite(input.limite),
    };
    const publicacoes = await this.repo.buscar(input.contexto, filtro);
    return publicacoes.map(paraPublicacaoView);
  }
}
