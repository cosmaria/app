import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import {
  type CampoDeComplexidade,
  type ComplexidadePublicApi,
  NivelDeComplexidade,
} from '@cosmaria/core-public-api';
import {
  CicloNaoEncontradoError,
  type OrigemDoRegistro,
  PlantaNaoEncontradaError,
  RegistroAmbiental,
  RegistroAmbientalCriado,
  RegistroSemMedicaoError,
} from '@cosmaria/grow-domain';
import {
  CicloRepository,
  PlantaRepository,
  RegistroAmbientalRepository,
} from '../ports/grow.repositories';

/**
 * Vocabulário de campos do check-in, com o nível em que cada um aparece (doc 02 §5.0).
 *
 * O Grow **declara**; quem decide o que exibir é a COMPLEXIDADE_PUBLIC_API do Core. Um
 * iniciante registra temperatura e umidade — e já ganha o VPD calculado de graça, sem
 * nunca ter ouvido falar dele. EC/pH aparecem no avançado; PPFD/DLI, no especialista.
 */
export const CAMPOS_DO_CHECKIN: readonly CampoDeComplexidade[] = [
  { codigo: 'grow.temperatura', nivel: NivelDeComplexidade.ESSENCIAL },
  { codigo: 'grow.umidade', nivel: NivelDeComplexidade.ESSENCIAL },
  { codigo: 'grow.observacoes', nivel: NivelDeComplexidade.ESSENCIAL },
  { codigo: 'grow.ph', nivel: NivelDeComplexidade.AVANCADO },
  { codigo: 'grow.ec', nivel: NivelDeComplexidade.AVANCADO },
  { codigo: 'grow.ppfd', nivel: NivelDeComplexidade.ESPECIALISTA },
  { codigo: 'grow.horas_de_luz', nivel: NivelDeComplexidade.ESPECIALISTA },
  { codigo: 'grow.delta_folha', nivel: NivelDeComplexidade.ESPECIALISTA },
];

export interface RegistroAmbientalView {
  registroId: string;
  cicloId: string;
  plantaId: string | null;
  registradoEm: string;
  origem: OrigemDoRegistro;
  temperaturaC: number | null;
  umidadeRelativa: number | null;
  ph: number | null;
  ec: number | null;
  ppfd: number | null;
  horasDeLuz: number | null;
  /** Derivados, calculados na criação (doc 02 §5.6). */
  vpdKpa: number | null;
  dli: number | null;
  observacoes: string | null;
}

export const paraRegistroView = (r: RegistroAmbiental): RegistroAmbientalView => ({
  registroId: r.id,
  cicloId: r.cicloId,
  plantaId: r.plantaId,
  registradoEm: r.registradoEm.toISOString(),
  origem: r.origem,
  temperaturaC: r.temperaturaC,
  umidadeRelativa: r.umidadeRelativa,
  ph: r.ph,
  ec: r.ec,
  ppfd: r.ppfd,
  horasDeLuz: r.horasDeLuz,
  vpdKpa: r.vpdKpa,
  dli: r.dli,
  observacoes: r.observacoes,
});

export interface RegistrarCheckInInput {
  usuarioId: string;
  cicloId: string;
  plantaId?: string | null;
  registradoEm?: Date;
  origem?: OrigemDoRegistro;
  temperaturaC?: number | null;
  umidadeRelativa?: number | null;
  ph?: number | null;
  ec?: number | null;
  ppfd?: number | null;
  horasDeLuz?: number | null;
  deltaFolhaC?: number | null;
  observacoes?: string | null;
}

/**
 * `POST /v1/registros-ambientais` — o "check-in diário único" do doc 02 §4.
 *
 * Aceita registro em ciclo **encerrado**? Não: a série temporal de um ciclo terminado é
 * histórico fechado, e permitir escrita depois falsificaria as durações e comparações
 * que a IA analisa. Mesma regra do resto do Grow.
 *
 * Publica `RegistroAmbientalCriado` com os derivados já calculados — a IA nunca
 * reimplementa as fórmulas do Grow, o que criaria duas versões livres para divergir.
 */
export class RegistrarCheckInUseCase {
  constructor(
    private readonly registros: RegistroAmbientalRepository,
    private readonly ciclos: CicloRepository,
    private readonly plantas: PlantaRepository,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: RegistrarCheckInInput): Promise<RegistroAmbientalView> {
    const ciclo = await this.ciclos.buscarPorId(input.cicloId);
    if (!ciclo || !ciclo.pertenceA(input.usuarioId)) {
      throw new CicloNaoEncontradoError();
    }
    ciclo.garantirAtivo();

    // Medição de planta específica: a planta precisa existir, ser do dono e do ciclo.
    if (input.plantaId) {
      const planta = await this.plantas.buscarPorId(input.plantaId);
      if (!planta || !planta.pertenceA(input.usuarioId) || planta.cicloId !== input.cicloId) {
        throw new PlantaNaoEncontradaError();
      }
    }

    const registro = RegistroAmbiental.registrar({ id: this.idGen.gerar(), ...input });
    if (!registro.possuiAlgumaMedicao()) {
      throw new RegistroSemMedicaoError();
    }

    await this.registros.salvar(registro);
    await this.eventos.publicar(
      new RegistroAmbientalCriado(
        registro.id,
        registro.usuarioId,
        registro.cicloId,
        registro.plantaId,
        registro.vpdKpa,
        registro.dli,
        // Timestamp do check-in (não o de publicação): é ele que alinha a série na IA
        // por dia — sem isso, todas as leituras colapsariam no dia da ingestão.
        registro.registradoEm,
      ),
    );
    return paraRegistroView(registro);
  }
}

export interface SerieTemporalView {
  itens: RegistroAmbientalView[];
  total: number;
}

/**
 * `GET /v1/ciclos/{id}/registros-ambientais` — a série temporal do ciclo, paginada
 * (convenção transversal do doc 09 §5) e do mais recente para o mais antigo.
 *
 * A leitura funciona mesmo em ciclo encerrado: o histórico nunca é capado — só a escrita
 * é que fecha.
 */
export class ListarSerieTemporalUseCase {
  private static readonly LIMITE_PADRAO = 50;
  private static readonly LIMITE_MAXIMO = 500;

  constructor(
    private readonly registros: RegistroAmbientalRepository,
    private readonly ciclos: CicloRepository,
  ) {}

  async executar(input: {
    usuarioId: string;
    cicloId: string;
    limite?: number;
    deslocamento?: number;
  }): Promise<SerieTemporalView> {
    const ciclo = await this.ciclos.buscarPorId(input.cicloId);
    if (!ciclo || !ciclo.pertenceA(input.usuarioId)) {
      throw new CicloNaoEncontradoError();
    }

    const limite = Math.min(
      Math.max(input.limite ?? ListarSerieTemporalUseCase.LIMITE_PADRAO, 1),
      ListarSerieTemporalUseCase.LIMITE_MAXIMO,
    );
    const deslocamento = Math.max(input.deslocamento ?? 0, 0);

    const pagina = await this.registros.listarPorCiclo(input.cicloId, { limite, deslocamento });
    return { itens: pagina.itens.map(paraRegistroView), total: pagina.total };
  }
}

/**
 * `GET /v1/registros-ambientais/campos` — quais campos do check-in este usuário vê.
 *
 * É o Módulo de Complexidade Progressiva em ação (doc 02 §5.0/§6): o Grow declara o
 * nível de cada campo, o Core decide. Não filtramos a **escrita** por nível — recusar um
 * EC enviado por um usuário "essencial" seria hostil e quebraria integrações futuras de
 * sensor, que não têm nível.
 */
export class ObterCamposDoCheckInUseCase {
  constructor(private readonly complexidade: ComplexidadePublicApi) {}

  async executar(usuarioId: string): Promise<string[]> {
    return this.complexidade.filtrarCampos(usuarioId, [...CAMPOS_DO_CHECKIN]);
  }
}
