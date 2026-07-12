import type { IdGenerator } from '@cosmaria/core-application';
import type { PremiumPublicApi } from '@cosmaria/core-public-api';
import {
  ModeloDeTratamento,
  ModeloDeTratamentoNaoEncontradoError,
  RecursoExclusivoPremiumError,
} from '@cosmaria/med-domain';
import { ModeloDeTratamentoRepository } from '../ports/med.repositories';

export interface ModeloDeTratamentoView {
  modeloId: string;
  nome: string;
  condicaoPadrao: string | null;
  objetivoPadrao: string | null;
  notas: string | null;
  criadoEm: string;
}

export const paraModeloDeTratamentoView = (m: ModeloDeTratamento): ModeloDeTratamentoView => ({
  modeloId: m.id,
  nome: m.nome,
  condicaoPadrao: m.condicaoPadrao,
  objetivoPadrao: m.objetivoPadrao,
  notas: m.notas,
  criadoEm: m.criadoEm.toISOString(),
});

async function buscarDoDono(
  repo: ModeloDeTratamentoRepository,
  usuarioId: string,
  modeloId: string,
): Promise<ModeloDeTratamento> {
  const modelo = await repo.buscarPorId(modeloId);
  if (!modelo || !modelo.pertenceA(usuarioId)) {
    throw new ModeloDeTratamentoNaoEncontradoError();
  }
  return modelo;
}

export interface CriarModeloDeTratamentoInput {
  usuarioId: string;
  nome: string;
  condicaoPadrao?: string | null;
  objetivoPadrao?: string | null;
  notas?: string | null;
}

/**
 * `POST /v1/tratamentos/modelos` (doc 09, API Premium).
 *
 * Gated por `ehPremium`: usuário gratuito recebe 402 (gatilho do paywall). Não usamos
 * `verificarLimite`, que exigiria uma chave de limite "0" no Core — um feature flag
 * disfarçado; o gate de funcionalidade é a intenção correta aqui (mesma escolha do Grow).
 */
export class CriarModeloDeTratamentoUseCase {
  constructor(
    private readonly repo: ModeloDeTratamentoRepository,
    private readonly premium: PremiumPublicApi,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(input: CriarModeloDeTratamentoInput): Promise<ModeloDeTratamentoView> {
    if (!(await this.premium.ehPremium(input.usuarioId))) {
      throw new RecursoExclusivoPremiumError('Modelos de tratamento');
    }
    const modelo = ModeloDeTratamento.criar({ id: this.idGen.gerar(), ...input });
    await this.repo.salvar(modelo);
    return paraModeloDeTratamentoView(modelo);
  }
}

/** `GET /v1/tratamentos/modelos` — não gated: dado do próprio usuário nunca é limitado. */
export class ListarModelosDeTratamentoUseCase {
  constructor(private readonly repo: ModeloDeTratamentoRepository) {}

  async executar(usuarioId: string): Promise<ModeloDeTratamentoView[]> {
    const modelos = await this.repo.listarPorUsuario(usuarioId);
    return modelos.map(paraModeloDeTratamentoView);
  }
}

/** `DELETE /v1/tratamentos/modelos/{id}` — não gated. */
export class RemoverModeloDeTratamentoUseCase {
  constructor(private readonly repo: ModeloDeTratamentoRepository) {}

  async executar(input: { usuarioId: string; modeloId: string }): Promise<void> {
    const modelo = await buscarDoDono(this.repo, input.usuarioId, input.modeloId);
    await this.repo.remover(modelo.id);
  }
}
