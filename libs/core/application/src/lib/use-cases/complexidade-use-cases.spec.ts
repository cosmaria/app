import { NivelDeComplexidade, PreferenciaDeComplexidade } from '@cosmaria/core-domain';
import type { IdGenerator } from '../ports/id-generator.port';
import type { PreferenciaDeComplexidadeRepository } from '../ports/preferencia-de-complexidade.repository';
import {
  AtualizarPreferenciaDeComplexidadeUseCase,
  FiltrarCamposPorComplexidadeUseCase,
  ObterPreferenciaDeComplexidadeUseCase,
  ResolverPreferenciaDeComplexidadeService,
} from './complexidade.use-cases';

class PreferenciasFake implements PreferenciaDeComplexidadeRepository {
  readonly porUsuario = new Map<string, PreferenciaDeComplexidade>();
  salvar(p: PreferenciaDeComplexidade): Promise<void> {
    this.porUsuario.set(p.usuarioId, p);
    return Promise.resolve();
  }
  buscarPorUsuario(usuarioId: string): Promise<PreferenciaDeComplexidade | null> {
    return Promise.resolve(this.porUsuario.get(usuarioId) ?? null);
  }
}

const ids = (): IdGenerator => {
  let n = 0;
  return { gerar: () => `p-${++n}` };
};

const montar = () => {
  const preferencias = new PreferenciasFake();
  const resolver = new ResolverPreferenciaDeComplexidadeService(preferencias, ids());
  return {
    preferencias,
    resolver,
    obter: new ObterPreferenciaDeComplexidadeUseCase(resolver),
    atualizar: new AtualizarPreferenciaDeComplexidadeUseCase(resolver, preferencias),
    filtrar: new FiltrarCamposPorComplexidadeUseCase(resolver),
  };
};

/** Vocabulário que Grow e Med declarariam — o Core nunca o conhece de antemão. */
const CAMPOS = [
  { codigo: 'grow.checkin', nivel: NivelDeComplexidade.ESSENCIAL },
  { codigo: 'grow.ec', nivel: NivelDeComplexidade.AVANCADO },
  { codigo: 'grow.vpd', nivel: NivelDeComplexidade.AVANCADO },
  { codigo: 'grow.dli', nivel: NivelDeComplexidade.ESPECIALISTA },
  { codigo: 'med.sintoma', nivel: NivelDeComplexidade.ESSENCIAL },
  { codigo: 'med.concentracao', nivel: NivelDeComplexidade.ESPECIALISTA },
];

describe('ResolverPreferenciaDeComplexidadeService', () => {
  it('cria a preferência padrão (essencial) na primeira leitura', async () => {
    const c = montar();
    const view = await c.obter.executar('u-1');

    expect(view.nivel).toBe(NivelDeComplexidade.ESSENCIAL);
    expect(view.modoEspecialista).toBe(false);
    expect(c.preferencias.porUsuario.size).toBe(1);
  });

  it('é idempotente: a segunda leitura não cria outra preferência', async () => {
    const c = montar();
    await c.obter.executar('u-1');
    await c.obter.executar('u-1');
    expect(c.preferencias.porUsuario.size).toBe(1);
  });
});

describe('FiltrarCamposPorComplexidadeUseCase (doc 02 §5.0)', () => {
  it('o iniciante só vê o essencial — sem EC/VPD/DLI de cara', async () => {
    const c = montar();
    const visiveis = await c.filtrar.executar('u-1', CAMPOS);
    expect(visiveis).toEqual(['grow.checkin', 'med.sintoma']);
  });

  it('habilitação progressiva revela UM campo, sem trazer os outros junto', async () => {
    const c = montar();
    await c.atualizar.executar({ usuarioId: 'u-1', habilitarCampos: ['grow.ec'] });

    const visiveis = await c.filtrar.executar('u-1', CAMPOS);
    expect(visiveis).toContain('grow.ec');
    expect(visiveis).not.toContain('grow.vpd');
  });

  it('subir para avançado revela todos os campos avançados de uma vez', async () => {
    const c = montar();
    await c.atualizar.executar({ usuarioId: 'u-1', nivel: NivelDeComplexidade.AVANCADO });

    const visiveis = await c.filtrar.executar('u-1', CAMPOS);
    expect(visiveis).toEqual(
      expect.arrayContaining(['grow.checkin', 'grow.ec', 'grow.vpd', 'med.sintoma']),
    );
    expect(visiveis).not.toContain('grow.dli');
  });

  it('Modo Especialista libera todos os parâmetros, em Grow e Med', async () => {
    const c = montar();
    await c.atualizar.executar({ usuarioId: 'u-1', nivel: NivelDeComplexidade.ESPECIALISTA });

    const visiveis = await c.filtrar.executar('u-1', CAMPOS);
    expect(visiveis).toHaveLength(CAMPOS.length);
  });

  it('a preferência é ÚNICA por Conta: vale para Grow e Med ao mesmo tempo', async () => {
    const c = montar();
    await c.atualizar.executar({ usuarioId: 'u-1', nivel: NivelDeComplexidade.ESPECIALISTA });

    const soDoMed = await c.filtrar.executar(
      'u-1',
      CAMPOS.filter((campo) => campo.codigo.startsWith('med.')),
    );
    expect(soDoMed).toContain('med.concentracao');
  });

  it('campo desconhecido pelo Core não quebra o filtro — o vocabulário é dos módulos', async () => {
    const c = montar();
    const visiveis = await c.filtrar.executar('u-1', [
      { codigo: 'modulo_futuro.campo', nivel: NivelDeComplexidade.ESSENCIAL },
    ]);
    expect(visiveis).toEqual(['modulo_futuro.campo']);
  });
});

describe('AtualizarPreferenciaDeComplexidadeUseCase', () => {
  it('atualização parcial não zera o que não foi enviado', async () => {
    const c = montar();
    await c.atualizar.executar({ usuarioId: 'u-1', habilitarCampos: ['grow.ec'] });
    const view = await c.atualizar.executar({
      usuarioId: 'u-1',
      nivel: NivelDeComplexidade.AVANCADO,
    });

    expect(view.nivel).toBe(NivelDeComplexidade.AVANCADO);
    expect(view.camposHabilitados).toEqual(['grow.ec']);
  });

  it('desabilitar campo remove só a liberação individual', async () => {
    const c = montar();
    await c.atualizar.executar({ usuarioId: 'u-1', habilitarCampos: ['grow.ec', 'grow.vpd'] });
    const view = await c.atualizar.executar({ usuarioId: 'u-1', desabilitarCampos: ['grow.ec'] });

    expect(view.camposHabilitados).toEqual(['grow.vpd']);
  });

  it('baixar o nível volta a esconder os campos daquele nível', async () => {
    const c = montar();
    await c.atualizar.executar({ usuarioId: 'u-1', nivel: NivelDeComplexidade.ESPECIALISTA });
    await c.atualizar.executar({ usuarioId: 'u-1', nivel: NivelDeComplexidade.ESSENCIAL });

    const visiveis = await c.filtrar.executar('u-1', CAMPOS);
    expect(visiveis).toEqual(['grow.checkin', 'med.sintoma']);
  });
});
