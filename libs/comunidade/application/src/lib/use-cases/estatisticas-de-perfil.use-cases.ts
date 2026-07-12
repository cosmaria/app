import {
  EstatisticasExclusivasPremiumError,
  PublicacaoNaoEncontradaError,
} from '@cosmaria/comunidade-domain';
import type { PerfilPublicApi, PremiumPublicApi } from '@cosmaria/core-public-api';
import {
  type ContagemDiaria,
  type PublicacaoComunidadeRepository,
  type RegistroDeForkRepository,
  type SeguimentoRepository,
  type VisualizacaoDePerfilRepository,
} from '../ports/comunidade.repositories';

const diaDe = (data: Date): string => data.toISOString().slice(0, 10);

/**
 * `POST /v1/comunidade/perfis/{perfilId}/visualizacao` (doc 06 §11).
 *
 * Registra uma visita AGREGADA por dia — nunca guarda quem visitou (minimização de dado,
 * doc 08). Registrar é livre (não é Premium). O dono visitando o próprio perfil não conta.
 */
export class RegistrarVisualizacaoDePerfilUseCase {
  constructor(
    private readonly visualizacoes: VisualizacaoDePerfilRepository,
    private readonly perfis: PerfilPublicApi,
  ) {}

  async executar(input: { usuarioId: string; perfilId: string; em?: Date }): Promise<void> {
    const alvo = await this.perfis.obterPorId(input.perfilId);
    const visitante = await this.perfis.obterOuCriar(input.usuarioId, alvo.contexto);
    // Visita ao próprio perfil não infla a estatística.
    if (visitante.perfilId === alvo.perfilId) {
      return;
    }
    await this.visualizacoes.incrementar(alvo.perfilId, diaDe(input.em ?? new Date()));
  }
}

export interface EstatisticasDePerfilView {
  perfilId: string;
  contexto: string;
  visualizacoesTotais: number;
  visualizacoesPorDia: ContagemDiaria[];
  publicacoes: number;
  curtidasRecebidas: number;
  comentariosRecebidos: number;
  forksRecebidos: number;
  seguidores: number;
}

/**
 * `GET /v1/comunidade/perfis/{perfilId}/estatisticas` (doc 06 §11 — Premium).
 *
 * Estatísticas avançadas ("quem visitou" em agregado, alcance). Duas barreiras: só o DONO do
 * perfil vê as próprias estatísticas (senão 404, sem confirmar existência), e só com Premium
 * (senão 402 — gatilho de paywall, doc 07 §4). Participação básica na Comunidade nunca é paga
 * (doc 06 §11): isto é estatística avançada, não o loop central.
 */
export class ObterEstatisticasDePerfilUseCase {
  private static readonly JANELA_DIAS = 30;

  constructor(
    private readonly perfis: PerfilPublicApi,
    private readonly premium: PremiumPublicApi,
    private readonly visualizacoes: VisualizacaoDePerfilRepository,
    private readonly seguimentos: SeguimentoRepository,
    private readonly forks: RegistroDeForkRepository,
    private readonly publicacoes: PublicacaoComunidadeRepository,
  ) {}

  async executar(input: {
    usuarioId: string;
    perfilId: string;
  }): Promise<EstatisticasDePerfilView> {
    const alvo = await this.perfis.obterPorId(input.perfilId);
    const requerente = await this.perfis.obterOuCriar(input.usuarioId, alvo.contexto);
    // Estatística de perfil é do dono: outro perfil recebe 404 (não confirma existência).
    if (requerente.perfilId !== alvo.perfilId) {
      throw new PublicacaoNaoEncontradaError();
    }
    if (!(await this.premium.ehPremium(input.usuarioId))) {
      throw new EstatisticasExclusivasPremiumError();
    }

    const desde = new Date();
    desde.setUTCDate(desde.getUTCDate() - ObterEstatisticasDePerfilUseCase.JANELA_DIAS);
    const desdeDia = desde.toISOString().slice(0, 10);

    const [visualizacoesTotais, visualizacoesPorDia, seguidores, forksRecebidos, contadores] =
      await Promise.all([
        this.visualizacoes.total(alvo.perfilId),
        this.visualizacoes.porDia(alvo.perfilId, desdeDia),
        this.seguimentos.contarSeguidores(alvo.perfilId),
        this.forks.contarForksRecebidos(alvo.perfilId),
        this.publicacoes.somarContadoresRecebidos(alvo.perfilId),
      ]);

    return {
      perfilId: alvo.perfilId,
      contexto: alvo.contexto,
      visualizacoesTotais,
      visualizacoesPorDia,
      publicacoes: contadores.publicacoes,
      curtidasRecebidas: contadores.curtidas,
      comentariosRecebidos: contadores.comentarios,
      forksRecebidos,
      seguidores,
    };
  }
}
