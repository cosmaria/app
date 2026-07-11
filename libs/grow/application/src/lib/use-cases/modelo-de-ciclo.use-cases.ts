import type { IdGenerator } from '@cosmaria/core-application';
import type { PremiumPublicApi } from '@cosmaria/core-public-api';
import {
  AmbienteNaoEncontradoError,
  type FaseDeVida,
  GeneticaNaoEncontradaError,
  ModeloDeCiclo,
  ModeloDeCicloNaoEncontradoError,
  RecursoExclusivoPremiumError,
} from '@cosmaria/grow-domain';
import {
  AmbienteRepository,
  GeneticaRepository,
  ModeloDeCicloRepository,
} from '../ports/grow.repositories';

export interface ModeloDeCicloView {
  modeloId: string;
  nome: string;
  ambienteId: string | null;
  geneticaId: string | null;
  faseInicial: FaseDeVida | null;
  rotinaPadrao: string | null;
  criadoEm: string;
}

export const paraModeloDeCicloView = (m: ModeloDeCiclo): ModeloDeCicloView => ({
  modeloId: m.id,
  nome: m.nome,
  ambienteId: m.ambienteId,
  geneticaId: m.geneticaId,
  faseInicial: m.faseInicial,
  rotinaPadrao: m.rotinaPadrao,
  criadoEm: m.criadoEm.toISOString(),
});

export interface CriarModeloDeCicloInput {
  usuarioId: string;
  nome: string;
  ambienteId?: string | null;
  geneticaId?: string | null;
  faseInicial?: FaseDeVida | null;
  rotinaPadrao?: string | null;
}

/**
 * `POST /v1/ciclos/modelos` (doc 09, API-1 — Premium). **Recurso exclusivo do Premium**:
 * criar um modelo exige assinatura ativa (gate via PREMIUM_PUBLIC_API.ehPremium). Barrar
 * responde 402 e dispara o paywall. Referências de ambiente/genética, se informadas, são
 * validadas como do próprio usuário.
 */
export class CriarModeloDeCicloUseCase {
  constructor(
    private readonly modelos: ModeloDeCicloRepository,
    private readonly ambientes: AmbienteRepository,
    private readonly geneticas: GeneticaRepository,
    private readonly premium: PremiumPublicApi,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(input: CriarModeloDeCicloInput): Promise<ModeloDeCicloView> {
    if (!(await this.premium.ehPremium(input.usuarioId))) {
      throw new RecursoExclusivoPremiumError('Modelos de ciclo');
    }

    if (input.ambienteId) {
      const ambiente = await this.ambientes.buscarPorId(input.ambienteId);
      if (!ambiente || !ambiente.pertenceA(input.usuarioId)) {
        throw new AmbienteNaoEncontradoError();
      }
    }
    if (input.geneticaId) {
      const genetica = await this.geneticas.buscarPorId(input.geneticaId);
      if (!genetica || !genetica.pertenceA(input.usuarioId)) {
        throw new GeneticaNaoEncontradaError();
      }
    }

    const modelo = ModeloDeCiclo.criar({ id: this.idGen.gerar(), ...input });
    await this.modelos.salvar(modelo);
    return paraModeloDeCicloView(modelo);
  }
}

/**
 * `GET /v1/ciclos/modelos` — lista os modelos do usuário. **Não** é gated: ler o que já
 * existe nunca é limitado pelo plano (doc 07 §9 — regra ética). Um usuário que perdeu o
 * Premium continua enxergando (e podendo excluir) seus modelos.
 */
export class ListarModelosDeCicloUseCase {
  constructor(private readonly modelos: ModeloDeCicloRepository) {}

  async executar(usuarioId: string): Promise<ModeloDeCicloView[]> {
    const lista = await this.modelos.listarPorUsuario(usuarioId);
    return lista.map(paraModeloDeCicloView);
  }
}

/** `DELETE /v1/ciclos/modelos/{id}` — remove um modelo. Não gated (é dado do usuário). */
export class RemoverModeloDeCicloUseCase {
  constructor(private readonly modelos: ModeloDeCicloRepository) {}

  async executar(input: { usuarioId: string; modeloId: string }): Promise<void> {
    const modelo = await this.modelos.buscarPorId(input.modeloId);
    if (!modelo || !modelo.pertenceA(input.usuarioId)) {
      throw new ModeloDeCicloNaoEncontradoError();
    }
    await this.modelos.remover(input.modeloId);
  }
}
