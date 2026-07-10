import { type NivelDeComplexidade, PreferenciaDeComplexidade } from '@cosmaria/core-domain';
import { IdGenerator } from '../ports/id-generator.port';
import { PreferenciaDeComplexidadeRepository } from '../ports/preferencia-de-complexidade.repository';

export interface ComplexidadeView {
  nivel: NivelDeComplexidade;
  modoEspecialista: boolean;
  camposHabilitados: string[];
}

const paraView = (p: PreferenciaDeComplexidade): ComplexidadeView => ({
  nivel: p.nivel,
  modoEspecialista: p.ehModoEspecialista(),
  camposHabilitados: p.camposHabilitados(),
});

/** Resolve a preferência da Conta, criando a padrão (essencial) na primeira leitura. */
export class ResolverPreferenciaDeComplexidadeService {
  constructor(
    private readonly repo: PreferenciaDeComplexidadeRepository,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(usuarioId: string): Promise<PreferenciaDeComplexidade> {
    const existente = await this.repo.buscarPorUsuario(usuarioId);
    if (existente) {
      return existente;
    }
    const padrao = PreferenciaDeComplexidade.padrao({ id: this.idGen.gerar(), usuarioId });
    await this.repo.salvar(padrao);
    // Releitura: sob concorrência, quem perdeu o INSERT precisa da linha real.
    return (await this.repo.buscarPorUsuario(usuarioId)) ?? padrao;
  }
}

/** `GET /v1/preferencia-complexidade` (doc 09). */
export class ObterPreferenciaDeComplexidadeUseCase {
  constructor(private readonly resolver: ResolverPreferenciaDeComplexidadeService) {}

  async executar(usuarioId: string): Promise<ComplexidadeView> {
    return paraView(await this.resolver.executar(usuarioId));
  }
}

export interface AtualizarComplexidadeInput {
  usuarioId: string;
  nivel?: NivelDeComplexidade;
  /** Campos a liberar individualmente, sem subir de nível (doc 02 §5.0). */
  habilitarCampos?: string[];
  desabilitarCampos?: string[];
}

/** `PUT /v1/preferencia-complexidade` — atualização parcial (campo ausente não muda). */
export class AtualizarPreferenciaDeComplexidadeUseCase {
  constructor(
    private readonly resolver: ResolverPreferenciaDeComplexidadeService,
    private readonly repo: PreferenciaDeComplexidadeRepository,
  ) {}

  async executar(input: AtualizarComplexidadeInput): Promise<ComplexidadeView> {
    const preferencia = await this.resolver.executar(input.usuarioId);

    if (input.nivel) {
      preferencia.definirNivel(input.nivel);
    }
    for (const codigo of input.habilitarCampos ?? []) {
      preferencia.habilitarCampo(codigo);
    }
    for (const codigo of input.desabilitarCampos ?? []) {
      preferencia.desabilitarCampo(codigo);
    }

    await this.repo.salvar(preferencia);
    return paraView(preferencia);
  }
}

/** Um campo declarado por Grow/Med, com o nível a partir do qual aparece. */
export interface CampoDeComplexidade {
  codigo: string;
  nivel: NivelDeComplexidade;
}

/**
 * Filtra os campos que o usuário deve ver (doc 02 §5.0).
 *
 * É a única implementação da regra: Grow e Med **declaram** o nível de cada campo e
 * perguntam ao Core o que exibir — nunca reimplementam o corte por nível. Foi assim que
 * o doc 02 §6 descreveu o Módulo de Complexidade Progressiva como transversal.
 */
export class FiltrarCamposPorComplexidadeUseCase {
  constructor(private readonly resolver: ResolverPreferenciaDeComplexidadeService) {}

  async executar(usuarioId: string, campos: CampoDeComplexidade[]): Promise<string[]> {
    const preferencia = await this.resolver.executar(usuarioId);
    return campos.filter((c) => preferencia.campoVisivel(c.codigo, c.nivel)).map((c) => c.codigo);
  }
}
