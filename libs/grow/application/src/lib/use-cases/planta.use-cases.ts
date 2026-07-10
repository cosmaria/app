import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import {
  CicloNaoEncontradoError,
  type FaseDeVida,
  GeneticaNaoEncontradaError,
  type OrigemDoMaterial,
  Planta,
  PlantaCriada,
  PlantaFaseAlterada,
  PlantaNaoEncontradaError,
} from '@cosmaria/grow-domain';
import { CicloRepository, GeneticaRepository, PlantaRepository } from '../ports/grow.repositories';

export interface PlantaView {
  plantaId: string;
  cicloId: string;
  geneticaId: string;
  nome: string;
  origem: OrigemDoMaterial;
  plantaMaeId: string | null;
  faseAtual: FaseDeVida;
  germinadaEm: string | null;
  criadoEm: string;
}

export const paraPlantaView = (p: Planta): PlantaView => ({
  plantaId: p.id,
  cicloId: p.cicloId,
  geneticaId: p.geneticaId,
  nome: p.nome,
  origem: p.origem,
  plantaMaeId: p.plantaMaeId,
  faseAtual: p.faseAtual,
  germinadaEm: p.germinadaEm ? p.germinadaEm.toISOString() : null,
  criadoEm: p.criadoEm.toISOString(),
});

async function buscarDoDono(
  repo: PlantaRepository,
  usuarioId: string,
  plantaId: string,
): Promise<Planta> {
  const planta = await repo.buscarPorId(plantaId);
  if (!planta || !planta.pertenceA(usuarioId)) {
    throw new PlantaNaoEncontradaError();
  }
  return planta;
}

export interface AdicionarPlantaInput {
  usuarioId: string;
  cicloId: string;
  geneticaId: string;
  nome: string;
  origem: OrigemDoMaterial;
  plantaMaeId?: string | null;
  faseInicial?: FaseDeVida;
  germinadaEm?: Date | null;
}

/**
 * `POST /v1/plantas`. A planta entra num ciclo **ativo** e referencia uma genética do
 * próprio usuário — é esse vínculo que permite comparar cultivos da mesma genética
 * depois (doc 02 §5.1/§5.12).
 */
export class AdicionarPlantaUseCase {
  constructor(
    private readonly plantas: PlantaRepository,
    private readonly ciclos: CicloRepository,
    private readonly geneticas: GeneticaRepository,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: AdicionarPlantaInput): Promise<PlantaView> {
    const ciclo = await this.ciclos.buscarPorId(input.cicloId);
    if (!ciclo || !ciclo.pertenceA(input.usuarioId)) {
      throw new CicloNaoEncontradoError();
    }
    // Nenhuma escrita entra em ciclo encerrado — o histórico é imutável.
    ciclo.garantirAtivo();

    const genetica = await this.geneticas.buscarPorId(input.geneticaId);
    if (!genetica || !genetica.pertenceA(input.usuarioId)) {
      throw new GeneticaNaoEncontradaError();
    }

    const planta = Planta.criar({ id: this.idGen.gerar(), ...input });
    await this.plantas.salvar(planta);
    await this.eventos.publicar(
      new PlantaCriada(planta.id, planta.usuarioId, planta.cicloId, planta.geneticaId),
    );
    return paraPlantaView(planta);
  }
}

/** `GET /v1/ciclos/{id}/plantas`. */
export class ListarPlantasDoCicloUseCase {
  constructor(
    private readonly plantas: PlantaRepository,
    private readonly ciclos: CicloRepository,
  ) {}

  async executar(input: { usuarioId: string; cicloId: string }): Promise<PlantaView[]> {
    const ciclo = await this.ciclos.buscarPorId(input.cicloId);
    if (!ciclo || !ciclo.pertenceA(input.usuarioId)) {
      throw new CicloNaoEncontradoError();
    }
    const plantas = await this.plantas.listarPorCiclo(input.cicloId);
    return plantas.map(paraPlantaView);
  }
}

/**
 * `POST /v1/plantas/{id}/fase`.
 *
 * A fase da planta é independente da do ciclo: plantas do mesmo ciclo amadurecem em
 * ritmos diferentes, e é isso que sustenta a colheita escalonada (doc 04 §25).
 * Publica `PlantaFaseAlterada`, consumido por IA e Notificações.
 */
export class AvancarFaseDaPlantaUseCase {
  constructor(
    private readonly plantas: PlantaRepository,
    private readonly ciclos: CicloRepository,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: {
    usuarioId: string;
    plantaId: string;
    fase: FaseDeVida;
  }): Promise<PlantaView> {
    const planta = await buscarDoDono(this.plantas, input.usuarioId, input.plantaId);

    const ciclo = await this.ciclos.buscarPorId(planta.cicloId);
    if (!ciclo) {
      throw new CicloNaoEncontradoError();
    }
    ciclo.garantirAtivo();

    const faseAnterior = planta.faseAtual;
    planta.avancarFase(input.fase);
    await this.plantas.salvar(planta);
    await this.eventos.publicar(
      new PlantaFaseAlterada(planta.id, planta.usuarioId, faseAnterior, planta.faseAtual),
    );
    return paraPlantaView(planta);
  }
}

/** `PUT /v1/plantas/{id}` — apelido e data de germinação. */
export class AtualizarPlantaUseCase {
  constructor(private readonly plantas: PlantaRepository) {}

  async executar(input: {
    usuarioId: string;
    plantaId: string;
    nome?: string;
    germinadaEm?: Date | null;
  }): Promise<PlantaView> {
    const planta = await buscarDoDono(this.plantas, input.usuarioId, input.plantaId);
    planta.atualizar(input);
    await this.plantas.salvar(planta);
    return paraPlantaView(planta);
  }
}
