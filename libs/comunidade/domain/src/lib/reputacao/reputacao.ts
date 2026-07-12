import type { ContextoDeApp } from '@cosmaria/core-domain';

/**
 * Sinais sociais que um perfil acumulou, sempre num único contexto (doc 06 §12).
 * Nada aqui cruza contextos: cada `PerfilPublico` pertence a um contexto, e a reputação do
 * perfil Grow nunca influencia a do perfil Med da mesma Conta (doc 06 §Boas Práticas).
 */
export interface SinaisDeReputacao {
  seguidores: number;
  publicacoes: number;
  curtidasRecebidas: number;
  comentariosRecebidos: number;
  forksRecebidos: number;
}

/** Reputação calculada de um perfil (motor de leitura — sem entidade/tabela própria). */
export interface ReputacaoDoPerfil extends SinaisDeReputacao {
  perfilId: string;
  contexto: ContextoDeApp;
  /** Pontuação heurística do MVP — parâmetro calibrável, nunca regra rígida (doc 02 §19). */
  pontuacao: number;
}

/**
 * Pesos do MVP para a pontuação de reputação. Deliberadamente simples e transparentes; selos
 * avançados (ex.: "ciclo validado") são Versão 2 (doc 02 §19). Fork pesa mais que curtida:
 * copiar um cultivo é um sinal de confiança mais forte que curtir.
 */
export const PESOS_REPUTACAO = {
  seguidor: 2,
  curtida: 1,
  comentario: 1,
  fork: 3,
} as const;

export function calcularReputacao(
  perfilId: string,
  contexto: ContextoDeApp,
  sinais: SinaisDeReputacao,
): ReputacaoDoPerfil {
  const pontuacao =
    sinais.seguidores * PESOS_REPUTACAO.seguidor +
    sinais.curtidasRecebidas * PESOS_REPUTACAO.curtida +
    sinais.comentariosRecebidos * PESOS_REPUTACAO.comentario +
    sinais.forksRecebidos * PESOS_REPUTACAO.fork;
  return { perfilId, contexto, ...sinais, pontuacao };
}
