import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import {
  Colheita,
  ColheitaNaoEncontradaError,
  ColheitaRegistrada,
  CicloNaoEncontradoError,
  Cura,
  CuraJaRegistradaError,
  CuraNaoEncontradaError,
  Lote,
  LoteJaGeradoError,
  LoteNaoEncontradoError,
  PlantaNaoEncontradaError,
  Secagem,
  SecagemJaRegistradaError,
  SecagemNaoEncontradaError,
} from '@cosmaria/grow-domain';
import {
  CicloRepository,
  ColheitaRepository,
  CuraRepository,
  LoteRepository,
  PlantaRepository,
  SecagemRepository,
} from '../ports/grow.repositories';

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

export interface ColheitaView {
  colheitaId: string;
  cicloId: string;
  plantaIds: string[];
  quantidadeDePlantas: number;
  pesoUmidoGramas: number | null;
  colhidoEm: string;
  observacoes: string | null;
}

export const paraColheitaView = (c: Colheita): ColheitaView => ({
  colheitaId: c.id,
  cicloId: c.cicloId,
  plantaIds: c.plantaIds,
  quantidadeDePlantas: c.quantidadeDePlantas(),
  pesoUmidoGramas: c.pesoUmidoGramas,
  colhidoEm: c.colhidoEm.toISOString(),
  observacoes: c.observacoes,
});

export interface SecagemView {
  secagemId: string;
  colheitaId: string;
  iniciadaEm: string;
  finalizadaEm: string | null;
  finalizada: boolean;
  duracaoEmDias: number | null;
  temperaturaC: number | null;
  umidadeRelativa: number | null;
  observacoes: string | null;
}

export const paraSecagemView = (s: Secagem): SecagemView => ({
  secagemId: s.id,
  colheitaId: s.colheitaId,
  iniciadaEm: s.iniciadaEm.toISOString(),
  finalizadaEm: s.finalizadaEm ? s.finalizadaEm.toISOString() : null,
  finalizada: s.estaFinalizada(),
  duracaoEmDias: s.duracaoEmDias(),
  temperaturaC: s.temperaturaC,
  umidadeRelativa: s.umidadeRelativa,
  observacoes: s.observacoes,
});

export interface CuraView {
  curaId: string;
  secagemId: string;
  iniciadaEm: string;
  finalizadaEm: string | null;
  finalizada: boolean;
  duracaoEmDias: number | null;
  temperaturaC: number | null;
  umidadeRelativa: number | null;
  burping: string | null;
  observacoes: string | null;
}

export const paraCuraView = (c: Cura): CuraView => ({
  curaId: c.id,
  secagemId: c.secagemId,
  iniciadaEm: c.iniciadaEm.toISOString(),
  finalizadaEm: c.finalizadaEm ? c.finalizadaEm.toISOString() : null,
  finalizada: c.estaFinalizada(),
  duracaoEmDias: c.duracaoEmDias(),
  temperaturaC: c.temperaturaC,
  umidadeRelativa: c.umidadeRelativa,
  burping: c.burping,
  observacoes: c.observacoes,
});

export interface LoteView {
  loteId: string;
  curaId: string;
  codigo: string;
  pesoSecoGramas: number;
  /** Derivado do número de plantas da colheita de origem — null se não resolvível. */
  gramasPorPlanta: number | null;
  quantidadeDePlantas: number | null;
  observacoes: string | null;
  geradoEm: string;
}

export const paraLoteView = (l: Lote, quantidadeDePlantas: number | null): LoteView => ({
  loteId: l.id,
  curaId: l.curaId,
  codigo: l.codigo,
  pesoSecoGramas: l.pesoSecoGramas,
  gramasPorPlanta: quantidadeDePlantas ? l.gramasPorPlanta(quantidadeDePlantas) : null,
  quantidadeDePlantas,
  observacoes: l.observacoes,
  geradoEm: l.geradoEm.toISOString(),
});

// ---------------------------------------------------------------------------
// Colheita
// ---------------------------------------------------------------------------

export interface RegistrarColheitaInput {
  usuarioId: string;
  cicloId: string;
  plantaIds: string[];
  pesoUmidoGramas?: number | null;
  colhidoEm?: Date;
  observacoes?: string | null;
}

/**
 * `POST /v1/colheitas` (doc 09, API-2). Colheita escalonada: 0—N por ciclo, cada uma sobre
 * um subconjunto de plantas. Exige o ciclo **ativo** — colher é uma ação de cultivo, como
 * o manejo; a colheita antecede o encerramento no fluxo (doc 02 §5.11). Publica
 * `ColheitaRegistrada` (IA, Notificações).
 */
export class RegistrarColheitaUseCase {
  constructor(
    private readonly colheitas: ColheitaRepository,
    private readonly ciclos: CicloRepository,
    private readonly plantas: PlantaRepository,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: RegistrarColheitaInput): Promise<ColheitaView> {
    const ciclo = await this.ciclos.buscarPorId(input.cicloId);
    if (!ciclo || !ciclo.pertenceA(input.usuarioId)) {
      throw new CicloNaoEncontradoError();
    }
    ciclo.garantirAtivo();

    // Toda planta colhida precisa ser deste ciclo. Uma planta de fora responde como
    // inexistente — não confirmamos a existência de recurso alheio.
    const idsDoCiclo = new Set((await this.plantas.listarPorCiclo(input.cicloId)).map((p) => p.id));
    for (const plantaId of new Set(input.plantaIds)) {
      if (!idsDoCiclo.has(plantaId)) {
        throw new PlantaNaoEncontradaError();
      }
    }

    const colheita = Colheita.registrar({ id: this.idGen.gerar(), ...input });
    await this.colheitas.salvar(colheita);
    await this.eventos.publicar(
      new ColheitaRegistrada(
        colheita.id,
        colheita.usuarioId,
        colheita.cicloId,
        colheita.quantidadeDePlantas(),
        colheita.pesoUmidoGramas,
      ),
    );
    return paraColheitaView(colheita);
  }
}

/** `GET /v1/colheitas/{id}` (doc 09, API-3). */
export class ObterColheitaUseCase {
  constructor(private readonly colheitas: ColheitaRepository) {}

  async executar(input: { usuarioId: string; colheitaId: string }): Promise<ColheitaView> {
    const colheita = await this.colheitas.buscarPorId(input.colheitaId);
    if (!colheita || !colheita.pertenceA(input.usuarioId)) {
      throw new ColheitaNaoEncontradaError();
    }
    return paraColheitaView(colheita);
  }
}

/** `GET /v1/ciclos/{id}/colheitas`. Legível mesmo em ciclo encerrado. */
export class ListarColheitasDoCicloUseCase {
  constructor(
    private readonly colheitas: ColheitaRepository,
    private readonly ciclos: CicloRepository,
  ) {}

  async executar(input: { usuarioId: string; cicloId: string }): Promise<ColheitaView[]> {
    const ciclo = await this.ciclos.buscarPorId(input.cicloId);
    if (!ciclo || !ciclo.pertenceA(input.usuarioId)) {
      throw new CicloNaoEncontradoError();
    }
    const lista = await this.colheitas.listarPorCiclo(input.cicloId);
    return lista.map(paraColheitaView);
  }
}

// ---------------------------------------------------------------------------
// Secagem
// ---------------------------------------------------------------------------

export interface RegistrarSecagemInput {
  usuarioId: string;
  colheitaId: string;
  iniciadaEm?: Date;
  finalizadaEm?: Date | null;
  temperaturaC?: number | null;
  umidadeRelativa?: number | null;
  observacoes?: string | null;
}

/**
 * `POST /v1/secagens` (doc 09, API-2). 1—1 com a Colheita. Não exige ciclo ativo: a
 * secagem é pós-colheita e pode continuar depois do encerramento do ciclo.
 */
export class RegistrarSecagemUseCase {
  constructor(
    private readonly secagens: SecagemRepository,
    private readonly colheitas: ColheitaRepository,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(input: RegistrarSecagemInput): Promise<SecagemView> {
    const colheita = await this.colheitas.buscarPorId(input.colheitaId);
    if (!colheita || !colheita.pertenceA(input.usuarioId)) {
      throw new ColheitaNaoEncontradaError();
    }
    if (await this.secagens.buscarPorColheita(input.colheitaId)) {
      throw new SecagemJaRegistradaError();
    }
    const secagem = Secagem.registrar({ id: this.idGen.gerar(), ...input });
    await this.secagens.salvar(secagem);
    return paraSecagemView(secagem);
  }
}

/** `POST /v1/secagens/{id}/finalizar`. Transição monotônica e única. */
export class FinalizarSecagemUseCase {
  constructor(private readonly secagens: SecagemRepository) {}

  async executar(input: { usuarioId: string; secagemId: string }): Promise<SecagemView> {
    const secagem = await this.secagens.buscarPorId(input.secagemId);
    if (!secagem || !secagem.pertenceA(input.usuarioId)) {
      throw new SecagemNaoEncontradaError();
    }
    secagem.finalizar();
    await this.secagens.salvar(secagem);
    return paraSecagemView(secagem);
  }
}

// ---------------------------------------------------------------------------
// Cura
// ---------------------------------------------------------------------------

export interface RegistrarCuraInput {
  usuarioId: string;
  secagemId: string;
  iniciadaEm?: Date;
  finalizadaEm?: Date | null;
  temperaturaC?: number | null;
  umidadeRelativa?: number | null;
  burping?: string | null;
  observacoes?: string | null;
}

/** `POST /v1/curas` (doc 09, API-2). 1—1 com a Secagem. */
export class RegistrarCuraUseCase {
  constructor(
    private readonly curas: CuraRepository,
    private readonly secagens: SecagemRepository,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(input: RegistrarCuraInput): Promise<CuraView> {
    const secagem = await this.secagens.buscarPorId(input.secagemId);
    if (!secagem || !secagem.pertenceA(input.usuarioId)) {
      throw new SecagemNaoEncontradaError();
    }
    if (await this.curas.buscarPorSecagem(input.secagemId)) {
      throw new CuraJaRegistradaError();
    }
    const cura = Cura.registrar({ id: this.idGen.gerar(), ...input });
    await this.curas.salvar(cura);
    return paraCuraView(cura);
  }
}

/** `POST /v1/curas/{id}/finalizar`. Monotônica. */
export class FinalizarCuraUseCase {
  constructor(private readonly curas: CuraRepository) {}

  async executar(input: { usuarioId: string; curaId: string }): Promise<CuraView> {
    const cura = await this.curas.buscarPorId(input.curaId);
    if (!cura || !cura.pertenceA(input.usuarioId)) {
      throw new CuraNaoEncontradaError();
    }
    cura.finalizar();
    await this.curas.salvar(cura);
    return paraCuraView(cura);
  }
}

// ---------------------------------------------------------------------------
// Lote
// ---------------------------------------------------------------------------

/**
 * Resolve o número de plantas que originou este lote, andando Cura → Secagem → Colheita.
 * É o que sustenta o rendimento por planta. `null` se algum elo sumiu.
 */
async function quantidadeDePlantasDoLote(
  lote: Lote,
  curas: CuraRepository,
  secagens: SecagemRepository,
  colheitas: ColheitaRepository,
): Promise<number | null> {
  const cura = await curas.buscarPorId(lote.curaId);
  if (!cura) return null;
  const secagem = await secagens.buscarPorId(cura.secagemId);
  if (!secagem) return null;
  const colheita = await colheitas.buscarPorId(secagem.colheitaId);
  return colheita ? colheita.quantidadeDePlantas() : null;
}

export interface GerarLoteInput {
  usuarioId: string;
  curaId: string;
  codigo: string;
  pesoSecoGramas: number;
  observacoes?: string | null;
}

/**
 * `POST /v1/lotes` (doc 09, API-2). Fecha o fluxo pós-colheita: 1—1 com a Cura. O Lote é
 * entidade **pura do Grow** — a referência opt-in do Med virá por ID+snapshot quando o Med
 * existir, sem tocar aqui (ver `Lote`).
 */
export class GerarLoteUseCase {
  constructor(
    private readonly lotes: LoteRepository,
    private readonly curas: CuraRepository,
    private readonly secagens: SecagemRepository,
    private readonly colheitas: ColheitaRepository,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(input: GerarLoteInput): Promise<LoteView> {
    const cura = await this.curas.buscarPorId(input.curaId);
    if (!cura || !cura.pertenceA(input.usuarioId)) {
      throw new CuraNaoEncontradaError();
    }
    if (await this.lotes.buscarPorCura(input.curaId)) {
      throw new LoteJaGeradoError();
    }
    const lote = Lote.gerar({ id: this.idGen.gerar(), ...input });
    await this.lotes.salvar(lote);
    const qtd = await quantidadeDePlantasDoLote(lote, this.curas, this.secagens, this.colheitas);
    return paraLoteView(lote, qtd);
  }
}

/** `GET /v1/lotes/{id}` (doc 09, API-3) — a visão do próprio dono no Grow. */
export class ObterLoteUseCase {
  constructor(
    private readonly lotes: LoteRepository,
    private readonly curas: CuraRepository,
    private readonly secagens: SecagemRepository,
    private readonly colheitas: ColheitaRepository,
  ) {}

  async executar(input: { usuarioId: string; loteId: string }): Promise<LoteView> {
    const lote = await this.lotes.buscarPorId(input.loteId);
    if (!lote || !lote.pertenceA(input.usuarioId)) {
      throw new LoteNaoEncontradoError();
    }
    const qtd = await quantidadeDePlantasDoLote(lote, this.curas, this.secagens, this.colheitas);
    return paraLoteView(lote, qtd);
  }
}
