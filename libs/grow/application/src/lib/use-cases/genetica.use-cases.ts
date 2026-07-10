import type { IdGenerator } from '@cosmaria/core-application';
import {
  Genetica,
  GeneticaEmUsoError,
  GeneticaNaoEncontradaError,
  type TipoDeGenetica,
} from '@cosmaria/grow-domain';
import { GeneticaRepository } from '../ports/grow.repositories';

export interface GeneticaView {
  geneticaId: string;
  nome: string;
  tipo: TipoDeGenetica;
  linhagem: string | null;
  breeder: string | null;
  caracteristicasEsperadas: string | null;
  criadoEm: string;
}

/** O `usuarioId` nunca sai na projeção — o dono já é quem faz a requisição. */
export const paraGeneticaView = (g: Genetica): GeneticaView => ({
  geneticaId: g.id,
  nome: g.nome,
  tipo: g.tipo,
  linhagem: g.linhagem,
  breeder: g.breeder,
  caracteristicasEsperadas: g.caracteristicasEsperadas,
  criadoEm: g.criadoEm.toISOString(),
});

/**
 * Busca a genética garantindo a posse. Genética de outro usuário responde igual a
 * inexistente — não confirmamos existência a quem não é dono.
 */
async function buscarDoDono(
  repo: GeneticaRepository,
  usuarioId: string,
  geneticaId: string,
): Promise<Genetica> {
  const genetica = await repo.buscarPorId(geneticaId);
  if (!genetica || !genetica.pertenceA(usuarioId)) {
    throw new GeneticaNaoEncontradaError();
  }
  return genetica;
}

export interface CriarGeneticaInput {
  usuarioId: string;
  nome: string;
  tipo: TipoDeGenetica;
  linhagem?: string | null;
  breeder?: string | null;
  caracteristicasEsperadas?: string | null;
}

/** `POST /v1/geneticas` (doc 09 — lacuna corrigida na revisão 00-09). */
export class CriarGeneticaUseCase {
  constructor(
    private readonly repo: GeneticaRepository,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(input: CriarGeneticaInput): Promise<GeneticaView> {
    const genetica = Genetica.criar({ id: this.idGen.gerar(), ...input });
    await this.repo.salvar(genetica);
    return paraGeneticaView(genetica);
  }
}

/** `GET /v1/geneticas` — biblioteca de genéticas do próprio usuário. */
export class ListarGeneticasUseCase {
  constructor(private readonly repo: GeneticaRepository) {}

  async executar(usuarioId: string): Promise<GeneticaView[]> {
    const geneticas = await this.repo.listarPorUsuario(usuarioId);
    return geneticas.map(paraGeneticaView);
  }
}

export interface AtualizarGeneticaInput {
  usuarioId: string;
  geneticaId: string;
  nome?: string;
  tipo?: TipoDeGenetica;
  linhagem?: string | null;
  breeder?: string | null;
  caracteristicasEsperadas?: string | null;
}

/** `PUT /v1/geneticas/{id}` — atualização parcial. */
export class AtualizarGeneticaUseCase {
  constructor(private readonly repo: GeneticaRepository) {}

  async executar(input: AtualizarGeneticaInput): Promise<GeneticaView> {
    const genetica = await buscarDoDono(this.repo, input.usuarioId, input.geneticaId);
    genetica.atualizar(input);
    await this.repo.salvar(genetica);
    return paraGeneticaView(genetica);
  }
}

/**
 * `DELETE /v1/geneticas/{id}`.
 *
 * Recusa se a genética já originou plantas: apagá-la desconectaria ciclos cuja única
 * razão de existir é serem comparados entre si (doc 02 §5.12). O usuário não perde
 * histórico por causa de uma limpeza de cadastro.
 */
export class RemoverGeneticaUseCase {
  constructor(private readonly repo: GeneticaRepository) {}

  async executar(input: { usuarioId: string; geneticaId: string }): Promise<void> {
    const genetica = await buscarDoDono(this.repo, input.usuarioId, input.geneticaId);
    if (await this.repo.possuiPlantas(genetica.id)) {
      throw new GeneticaEmUsoError();
    }
    await this.repo.remover(genetica.id);
  }
}
