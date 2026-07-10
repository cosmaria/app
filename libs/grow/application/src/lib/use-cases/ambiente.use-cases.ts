import type { IdGenerator } from '@cosmaria/core-application';
import {
  ChavesDeLimite,
  LimiteDePlanoAtingidoError,
  type PremiumPublicApi,
} from '@cosmaria/core-public-api';
import {
  Ambiente,
  AmbienteComCiclosError,
  AmbienteNaoEncontradoError,
  type TipoDeAmbiente,
} from '@cosmaria/grow-domain';
import { AmbienteRepository } from '../ports/grow.repositories';

export interface AmbienteView {
  ambienteId: string;
  nome: string;
  tipo: TipoDeAmbiente;
  larguraCm: number | null;
  comprimentoCm: number | null;
  alturaCm: number | null;
  capacidadePlantas: number | null;
  aceitaDadosClimaticos: boolean;
  criadoEm: string;
}

export const paraAmbienteView = (a: Ambiente): AmbienteView => ({
  ambienteId: a.id,
  nome: a.nome,
  tipo: a.tipo,
  larguraCm: a.larguraCm,
  comprimentoCm: a.comprimentoCm,
  alturaCm: a.alturaCm,
  capacidadePlantas: a.capacidadePlantas,
  aceitaDadosClimaticos: a.aceitaDadosClimaticos(),
  criadoEm: a.criadoEm.toISOString(),
});

async function buscarDoDono(
  repo: AmbienteRepository,
  usuarioId: string,
  ambienteId: string,
): Promise<Ambiente> {
  const ambiente = await repo.buscarPorId(ambienteId);
  if (!ambiente || !ambiente.pertenceA(usuarioId)) {
    throw new AmbienteNaoEncontradoError();
  }
  return ambiente;
}

export interface CriarAmbienteInput {
  usuarioId: string;
  nome: string;
  tipo: TipoDeAmbiente;
  larguraCm?: number | null;
  comprimentoCm?: number | null;
  alturaCm?: number | null;
  capacidadePlantas?: number | null;
}

/**
 * `POST /v1/ambientes`.
 *
 * Único ponto do Grow que consulta o plano: o limite de **ambientes simultâneos** é a
 * fronteira de capacidade do gratuito (doc 07 §9). O Grow não conhece o número — ele
 * pergunta à PREMIUM_PUBLIC_API, que já publica `LimitePremiumAtingido` ao barrar,
 * disparando paywall e notificação. Nenhuma regra de cobrança é reimplementada aqui.
 *
 * O limite rege **capacidade simultânea futura**, jamais o histórico: ciclos e plantas
 * já registrados continuam íntegros e acessíveis mesmo no plano gratuito.
 */
export class CriarAmbienteUseCase {
  constructor(
    private readonly repo: AmbienteRepository,
    private readonly premium: PremiumPublicApi,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(input: CriarAmbienteInput): Promise<AmbienteView> {
    const usoAtual = await this.repo.contarPorUsuario(input.usuarioId);
    const limite = await this.premium.verificarLimite(
      input.usuarioId,
      ChavesDeLimite.GROW_AMBIENTES_SIMULTANEOS,
      usoAtual,
    );
    if (!limite.permitido) {
      throw new LimiteDePlanoAtingidoError(limite.chave, limite.limite as number);
    }

    const ambiente = Ambiente.criar({ id: this.idGen.gerar(), ...input });
    await this.repo.salvar(ambiente);
    return paraAmbienteView(ambiente);
  }
}

/** `GET /v1/ambientes`. */
export class ListarAmbientesUseCase {
  constructor(private readonly repo: AmbienteRepository) {}

  async executar(usuarioId: string): Promise<AmbienteView[]> {
    const ambientes = await this.repo.listarPorUsuario(usuarioId);
    return ambientes.map(paraAmbienteView);
  }
}

export interface AtualizarAmbienteInput {
  usuarioId: string;
  ambienteId: string;
  nome?: string;
  tipo?: TipoDeAmbiente;
  larguraCm?: number | null;
  comprimentoCm?: number | null;
  alturaCm?: number | null;
  capacidadePlantas?: number | null;
}

/** `PUT /v1/ambientes/{id}` — atualização parcial. Não consulta o plano: já existe. */
export class AtualizarAmbienteUseCase {
  constructor(private readonly repo: AmbienteRepository) {}

  async executar(input: AtualizarAmbienteInput): Promise<AmbienteView> {
    const ambiente = await buscarDoDono(this.repo, input.usuarioId, input.ambienteId);
    ambiente.atualizar(input);
    await this.repo.salvar(ambiente);
    return paraAmbienteView(ambiente);
  }
}

/**
 * `DELETE /v1/ambientes/{id}`.
 *
 * Recusa se o ambiente já hospedou ciclos: o espaço físico tem histórico próprio
 * (doc 02 §5.3), e apagá-lo levaria junto o passado de cultivos que já aconteceram ali.
 */
export class RemoverAmbienteUseCase {
  constructor(private readonly repo: AmbienteRepository) {}

  async executar(input: { usuarioId: string; ambienteId: string }): Promise<void> {
    const ambiente = await buscarDoDono(this.repo, input.usuarioId, input.ambienteId);
    if (await this.repo.possuiCiclos(ambiente.id)) {
      throw new AmbienteComCiclosError();
    }
    await this.repo.remover(ambiente.id);
  }
}
