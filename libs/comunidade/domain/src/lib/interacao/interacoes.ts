import type { ContextoDeApp } from '@cosmaria/core-domain';

/**
 * Seguimento (doc 06 §12) — aresta do grafo social entre dois `PerfilPublico` do **mesmo
 * contexto**. Seguir através de contextos é impossível por construção: o caso de uso resolve
 * ambos os perfis no mesmo contexto e recusa o resto (doc 06 §2). Idempotente pela chave
 * natural (seguidor, seguido).
 */
export interface SeguimentoProps {
  id: string;
  seguidorPerfilId: string;
  seguidoPerfilId: string;
  contexto: ContextoDeApp;
  criadoEm: Date;
}

export class Seguimento {
  private constructor(private readonly props: SeguimentoProps) {}

  static reconstituir(props: SeguimentoProps): Seguimento {
    return new Seguimento(props);
  }

  static criar(params: {
    id: string;
    seguidorPerfilId: string;
    seguidoPerfilId: string;
    contexto: ContextoDeApp;
    criadoEm?: Date;
  }): Seguimento {
    return new Seguimento({ ...params, criadoEm: params.criadoEm ?? new Date() });
  }

  get id(): string {
    return this.props.id;
  }
  get seguidorPerfilId(): string {
    return this.props.seguidorPerfilId;
  }
  get seguidoPerfilId(): string {
    return this.props.seguidoPerfilId;
  }
  get contexto(): ContextoDeApp {
    return this.props.contexto;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
}

/** Curtida (doc 06 §12) — 0—1 por (perfil, publicação), no mesmo contexto. Idempotente. */
export interface CurtidaProps {
  id: string;
  perfilId: string;
  publicacaoId: string;
  contexto: ContextoDeApp;
  criadoEm: Date;
}

export class Curtida {
  private constructor(private readonly props: CurtidaProps) {}

  static reconstituir(props: CurtidaProps): Curtida {
    return new Curtida(props);
  }

  static criar(params: {
    id: string;
    perfilId: string;
    publicacaoId: string;
    contexto: ContextoDeApp;
    criadoEm?: Date;
  }): Curtida {
    return new Curtida({ ...params, criadoEm: params.criadoEm ?? new Date() });
  }

  get id(): string {
    return this.props.id;
  }
  get perfilId(): string {
    return this.props.perfilId;
  }
  get publicacaoId(): string {
    return this.props.publicacaoId;
  }
  get contexto(): ContextoDeApp {
    return this.props.contexto;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
}

/** Comentário (doc 06 §12) — N por publicação, no mesmo contexto. */
export interface ComentarioProps {
  id: string;
  perfilId: string;
  publicacaoId: string;
  contexto: ContextoDeApp;
  texto: string;
  criadoEm: Date;
}

export class Comentario {
  private constructor(private readonly props: ComentarioProps) {}

  static reconstituir(props: ComentarioProps): Comentario {
    return new Comentario(props);
  }

  static criar(params: {
    id: string;
    perfilId: string;
    publicacaoId: string;
    contexto: ContextoDeApp;
    texto: string;
    criadoEm?: Date;
  }): Comentario {
    return new Comentario({
      ...params,
      texto: params.texto.trim(),
      criadoEm: params.criadoEm ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }
  get perfilId(): string {
    return this.props.perfilId;
  }
  get publicacaoId(): string {
    return this.props.publicacaoId;
  }
  get contexto(): ContextoDeApp {
    return this.props.contexto;
  }
  get texto(): string {
    return this.props.texto;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
}
