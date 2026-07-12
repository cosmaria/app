import type { EventPublisher } from '@cosmaria/core-application';
import { ContextoDeApp, type Escopo } from '@cosmaria/core-domain';
import type { PerfilPublicApi, PrivacidadePublicApi } from '@cosmaria/core-public-api';
import { CicloNaoEncontradoError, GrowlogPublicado } from '@cosmaria/grow-domain';
import { CicloRepository } from '../ports/grow.repositories';

export interface PublicarCicloInput {
  usuarioId: string;
  cicloId: string;
  escopo: Escopo;
  titulo?: string | null;
  resumo?: string | null;
  /** Parâmetros técnicos que o autor escolhe compartilhar (busca estruturada, doc 06 §7.1). */
  dimensoes?: Record<string, string>;
}

export interface PublicacaoDoCicloView {
  cicloId: string;
  perfilPublicoId: string;
  escopo: string;
  publicadoEm: string;
}

/**
 * `POST /v1/ciclos/{id}/publicar` — publica um Growlog na Comunidade (doc 06 §9).
 *
 * A ação de publicar pertence ao Grow (dono do conteúdo e da privacidade): resolve o
 * Perfil Público do contexto Grow (PERFIL_PUBLIC_API), registra o compartilhamento no
 * Motor de Privacidade (PRIVACIDADE_PUBLIC_API — fonte única da regra de escopo) e emite
 * `GrowlogPublicado`. A Comunidade só projeta o evento — o Grow nunca a importa (doc 04 §24).
 *
 * Republicar o mesmo ciclo reemite o evento: a projeção é idempotente por referência.
 */
export class PublicarCicloUseCase {
  constructor(
    private readonly ciclos: CicloRepository,
    private readonly perfis: PerfilPublicApi,
    private readonly privacidade: PrivacidadePublicApi,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: PublicarCicloInput): Promise<PublicacaoDoCicloView> {
    // Ciclo de outro usuário responde igual a inexistente.
    const ciclo = await this.ciclos.buscarPorId(input.cicloId);
    if (!ciclo || !ciclo.pertenceA(input.usuarioId)) {
      throw new CicloNaoEncontradoError();
    }

    const perfil = await this.perfis.obterOuCriar(input.usuarioId, ContextoDeApp.GROW);
    const dimensoes = input.dimensoes ?? {};

    await this.privacidade.definirCompartilhamento({
      modulo: 'grow',
      tipoConteudo: 'ciclo',
      conteudoId: ciclo.id,
      autorId: input.usuarioId,
      escopoPadrao: input.escopo,
      dimensoes: Object.keys(dimensoes).map((codigo) => ({ codigo, escopo: input.escopo })),
    });

    const publicadoEm = new Date();
    await this.eventos.publicar(
      new GrowlogPublicado(
        ciclo.id,
        input.usuarioId,
        perfil.perfilId,
        input.escopo,
        input.titulo ?? ciclo.nome,
        input.resumo ?? null,
        dimensoes,
        publicadoEm,
      ),
    );

    return {
      cicloId: ciclo.id,
      perfilPublicoId: perfil.perfilId,
      escopo: input.escopo,
      publicadoEm: publicadoEm.toISOString(),
    };
  }
}
