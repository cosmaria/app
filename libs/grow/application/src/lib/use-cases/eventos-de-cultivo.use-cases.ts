import type { IdGenerator } from '@cosmaria/core-application';
import {
  CicloNaoEncontradoError,
  EventoDeCultivoNaoEncontradoError,
  EventoManejo,
  EventoSanidade,
  PlantaNaoEncontradaError,
  type Severidade,
  type TipoDeManejo,
  type TipoDeSanidade,
} from '@cosmaria/grow-domain';
import {
  CicloRepository,
  EventoManejoRepository,
  EventoSanidadeRepository,
  PlantaRepository,
} from '../ports/grow.repositories';

export interface EventoManejoView {
  eventoId: string;
  cicloId: string;
  plantaId: string | null;
  tipo: TipoDeManejo;
  ocorridoEm: string;
  observacoes: string | null;
}

export const paraManejoView = (e: EventoManejo): EventoManejoView => ({
  eventoId: e.id,
  cicloId: e.cicloId,
  plantaId: e.plantaId,
  tipo: e.tipo,
  ocorridoEm: e.ocorridoEm.toISOString(),
  observacoes: e.observacoes,
});

export interface EventoSanidadeView {
  eventoId: string;
  cicloId: string;
  plantaId: string | null;
  tipo: TipoDeSanidade;
  severidade: Severidade;
  descricao: string | null;
  tratamentoAplicado: string | null;
  ocorridoEm: string;
  resolvidoEm: string | null;
  resolvido: boolean;
}

export const paraSanidadeView = (e: EventoSanidade): EventoSanidadeView => ({
  eventoId: e.id,
  cicloId: e.cicloId,
  plantaId: e.plantaId,
  tipo: e.tipo,
  severidade: e.severidade,
  descricao: e.descricao,
  tratamentoAplicado: e.tratamentoAplicado,
  ocorridoEm: e.ocorridoEm.toISOString(),
  resolvidoEm: e.resolvidoEm ? e.resolvidoEm.toISOString() : null,
  resolvido: e.estaResolvido(),
});

/**
 * Valida que o ciclo é do usuário, está ativo, e que a planta (se informada) pertence a
 * ele. É a mesma guarda do check-in — extraída porque manejo e sanidade a repetem.
 */
async function garantirCicloEPlanta(
  ciclos: CicloRepository,
  plantas: PlantaRepository,
  input: { usuarioId: string; cicloId: string; plantaId?: string | null },
): Promise<void> {
  const ciclo = await ciclos.buscarPorId(input.cicloId);
  if (!ciclo || !ciclo.pertenceA(input.usuarioId)) {
    throw new CicloNaoEncontradoError();
  }
  ciclo.garantirAtivo();

  if (input.plantaId) {
    const planta = await plantas.buscarPorId(input.plantaId);
    if (!planta || !planta.pertenceA(input.usuarioId) || planta.cicloId !== input.cicloId) {
      throw new PlantaNaoEncontradaError();
    }
  }
}

export interface RegistrarManejoInput {
  usuarioId: string;
  cicloId: string;
  plantaId?: string | null;
  tipo: TipoDeManejo;
  ocorridoEm?: Date;
  observacoes?: string | null;
}

/** `POST /v1/eventos-manejo` (doc 09, API-2). Sem planta, o manejo vale para o ciclo. */
export class RegistrarManejoUseCase {
  constructor(
    private readonly eventos: EventoManejoRepository,
    private readonly ciclos: CicloRepository,
    private readonly plantas: PlantaRepository,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(input: RegistrarManejoInput): Promise<EventoManejoView> {
    await garantirCicloEPlanta(this.ciclos, this.plantas, input);
    const evento = EventoManejo.registrar({ id: this.idGen.gerar(), ...input });
    await this.eventos.salvar(evento);
    return paraManejoView(evento);
  }
}

/** `GET /v1/ciclos/{id}/eventos-manejo`. Legível mesmo em ciclo encerrado. */
export class ListarManejosDoCicloUseCase {
  constructor(
    private readonly eventos: EventoManejoRepository,
    private readonly ciclos: CicloRepository,
  ) {}

  async executar(input: { usuarioId: string; cicloId: string }): Promise<EventoManejoView[]> {
    const ciclo = await this.ciclos.buscarPorId(input.cicloId);
    if (!ciclo || !ciclo.pertenceA(input.usuarioId)) {
      throw new CicloNaoEncontradoError();
    }
    const lista = await this.eventos.listarPorCiclo(input.cicloId);
    return lista.map(paraManejoView);
  }
}

export interface RegistrarSanidadeInput {
  usuarioId: string;
  cicloId: string;
  plantaId?: string | null;
  tipo: TipoDeSanidade;
  severidade: Severidade;
  descricao?: string | null;
  tratamentoAplicado?: string | null;
  ocorridoEm?: Date;
}

/** `POST /v1/eventos-sanidade` (doc 09, API-2). Nasce em aberto. */
export class RegistrarSanidadeUseCase {
  constructor(
    private readonly eventos: EventoSanidadeRepository,
    private readonly ciclos: CicloRepository,
    private readonly plantas: PlantaRepository,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(input: RegistrarSanidadeInput): Promise<EventoSanidadeView> {
    await garantirCicloEPlanta(this.ciclos, this.plantas, input);
    const evento = EventoSanidade.registrar({ id: this.idGen.gerar(), ...input });
    await this.eventos.salvar(evento);
    return paraSanidadeView(evento);
  }
}

/**
 * `POST /v1/eventos-sanidade/{id}/resolver`.
 *
 * Transição monotônica e única — não é uma edição do histórico. Funciona mesmo com o
 * ciclo já encerrado: fechar o ciclo não deveria impedir o cultivador de anotar que a
 * praga foi resolvida antes da colheita.
 */
export class ResolverSanidadeUseCase {
  constructor(private readonly eventos: EventoSanidadeRepository) {}

  async executar(input: {
    usuarioId: string;
    eventoId: string;
    tratamentoAplicado?: string | null;
  }): Promise<EventoSanidadeView> {
    const evento = await this.eventos.buscarPorId(input.eventoId);
    if (!evento || !evento.pertenceA(input.usuarioId)) {
      throw new EventoDeCultivoNaoEncontradoError();
    }
    evento.resolver({ tratamentoAplicado: input.tratamentoAplicado });
    await this.eventos.salvar(evento);
    return paraSanidadeView(evento);
  }
}

/** `GET /v1/ciclos/{id}/eventos-sanidade`. Aceita filtrar só os em aberto. */
export class ListarSanidadeDoCicloUseCase {
  constructor(
    private readonly eventos: EventoSanidadeRepository,
    private readonly ciclos: CicloRepository,
  ) {}

  async executar(input: {
    usuarioId: string;
    cicloId: string;
    apenasAbertos?: boolean;
  }): Promise<EventoSanidadeView[]> {
    const ciclo = await this.ciclos.buscarPorId(input.cicloId);
    if (!ciclo || !ciclo.pertenceA(input.usuarioId)) {
      throw new CicloNaoEncontradoError();
    }
    const lista = await this.eventos.listarPorCiclo(input.cicloId, input.apenasAbertos);
    return lista.map(paraSanidadeView);
  }
}
