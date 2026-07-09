/**
 * Categorias de notificação (doc 04 §15). O usuário liga/desliga canais **por
 * categoria**, nunca "tudo ou nada" — é o que permite receber alerta de cultivo por
 * push e aviso de cobrança só por e-mail.
 *
 * Novas categorias (Grow, Med, Comunidade) entram aqui sem migração destrutiva:
 * categoria sem preferência gravada cai no padrão (ver `PreferenciaDeNotificacao`).
 */
export enum CategoriaDeNotificacao {
  /** Tarefas e lembretes de cultivo/tratamento. */
  TAREFA = 'TAREFA',
  /** Alertas e insights gerados pela IA (doc 05). */
  ALERTA_IA = 'ALERTA_IA',
  /** Interação social: novo seguidor, comentário, curtida (doc 06). */
  SOCIAL = 'SOCIAL',
  /** Assinatura, cobrança e limites de plano (doc 07). */
  BILLING = 'BILLING',
  /** Avisos operacionais da plataforma (segurança, manutenção). */
  SISTEMA = 'SISTEMA',
}

export function ehCategoriaDeNotificacaoValida(valor: string): valor is CategoriaDeNotificacao {
  return (Object.values(CategoriaDeNotificacao) as string[]).includes(valor);
}

/**
 * Canais de despacho (doc 04 §15). `IN_APP` é especial: é o registro na Central de
 * Notificações, sempre disponível — mesmo quando todos os canais externos estão
 * silenciados, a notificação fica **registrada sem envio**, e o usuário a encontra
 * quando abrir o app. Silenciar nunca significa perder a informação.
 */
export enum CanalDeNotificacao {
  IN_APP = 'IN_APP',
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
  WHATSAPP = 'WHATSAPP',
}

export function ehCanalDeNotificacaoValido(valor: string): valor is CanalDeNotificacao {
  return (Object.values(CanalDeNotificacao) as string[]).includes(valor);
}

/** Canais externos: os que efetivamente alcançam o usuário fora do app. */
export const CANAIS_EXTERNOS: readonly CanalDeNotificacao[] = [
  CanalDeNotificacao.PUSH,
  CanalDeNotificacao.EMAIL,
  CanalDeNotificacao.WHATSAPP,
];
