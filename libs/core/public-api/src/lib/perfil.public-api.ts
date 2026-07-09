import type { ContextoDeApp } from '@cosmaria/core-domain';
import type { PerfilView } from '@cosmaria/core-application';

/**
 * Interface pública da Identidade Social (doc 06 / doc 14 §10) — o ÚNICO ponto pelo
 * qual Comunidade, Grow e Med resolvem o Perfil Público de uma Conta num contexto.
 *
 * Deliberadamente estreita (ISP, doc 04 §4): não expõe `usuarioId` em lugar nenhum,
 * então nenhum módulo consumidor consegue, nem por engano, correlacionar o perfil Grow
 * e o perfil Med da mesma Conta. Perfis de contextos diferentes só aparecem juntos em
 * `perfisVinculadosPublicamente`, que exige `RegistroDeVinculoDePerfis` vigente.
 *
 * A implementação é fornecida pelo apps/api (composition root).
 */
export interface PerfilPublicApi {
  /** Resolve (criando na primeira vez) o perfil da Conta naquele contexto — idempotente. */
  obterOuCriar(usuarioId: string, contexto: ContextoDeApp): Promise<PerfilView>;

  /** Leitura pública de um perfil por id. Lança se não existir. */
  obterPorId(perfilId: string): Promise<PerfilView>;

  /** Perfis de outros contextos ligados a este — vazio sem vínculo vigente e visível. */
  perfisVinculadosPublicamente(perfilId: string): Promise<PerfilView[]>;
}

/** Token de injeção da interface pública de identidade social. */
export const PERFIL_PUBLIC_API = Symbol('PerfilPublicApi');
