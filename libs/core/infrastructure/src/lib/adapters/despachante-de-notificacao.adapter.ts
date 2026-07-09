import type { DespachanteDeNotificacao, EnvioDeNotificacao } from '@cosmaria/core-application';
import { CanalDeNotificacao } from '@cosmaria/core-domain';

/**
 * Despachante de registro (doc 04 §15, Provider Agnostic — doc 13 §16.1).
 *
 * Push (FCM/APNs), e-mail e WhatsApp são provedores externos ainda **não escolhidos** —
 * decisão de negócio, como o gateway de pagamento. Até lá, este adaptador declara não
 * suportar nenhum canal externo: o Serviço de Notificações registra tudo na Central e
 * simplesmente não tem para onde despachar.
 *
 * Isso é deliberado, e não um stub esquecido: fingir sucesso de envio marcaria como
 * ENVIADA uma notificação que ninguém recebeu. Quando o provedor for escolhido, o novo
 * adaptador implementa esta mesma porta, sem tocar em nenhum caso de uso.
 */
export class DespachanteDeRegistro implements DespachanteDeNotificacao {
  private readonly enviados: EnvioDeNotificacao[] = [];

  canaisSuportados(): CanalDeNotificacao[] {
    return [];
  }

  despachar(envio: EnvioDeNotificacao): Promise<void> {
    this.enviados.push(envio);
    return Promise.resolve();
  }

  /** Inspeção em teste/dev — não faz parte da porta. */
  historico(): readonly EnvioDeNotificacao[] {
    return this.enviados;
  }
}

/**
 * Despachante de desenvolvimento: aceita todos os canais e apenas registra em memória.
 * Existe para exercitar o caminho de despacho ponta a ponta sem provedor real.
 */
export class DespachanteEmMemoria implements DespachanteDeNotificacao {
  private readonly enviados: EnvioDeNotificacao[] = [];

  canaisSuportados(): CanalDeNotificacao[] {
    return [CanalDeNotificacao.PUSH, CanalDeNotificacao.EMAIL, CanalDeNotificacao.WHATSAPP];
  }

  despachar(envio: EnvioDeNotificacao): Promise<void> {
    this.enviados.push(envio);
    return Promise.resolve();
  }

  historico(): readonly EnvioDeNotificacao[] {
    return this.enviados;
  }
}
