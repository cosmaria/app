import {
  CANAIS_EXTERNOS,
  CanalDeNotificacao,
  type CategoriaDeNotificacao,
} from './categoria-e-canal';
import type { PreferenciaDeNotificacao } from './preferencia-de-notificacao.entity';

export interface DecisaoDeDespacho {
  /** Canais externos que podem receber a notificação agora. Pode ser vazio. */
  canaisExternos: CanalDeNotificacao[];
  /** true quando nada sai por canal externo — a notificação fica só na Central. */
  silenciada: boolean;
  /** Por que foi silenciada. Vazio quando `silenciada` é false. */
  motivo: 'PREFERENCIA' | 'HORARIO_DE_SILENCIO' | 'REPETIDA' | null;
}

/**
 * Motor puro de despacho (doc 04 §15). Decide, sem tocar em banco nem em canal, o que
 * sai e por onde — a mesma separação do MotorDePrivacidade.
 *
 * Regra que não se negocia: **silenciar nunca descarta**. Toda notificação é registrada
 * na Central (canal IN_APP); o silêncio só impede o envio externo. Um usuário em
 * horário de silêncio encontra tudo ao abrir o app.
 *
 * `repetida` vem da camada de aplicação (janela anti-spam via cache) — o domínio não
 * sabe o que é Redis, mas sabe o que fazer com a resposta.
 */
export const PoliticaDeDespacho = {
  decidir(params: {
    preferencia: PreferenciaDeNotificacao;
    categoria: CategoriaDeNotificacao;
    /** Hora local do usuário, em minutos desde a meia-noite. */
    minutosDoDia: number;
    repetida: boolean;
  }): DecisaoDeDespacho {
    const silenciada = (motivo: DecisaoDeDespacho['motivo']): DecisaoDeDespacho => ({
      canaisExternos: [],
      silenciada: true,
      motivo,
    });

    // Anti-spam vem primeiro: uma repetição não deve nem consultar preferências.
    if (params.repetida) {
      return silenciada('REPETIDA');
    }

    if (params.preferencia.estaEmSilencio(params.minutosDoDia)) {
      return silenciada('HORARIO_DE_SILENCIO');
    }

    const habilitados = params.preferencia.canaisDe(params.categoria);
    const externos = habilitados.filter((canal) => CANAIS_EXTERNOS.includes(canal));

    return externos.length === 0
      ? silenciada('PREFERENCIA')
      : { canaisExternos: externos, silenciada: false, motivo: null };
  },
} as const;
