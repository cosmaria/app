import { AcessoNegadoError } from '../errors/auth.errors';
import { VinculoDePerfisInvalidoError } from '../errors/perfil.errors';
import type { ContextoDeApp } from './contexto-de-app';

export interface RegistroDeVinculoDePerfisProps {
  id: string;
  /** Conta dona de todos os perfis vinculados — vínculo só existe dentro de uma Conta. */
  usuarioId: string;
  /** Perfis Públicos (2+) que o usuário decidiu revelar publicamente como sendo a mesma pessoa. */
  perfilIds: string[];
  /**
   * Contextos onde o vínculo é exibido (doc 06 §18): o usuário pode revelar no Med que
   * "também cultiva" sem necessariamente expor o inverso no Grow.
   */
  visivelEm: ContextoDeApp[];
  criadoEm: Date;
  /** Nulo enquanto vigente. Revogar não apaga o registro (auditoria — doc 08 §7). */
  revogadoEm: Date | null;
}

/**
 * RegistroDeVinculoDePerfis (doc 06 §7.4, doc 08 §12.1 — Arquétipo A, **Versão 2**).
 *
 * Existência opt-in e explícita: sua simples presença já é a resposta à pergunta
 * "estes dois perfis são a mesma pessoa?" — por isso NUNCA é inferido por busca, feed,
 * recomendação ou analytics (doc 06 §13). Reversível a qualquer momento.
 *
 * O modelo de dados nasce pronto no MVP; a funcionalidade fica atrás de feature flag
 * (`VinculoDePerfisDesabilitadoError`) até a Versão 2.
 */
export class RegistroDeVinculoDePerfis {
  private constructor(private readonly props: RegistroDeVinculoDePerfisProps) {}

  static reconstituir(props: RegistroDeVinculoDePerfisProps): RegistroDeVinculoDePerfis {
    return new RegistroDeVinculoDePerfis(props);
  }

  static autorizar(params: {
    id: string;
    usuarioId: string;
    perfilIds: string[];
    visivelEm: ContextoDeApp[];
    criadoEm?: Date;
  }): RegistroDeVinculoDePerfis {
    const perfilIds = [...new Set(params.perfilIds)];
    if (perfilIds.length < 2) {
      throw new VinculoDePerfisInvalidoError('são necessários ao menos dois perfis distintos.');
    }
    if (params.visivelEm.length === 0) {
      throw new VinculoDePerfisInvalidoError(
        'escolha ao menos um contexto onde o vínculo aparece.',
      );
    }
    return new RegistroDeVinculoDePerfis({
      id: params.id,
      usuarioId: params.usuarioId,
      perfilIds,
      visivelEm: [...new Set(params.visivelEm)],
      criadoEm: params.criadoEm ?? new Date(),
      revogadoEm: null,
    });
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get perfilIds(): string[] {
    return [...this.props.perfilIds];
  }
  get visivelEm(): ContextoDeApp[] {
    return [...this.props.visivelEm];
  }
  get criadoEm(): Date {
    return this.props.criadoEm;
  }
  get revogadoEm(): Date | null {
    return this.props.revogadoEm;
  }

  estaVigente(): boolean {
    return this.props.revogadoEm === null;
  }

  contemPerfil(perfilId: string): boolean {
    return this.props.perfilIds.includes(perfilId);
  }

  /** O vínculo aparece a terceiros neste contexto? Só se vigente E revelado nele. */
  ehVisivelEm(contexto: ContextoDeApp): boolean {
    return this.estaVigente() && this.props.visivelEm.includes(contexto);
  }

  /** Desfaz a revelação pública. Idempotente — revogar duas vezes não muda a data. */
  revogar(agora: Date = new Date()): void {
    if (this.props.revogadoEm === null) {
      this.props.revogadoEm = agora;
    }
  }

  garantirAutoria(usuarioId: string): void {
    if (this.props.usuarioId !== usuarioId) {
      throw new AcessoNegadoError();
    }
  }
}
