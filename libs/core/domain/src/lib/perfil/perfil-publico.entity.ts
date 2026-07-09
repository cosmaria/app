import { AcessoNegadoError } from '../errors/auth.errors';
import type { ContextoDeApp } from './contexto-de-app';
import { PoliticaDeNomeDePerfil } from './politica-de-nome-de-perfil';

export interface PerfilPublicoProps {
  id: string;
  /** Conta dona do perfil. NUNCA é exposta publicamente (doc 08 §12.1). */
  usuarioId: string;
  contexto: ContextoDeApp;
  /** Nome de exibição. `null` = perfil anônimo (permitido em qualquer contexto, doc 06 §7.3). */
  nomeExibicao: string | null;
  avatarUrl: string | null;
  biografia: string | null;
  criadoEm: Date;
  atualizadoEm: Date;
}

/**
 * PerfilPúblico (doc 06 §4, doc 08 §12.1 — Arquétipo A) — a identidade social de uma
 * Conta **dentro de um contexto de aplicativo**. Um por contexto, nunca compartilhado:
 * seguir/curtir/comentar acontecem sempre entre perfis do mesmo contexto.
 *
 * Criação é automática e discreta (lazy, na primeira interação com a Comunidade) e
 * idempotente — o repositório garante unicidade por (usuário, contexto).
 *
 * Anonimato total é suportado em qualquer contexto e é **requisito de produto** no Med
 * (doc 06 §19): nome, avatar e biografia são todos opcionais.
 */
export class PerfilPublico {
  private constructor(private readonly props: PerfilPublicoProps) {}

  static reconstituir(props: PerfilPublicoProps): PerfilPublico {
    return new PerfilPublico(props);
  }

  /**
   * Cria o perfil de uma Conta num contexto. Sem `nomeExibicao`, o perfil nasce
   * **anônimo** — a sugestão neutra é oferecida pelo `nomeSugerido()`, nunca gravada
   * automaticamente, para que o anonimato seja o estado padrão e não uma escolha ativa.
   */
  static criar(params: {
    id: string;
    usuarioId: string;
    contexto: ContextoDeApp;
    nomeExibicao?: string | null;
    criadoEm?: Date;
  }): PerfilPublico {
    const agora = params.criadoEm ?? new Date();
    return new PerfilPublico({
      id: params.id,
      usuarioId: params.usuarioId,
      contexto: params.contexto,
      nomeExibicao: params.nomeExibicao ?? null,
      avatarUrl: null,
      biografia: null,
      criadoEm: agora,
      atualizadoEm: agora,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get contexto(): ContextoDeApp {
    return this.props.contexto;
  }
  get nomeExibicao(): string | null {
    return this.props.nomeExibicao;
  }
  get avatarUrl(): string | null {
    return this.props.avatarUrl;
  }
  get biografia(): string | null {
    return this.props.biografia;
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  /** Sugestão neutra de nome, derivada só do id opaco do perfil (doc 06 §13). */
  nomeSugerido(): string {
    return PoliticaDeNomeDePerfil.sugerir(this.props.id);
  }

  /** Um perfil sem nenhum dado de identidade preenchido permanece funcional (doc 06 §19). */
  ehAnonimo(): boolean {
    return (
      this.props.nomeExibicao === null &&
      this.props.avatarUrl === null &&
      this.props.biografia === null
    );
  }

  /**
   * Atualiza os campos de identidade. `undefined` = não mexer; `null` = limpar o campo
   * (é assim que o usuário volta a ficar anônimo sem excluir o perfil).
   */
  atualizar(
    campos: {
      nomeExibicao?: string | null;
      avatarUrl?: string | null;
      biografia?: string | null;
    },
    agora: Date = new Date(),
  ): void {
    if (campos.nomeExibicao !== undefined) {
      this.props.nomeExibicao = campos.nomeExibicao;
    }
    if (campos.avatarUrl !== undefined) {
      this.props.avatarUrl = campos.avatarUrl;
    }
    if (campos.biografia !== undefined) {
      this.props.biografia = campos.biografia;
    }
    this.props.atualizadoEm = agora;
  }

  pertenceA(usuarioId: string): boolean {
    return this.props.usuarioId === usuarioId;
  }

  /** Só o dono da Conta edita o próprio perfil (mesma regra de posse da privacidade). */
  garantirAutoria(usuarioId: string): void {
    if (!this.pertenceA(usuarioId)) {
      throw new AcessoNegadoError();
    }
  }
}
