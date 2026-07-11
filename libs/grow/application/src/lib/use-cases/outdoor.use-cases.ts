import type { IdGenerator } from '@cosmaria/core-application';
import {
  AmbienteNaoEncontradoError,
  AmbienteNaoOutdoorError,
  DadosClimaticos,
  DadosClimaticosNaoEncontradosError,
  type FonteDeDadosClimaticos,
  TipoDeAmbiente,
} from '@cosmaria/grow-domain';
import { AmbienteRepository, DadosClimaticosRepository } from '../ports/grow.repositories';

export interface DadosClimaticosView {
  ambienteId: string;
  localizacaoAproximada: string | null;
  latitudeAproximada: number | null;
  longitudeAproximada: number | null;
  fonte: FonteDeDadosClimaticos;
  observacoes: string | null;
  atualizadoEm: string;
}

export const paraDadosClimaticosView = (d: DadosClimaticos): DadosClimaticosView => ({
  ambienteId: d.ambienteId,
  localizacaoAproximada: d.localizacaoAproximada,
  latitudeAproximada: d.latitudeAproximada,
  longitudeAproximada: d.longitudeAproximada,
  fonte: d.fonte,
  observacoes: d.observacoes,
  atualizadoEm: d.atualizadoEm.toISOString(),
});

/** Ambiente de outro usuário responde igual a inexistente. */
async function ambienteDoDono(
  ambientes: AmbienteRepository,
  usuarioId: string,
  ambienteId: string,
) {
  const ambiente = await ambientes.buscarPorId(ambienteId);
  if (!ambiente || !ambiente.pertenceA(usuarioId)) {
    throw new AmbienteNaoEncontradoError();
  }
  return ambiente;
}

export interface DefinirDadosClimaticosInput {
  usuarioId: string;
  ambienteId: string;
  localizacaoAproximada?: string | null;
  latitudeAproximada?: number | null;
  longitudeAproximada?: number | null;
  observacoes?: string | null;
}

/**
 * `PUT /v1/ambientes/{id}/clima` — configura/atualiza o Módulo Outdoor de um ambiente.
 * Só ambientes **outdoor** (doc 08 §272). Upsert por ambiente (0—1). Fonte sempre MANUAL
 * no MVP — a API climática externa é Versão 2, um adaptador plugável ainda inexistente.
 */
export class DefinirDadosClimaticosUseCase {
  constructor(
    private readonly dados: DadosClimaticosRepository,
    private readonly ambientes: AmbienteRepository,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(input: DefinirDadosClimaticosInput): Promise<DadosClimaticosView> {
    const ambiente = await ambienteDoDono(this.ambientes, input.usuarioId, input.ambienteId);
    if (ambiente.tipo !== TipoDeAmbiente.OUTDOOR) {
      throw new AmbienteNaoOutdoorError();
    }

    const existente = await this.dados.buscarPorAmbiente(input.ambienteId);
    if (existente) {
      existente.atualizar({
        localizacaoAproximada: input.localizacaoAproximada,
        latitudeAproximada: input.latitudeAproximada,
        longitudeAproximada: input.longitudeAproximada,
        observacoes: input.observacoes,
      });
      await this.dados.salvar(existente);
      return paraDadosClimaticosView(existente);
    }

    const dados = DadosClimaticos.configurar({
      id: this.idGen.gerar(),
      usuarioId: input.usuarioId,
      ambienteId: input.ambienteId,
      localizacaoAproximada: input.localizacaoAproximada,
      latitudeAproximada: input.latitudeAproximada,
      longitudeAproximada: input.longitudeAproximada,
      observacoes: input.observacoes,
    });
    await this.dados.salvar(dados);
    return paraDadosClimaticosView(dados);
  }
}

/**
 * `GET /v1/ambientes/{id}/clima` (doc 09, API-3). Ausência é isolada, não um erro do core:
 * um ambiente sem o módulo configurado responde 404, e nada no restante do Grow depende disso.
 */
export class ObterDadosClimaticosUseCase {
  constructor(
    private readonly dados: DadosClimaticosRepository,
    private readonly ambientes: AmbienteRepository,
  ) {}

  async executar(input: { usuarioId: string; ambienteId: string }): Promise<DadosClimaticosView> {
    await ambienteDoDono(this.ambientes, input.usuarioId, input.ambienteId);
    const dados = await this.dados.buscarPorAmbiente(input.ambienteId);
    if (!dados) {
      throw new DadosClimaticosNaoEncontradosError();
    }
    return paraDadosClimaticosView(dados);
  }
}

/** `DELETE /v1/ambientes/{id}/clima` — desativa o Módulo Outdoor. Idempotente. */
export class RemoverDadosClimaticosUseCase {
  constructor(
    private readonly dados: DadosClimaticosRepository,
    private readonly ambientes: AmbienteRepository,
  ) {}

  async executar(input: { usuarioId: string; ambienteId: string }): Promise<void> {
    await ambienteDoDono(this.ambientes, input.usuarioId, input.ambienteId);
    await this.dados.remover(input.ambienteId);
  }
}
