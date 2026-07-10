import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import {
  AmbienteNaoEncontradoError,
  CicloCriado,
  CicloCultivo,
  CicloFinalizado,
  CicloNaoEncontradoError,
  type FaseDeVida,
} from '@cosmaria/grow-domain';
import { AmbienteRepository, CicloRepository } from '../ports/grow.repositories';

export interface CicloView {
  cicloId: string;
  ambienteId: string;
  nome: string;
  faseAtual: FaseDeVida;
  ativo: boolean;
  iniciadoEm: string;
  encerradoEm: string | null;
  transicoes: { fase: FaseDeVida; ocorridaEm: string }[];
  duracaoDasFasesEmDias: { fase: FaseDeVida; dias: number }[];
}

export const paraCicloView = (c: CicloCultivo): CicloView => ({
  cicloId: c.id,
  ambienteId: c.ambienteId,
  nome: c.nome,
  faseAtual: c.faseAtual,
  ativo: c.estaAtivo(),
  iniciadoEm: c.iniciadoEm.toISOString(),
  encerradoEm: c.encerradoEm ? c.encerradoEm.toISOString() : null,
  transicoes: c.transicoes().map((t) => ({ fase: t.fase, ocorridaEm: t.ocorridaEm.toISOString() })),
  duracaoDasFasesEmDias: c.duracaoDasFasesEmDias(),
});

async function buscarDoDono(
  repo: CicloRepository,
  usuarioId: string,
  cicloId: string,
): Promise<CicloCultivo> {
  const ciclo = await repo.buscarPorId(cicloId);
  if (!ciclo || !ciclo.pertenceA(usuarioId)) {
    throw new CicloNaoEncontradoError();
  }
  return ciclo;
}

export interface IniciarCicloInput {
  usuarioId: string;
  ambienteId: string;
  nome: string;
  faseInicial?: FaseDeVida;
}

/** `POST /v1/ciclos`. Publica `CicloCriado` (consumido por Estatísticas e IA). */
export class IniciarCicloUseCase {
  constructor(
    private readonly ciclos: CicloRepository,
    private readonly ambientes: AmbienteRepository,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: IniciarCicloInput): Promise<CicloView> {
    // Ambiente de outro usuário responde igual a inexistente.
    const ambiente = await this.ambientes.buscarPorId(input.ambienteId);
    if (!ambiente || !ambiente.pertenceA(input.usuarioId)) {
      throw new AmbienteNaoEncontradoError();
    }

    const ciclo = CicloCultivo.iniciar({ id: this.idGen.gerar(), ...input });
    await this.ciclos.salvar(ciclo);
    await this.eventos.publicar(new CicloCriado(ciclo.id, ciclo.usuarioId, ciclo.ambienteId));
    return paraCicloView(ciclo);
  }
}

/** `GET /v1/ciclos` — todos, ou só os ativos. */
export class ListarCiclosUseCase {
  constructor(private readonly repo: CicloRepository) {}

  async executar(usuarioId: string, apenasAtivos = false): Promise<CicloView[]> {
    const ciclos = await this.repo.listarPorUsuario(usuarioId, apenasAtivos);
    return ciclos.map(paraCicloView);
  }
}

/** `GET /v1/ciclos/{id}` — inclui o histórico datado de transições. */
export class ObterCicloUseCase {
  constructor(private readonly repo: CicloRepository) {}

  async executar(input: { usuarioId: string; cicloId: string }): Promise<CicloView> {
    return paraCicloView(await buscarDoDono(this.repo, input.usuarioId, input.cicloId));
  }
}

/** `POST /v1/ciclos/{id}/fase` — avança a fase do ciclo, sempre com timestamp. */
export class AvancarFaseDoCicloUseCase {
  constructor(private readonly repo: CicloRepository) {}

  async executar(input: {
    usuarioId: string;
    cicloId: string;
    fase: FaseDeVida;
  }): Promise<CicloView> {
    const ciclo = await buscarDoDono(this.repo, input.usuarioId, input.cicloId);
    ciclo.avancarFase(input.fase);
    await this.repo.salvar(ciclo);
    return paraCicloView(ciclo);
  }
}

/** `PUT /v1/ciclos/{id}` — renomear. Recusa em ciclo encerrado (histórico imutável). */
export class RenomearCicloUseCase {
  constructor(private readonly repo: CicloRepository) {}

  async executar(input: { usuarioId: string; cicloId: string; nome: string }): Promise<CicloView> {
    const ciclo = await buscarDoDono(this.repo, input.usuarioId, input.cicloId);
    ciclo.renomear(input.nome);
    await this.repo.salvar(ciclo);
    return paraCicloView(ciclo);
  }
}

/**
 * `POST /v1/ciclos/{id}/encerrar`. Irreversível.
 * Publica `CicloFinalizado` com a duração já calculada — o consumidor (IA, Estatísticas)
 * não precisa reler o histórico de transições só para saber quanto tempo durou.
 */
export class EncerrarCicloUseCase {
  constructor(
    private readonly repo: CicloRepository,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: { usuarioId: string; cicloId: string }): Promise<CicloView> {
    const ciclo = await buscarDoDono(this.repo, input.usuarioId, input.cicloId);
    ciclo.encerrar();
    await this.repo.salvar(ciclo);

    const encerradoEm = ciclo.encerradoEm as Date;
    const duracaoEmDias = (encerradoEm.getTime() - ciclo.iniciadoEm.getTime()) / 86_400_000;
    await this.eventos.publicar(new CicloFinalizado(ciclo.id, ciclo.usuarioId, duracaoEmDias));
    return paraCicloView(ciclo);
  }
}
