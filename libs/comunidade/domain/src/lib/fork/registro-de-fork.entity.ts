import type { ContextoDeApp } from '@cosmaria/core-domain';

/**
 * RegistroDeFork (doc 06 §8, doc 02 §9.2 — exclusivo do contexto Grow).
 *
 * "Fork" = copiar a configuração de um Growlog compartilhado como ponto de partida de um novo
 * cultivo. A Comunidade guarda apenas a ATRIBUIÇÃO (quem forkou de quem): a config em si volta
 * ao cliente, que inicia o novo ciclo pela API normal do Grow. É o grafo que alimenta a
 * reputação por perfil (Com-5) e a futura notificação ao autor original.
 */
export interface RegistroDeForkProps {
  id: string;
  publicacaoOrigemId: string;
  /** ID do conteúdo de origem no Grow (o Ciclo) — o que o cliente vai reusar. */
  conteudoOrigemId: string;
  autorOriginalPerfilId: string;
  forkerPerfilId: string;
  contexto: ContextoDeApp;
  criadoEm: Date;
}

export class RegistroDeFork {
  private constructor(private readonly props: RegistroDeForkProps) {}

  static reconstituir(props: RegistroDeForkProps): RegistroDeFork {
    return new RegistroDeFork(props);
  }

  static criar(params: {
    id: string;
    publicacaoOrigemId: string;
    conteudoOrigemId: string;
    autorOriginalPerfilId: string;
    forkerPerfilId: string;
    contexto: ContextoDeApp;
    criadoEm?: Date;
  }): RegistroDeFork {
    return new RegistroDeFork({ ...params, criadoEm: params.criadoEm ?? new Date() });
  }

  get id(): string {
    return this.props.id;
  }
  get publicacaoOrigemId(): string {
    return this.props.publicacaoOrigemId;
  }
  get conteudoOrigemId(): string {
    return this.props.conteudoOrigemId;
  }
  get autorOriginalPerfilId(): string {
    return this.props.autorOriginalPerfilId;
  }
  get forkerPerfilId(): string {
    return this.props.forkerPerfilId;
  }
  get contexto(): ContextoDeApp {
    return this.props.contexto;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
}
