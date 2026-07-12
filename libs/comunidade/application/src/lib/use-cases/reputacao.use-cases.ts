import { calcularReputacao, type ReputacaoDoPerfil } from '@cosmaria/comunidade-domain';
import type { PerfilPublicApi } from '@cosmaria/core-public-api';
import {
  type PublicacaoComunidadeRepository,
  type RegistroDeForkRepository,
  type SeguimentoRepository,
} from '../ports/comunidade.repositories';

export interface ReputacaoView {
  perfilId: string;
  contexto: string;
  seguidores: number;
  publicacoes: number;
  curtidasRecebidas: number;
  comentariosRecebidos: number;
  forksRecebidos: number;
  pontuacao: number;
}

const paraReputacaoView = (r: ReputacaoDoPerfil): ReputacaoView => ({
  perfilId: r.perfilId,
  contexto: r.contexto,
  seguidores: r.seguidores,
  publicacoes: r.publicacoes,
  curtidasRecebidas: r.curtidasRecebidas,
  comentariosRecebidos: r.comentariosRecebidos,
  forksRecebidos: r.forksRecebidos,
  pontuacao: r.pontuacao,
});

/**
 * `GET /v1/comunidade/perfis/{perfilId}/reputacao` (doc 06 §7.1/§12).
 *
 * Reputação é SEMPRE por perfil e por contexto — como cada `PerfilPublico` pertence a um único
 * contexto, agregar por `perfilId` já garante que Grow e Med nunca se misturam (doc 06 §Boas
 * Práticas). É um motor de leitura: soma seguidores, curtidas/comentários recebidos e forks,
 * sem entidade/tabela própria (espelha as Estatísticas do Grow/Med).
 */
export class ObterReputacaoUseCase {
  constructor(
    private readonly perfis: PerfilPublicApi,
    private readonly seguimentos: SeguimentoRepository,
    private readonly forks: RegistroDeForkRepository,
    private readonly publicacoes: PublicacaoComunidadeRepository,
  ) {}

  async executar(input: { perfilId: string }): Promise<ReputacaoView> {
    // Lança se o perfil não existir — a superfície pública responde 404.
    const perfil = await this.perfis.obterPorId(input.perfilId);
    const [seguidores, forksRecebidos, contadores] = await Promise.all([
      this.seguimentos.contarSeguidores(perfil.perfilId),
      this.forks.contarForksRecebidos(perfil.perfilId),
      this.publicacoes.somarContadoresRecebidos(perfil.perfilId),
    ]);
    const reputacao = calcularReputacao(perfil.perfilId, perfil.contexto, {
      seguidores,
      publicacoes: contadores.publicacoes,
      curtidasRecebidas: contadores.curtidas,
      comentariosRecebidos: contadores.comentarios,
      forksRecebidos,
    });
    return paraReputacaoView(reputacao);
  }
}
