import type { ContextoDeApp, PerfilPublico } from '@cosmaria/core-domain';

/**
 * Projeção de leitura de um PerfilPúblico.
 * NUNCA expõe `usuarioId` — a Conta jamais é revelada à Comunidade (doc 08 §12.1);
 * é exatamente o que impediria alguém de correlacionar o perfil Grow e o perfil Med
 * da mesma pessoa. O `nomeSugerido` acompanha para a UI oferecer um nome neutro sem
 * que o perfil deixe de nascer anônimo.
 */
export interface PerfilView {
  perfilId: string;
  contexto: ContextoDeApp;
  nomeExibicao: string | null;
  nomeSugerido: string;
  avatarUrl: string | null;
  biografia: string | null;
  anonimo: boolean;
}

export const paraPerfilView = (perfil: PerfilPublico): PerfilView => ({
  perfilId: perfil.id,
  contexto: perfil.contexto,
  nomeExibicao: perfil.nomeExibicao,
  nomeSugerido: perfil.nomeSugerido(),
  avatarUrl: perfil.avatarUrl,
  biografia: perfil.biografia,
  anonimo: perfil.ehAnonimo(),
});
