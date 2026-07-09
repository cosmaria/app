import type { ConfiguracaoDeCompartilhamento } from './configuracao-de-compartilhamento.entity';
import type { ContextoDeVisualizacao } from './contexto-de-visualizacao';
import { Escopo } from './escopo';

/**
 * Motor de Privacidade Granular (doc 04 §12) — domínio puro.
 * Decide, por dimensão, se um visualizador pode ver o dado, a partir do escopo
 * configurado pelo autor e da relação do visualizador com ele. É o ÚNICO ponto de
 * decisão de visibilidade — feed, busca e fork consomem daqui (doc 02 §9.1) para
 * que não exista um segundo caminho por onde dado sensível vaze.
 */
export class MotorDePrivacidade {
  /** O escopo permite que este visualizador veja a dimensão? O autor sempre vê tudo. */
  static escopoPermite(escopo: Escopo, ctx: ContextoDeVisualizacao): boolean {
    if (ctx.ehAutor) {
      return true;
    }
    switch (escopo) {
      case Escopo.PUBLICO:
        return true;
      case Escopo.LINK:
        return ctx.possuiLink;
      case Escopo.SEGUIDORES:
        return ctx.ehSeguidor || ctx.ehAmigo;
      case Escopo.AMIGOS:
        return ctx.ehAmigo;
      case Escopo.PRIVADO:
        return false;
      default:
        return false;
    }
  }

  /** Dentre as dimensões candidatas, quais o visualizador pode ver. */
  static dimensoesVisiveis(
    config: ConfiguracaoDeCompartilhamento,
    ctx: ContextoDeVisualizacao,
    dimensoes: readonly string[],
  ): string[] {
    return dimensoes.filter((dim) => this.escopoPermite(config.escopoDaDimensao(dim), ctx));
  }

  /**
   * Filtra um conteúdo (mapa dimensão → valor), removendo as dimensões que o
   * visualizador não pode ver. Dimensões não configuradas herdam o escopo padrão
   * (PRIVADO) — logo, ficam ocultas por padrão.
   */
  static filtrar<T>(
    config: ConfiguracaoDeCompartilhamento,
    ctx: ContextoDeVisualizacao,
    dados: Readonly<Record<string, T>>,
  ): Record<string, T> {
    const visivel: Record<string, T> = {};
    for (const [dim, valor] of Object.entries(dados)) {
      if (this.escopoPermite(config.escopoDaDimensao(dim), ctx)) {
        visivel[dim] = valor;
      }
    }
    return visivel;
  }
}
