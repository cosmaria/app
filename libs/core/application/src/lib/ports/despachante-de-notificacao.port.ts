import type {
  CanalDeNotificacao,
  ConteudoDeNotificacao,
  CategoriaDeNotificacao,
} from '@cosmaria/core-domain';

export interface EnvioDeNotificacao {
  usuarioId: string;
  canal: CanalDeNotificacao;
  categoria: CategoriaDeNotificacao;
  /** Já resolvido pelo Modo Discreto — o despachante nunca vê o conteúdo sensível. */
  conteudo: ConteudoDeNotificacao;
}

/**
 * Porta de despacho multi-canal (doc 04 §15, Provider Agnostic — doc 13 §16.1).
 *
 * Push (FCM/APNs), e-mail e WhatsApp são provedores externos ainda não escolhidos; o
 * adaptador concreto vive na Infraestrutura e trocá-lo não toca em nenhum caso de uso.
 *
 * Recebe o conteúdo **já filtrado pelo Modo Discreto**: nenhum adaptador tem acesso ao
 * texto sensível, então nenhum provedor externo pode vazá-lo por engano.
 */
export interface DespachanteDeNotificacao {
  /** Canais que este despachante sabe entregar. Os demais são ignorados. */
  canaisSuportados(): CanalDeNotificacao[];

  /** Entrega um envio. Falha de canal externo nunca derruba o fluxo de domínio. */
  despachar(envio: EnvioDeNotificacao): Promise<void>;
}

export const DESPACHANTE_DE_NOTIFICACAO = Symbol('DespachanteDeNotificacao');
