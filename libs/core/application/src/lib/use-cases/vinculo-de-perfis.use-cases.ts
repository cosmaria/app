import {
  AcessoNegadoError,
  type ContextoDeApp,
  type PerfilPublico,
  PerfilNaoEncontradoError,
  RegistroDeVinculoDePerfis,
  VinculoDePerfisAutorizado,
  VinculoDePerfisDesabilitadoError,
  VinculoDePerfisInvalidoError,
  VinculoDePerfisRevogado,
} from '@cosmaria/core-domain';
import { EventPublisher } from '../ports/event-publisher.port';
import { FeatureFlags } from '../ports/feature-flags.port';
import { IdGenerator } from '../ports/id-generator.port';
import { PerfilPublicoRepository } from '../ports/perfil-publico.repository';
import { VinculoDePerfisRepository } from '../ports/vinculo-de-perfis.repository';
import { type PerfilView, paraPerfilView } from './perfil-view';

export interface VinculoView {
  vinculoId: string;
  perfilIds: string[];
  visivelEm: ContextoDeApp[];
  vigente: boolean;
}

const paraVinculoView = (v: RegistroDeVinculoDePerfis): VinculoView => ({
  vinculoId: v.id,
  perfilIds: v.perfilIds,
  visivelEm: v.visivelEm,
  vigente: v.estaVigente(),
});

/**
 * Autoriza o vínculo público entre Perfis Públicos da mesma Conta (doc 06 §7.4).
 *
 * **Versão 2**: bloqueado por feature flag no MVP (doc 06, decisão consolidada #1).
 *
 * Não exige `TipoConsentimento.VINCULO_GROW_MED` de propósito: aquele consentimento
 * governa o cruzamento de *dados* entre Grow e Med (doc 00, integração opt-in), enquanto
 * este registro governa a revelação de *identidade social*. São opt-ins distintos e
 * conflatá-los faria um consentimento liberar silenciosamente o outro. A autorização
 * explícita aqui é o próprio ato de consentir, e ela é auditada (doc 08 §7).
 */
export class AutorizarVinculoDePerfisUseCase {
  constructor(
    private readonly vinculos: VinculoDePerfisRepository,
    private readonly perfis: PerfilPublicoRepository,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
    private readonly flags: FeatureFlags,
  ) {}

  async executar(input: {
    usuarioId: string;
    perfilIds: string[];
    visivelEm: ContextoDeApp[];
  }): Promise<VinculoView> {
    if (!this.flags.vinculoDePerfisHabilitado()) {
      throw new VinculoDePerfisDesabilitadoError();
    }

    const perfis = await this.perfis.buscarPorIds(input.perfilIds);
    this.garantirPerfisDaConta(perfis, input.perfilIds, input.usuarioId);
    this.garantirContextosRevelaveis(perfis, input.visivelEm);
    await this.garantirSemVinculoVigente(input.perfilIds);

    const vinculo = RegistroDeVinculoDePerfis.autorizar({
      id: this.idGen.gerar(),
      usuarioId: input.usuarioId,
      perfilIds: input.perfilIds,
      visivelEm: input.visivelEm,
    });
    await this.vinculos.salvar(vinculo);
    await this.eventos.publicar(
      new VinculoDePerfisAutorizado(vinculo.id, vinculo.usuarioId, vinculo.perfilIds.length),
    );
    return paraVinculoView(vinculo);
  }

  /** Vincular perfis de Contas diferentes é impossível — não é "negado", é inexistente. */
  private garantirPerfisDaConta(
    perfis: PerfilPublico[],
    perfilIds: string[],
    usuarioId: string,
  ): void {
    const solicitados = new Set(perfilIds);
    if (perfis.length !== solicitados.size) {
      throw new PerfilNaoEncontradoError();
    }
    if (perfis.some((p) => !p.pertenceA(usuarioId))) {
      throw new AcessoNegadoError();
    }
  }

  /** Só faz sentido revelar o vínculo num contexto onde a Conta tem perfil. */
  private garantirContextosRevelaveis(perfis: PerfilPublico[], visivelEm: ContextoDeApp[]): void {
    const contextos = new Set(perfis.map((p) => p.contexto));
    if (contextos.size < 2) {
      throw new VinculoDePerfisInvalidoError('os perfis precisam ser de contextos diferentes.');
    }
    const foraDeContexto = visivelEm.filter((c) => !contextos.has(c));
    if (foraDeContexto.length > 0) {
      throw new VinculoDePerfisInvalidoError(
        `não há perfil vinculado no contexto ${foraDeContexto.join(', ')}.`,
      );
    }
  }

  /** Doc 08: um PerfilPúblico participa de no máximo um vínculo vigente. */
  private async garantirSemVinculoVigente(perfilIds: string[]): Promise<void> {
    for (const perfilId of perfilIds) {
      const vigente = await this.vinculos.buscarVigentePorPerfil(perfilId);
      if (vigente) {
        throw new VinculoDePerfisInvalidoError('já existe um vínculo vigente para este perfil.');
      }
    }
  }
}

/** Desfaz a revelação pública (doc 06 §7.4 — reversível a qualquer momento). */
export class RevogarVinculoDePerfisUseCase {
  constructor(
    private readonly vinculos: VinculoDePerfisRepository,
    private readonly eventos: EventPublisher,
    private readonly flags: FeatureFlags,
  ) {}

  async executar(input: { usuarioId: string; vinculoId: string }): Promise<void> {
    if (!this.flags.vinculoDePerfisHabilitado()) {
      throw new VinculoDePerfisDesabilitadoError();
    }
    const vinculo = await this.vinculos.buscarPorId(input.vinculoId);
    if (!vinculo) {
      return; // idempotente: revogar algo inexistente não é erro nem revela existência
    }
    vinculo.garantirAutoria(input.usuarioId);
    if (!vinculo.estaVigente()) {
      return;
    }
    vinculo.revogar();
    await this.vinculos.salvar(vinculo);
    await this.eventos.publicar(new VinculoDePerfisRevogado(vinculo.id, vinculo.usuarioId));
  }
}

/**
 * ÚNICO caminho pelo qual Perfis Públicos de contextos diferentes da mesma Conta podem
 * aparecer juntos numa resposta (doc 06 §13 / doc 08 §12.1).
 *
 * Sem `RegistroDeVinculoDePerfis` vigente e visível naquele contexto, devolve lista
 * vazia — nunca infere a ligação. Este caso de uso é o objeto do teste de arquitetura
 * exigido pelo doc 06 (Casos de Teste).
 */
export class ObterPerfisVinculadosPublicamenteUseCase {
  constructor(
    private readonly vinculos: VinculoDePerfisRepository,
    private readonly perfis: PerfilPublicoRepository,
    private readonly flags: FeatureFlags,
  ) {}

  async executar(perfilId: string): Promise<PerfilView[]> {
    if (!this.flags.vinculoDePerfisHabilitado()) {
      return [];
    }
    const perfil = await this.perfis.buscarPorId(perfilId);
    if (!perfil) {
      return [];
    }
    const vinculo = await this.vinculos.buscarVigentePorPerfil(perfilId);
    if (!vinculo || !vinculo.ehVisivelEm(perfil.contexto)) {
      return [];
    }
    const outros = await this.perfis.buscarPorIds(
      vinculo.perfilIds.filter((id) => id !== perfilId),
    );
    return outros.map(paraPerfilView);
  }
}

/** Lista os vínculos do próprio dono (inclusive revogados — histórico da Conta). */
export class ListarVinculosDoUsuarioUseCase {
  constructor(
    private readonly vinculos: VinculoDePerfisRepository,
    private readonly flags: FeatureFlags,
  ) {}

  async executar(usuarioId: string): Promise<VinculoView[]> {
    if (!this.flags.vinculoDePerfisHabilitado()) {
      throw new VinculoDePerfisDesabilitadoError();
    }
    const registros = await this.vinculos.listarPorUsuario(usuarioId);
    return registros.map(paraVinculoView);
  }
}
