import type { IdentidadeAutenticada } from '@cosmaria/core-application';

/**
 * Interface pública de autenticação do Core (doc 04 §9 / doc 14 §10).
 *
 * É o ÚNICO ponto pelo qual outros módulos (Grow, Med, Comunidade, IA) validam
 * um access token e obtêm a identidade do usuário — eles dependem só deste
 * contrato, nunca do interior do Core. A implementação é fornecida pelo apps/api
 * (composition root), ligada ao ValidarAccessTokenUseCase.
 */
export interface AutenticacaoPublicApi {
  /** Valida o access token e devolve a identidade; lança se inválido/expirado. */
  validar(accessToken: string): IdentidadeAutenticada;
}

/** Token de injeção da interface pública de autenticação. */
export const AUTENTICACAO_PUBLIC_API = Symbol('AutenticacaoPublicApi');

export type { IdentidadeAutenticada };
