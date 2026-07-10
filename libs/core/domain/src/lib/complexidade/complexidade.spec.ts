import {
  NivelDeComplexidade,
  ehNivelDeComplexidadeValido,
  nivelAlcanca,
} from './nivel-de-complexidade';
import { PreferenciaDeComplexidade } from './preferencia-de-complexidade.entity';

const preferencia = (): PreferenciaDeComplexidade =>
  PreferenciaDeComplexidade.padrao({ id: 'p-1', usuarioId: 'u-1' });

describe('NivelDeComplexidade (doc 02 §5.0)', () => {
  it('valida níveis conhecidos', () => {
    expect(ehNivelDeComplexidadeValido('ESSENCIAL')).toBe(true);
    expect(ehNivelDeComplexidadeValido('GURU')).toBe(false);
  });

  it('a ordem é essencial < avançado < especialista', () => {
    expect(nivelAlcanca(NivelDeComplexidade.ESSENCIAL, NivelDeComplexidade.AVANCADO)).toBe(false);
    expect(nivelAlcanca(NivelDeComplexidade.AVANCADO, NivelDeComplexidade.ESSENCIAL)).toBe(true);
    expect(nivelAlcanca(NivelDeComplexidade.ESPECIALISTA, NivelDeComplexidade.ESPECIALISTA)).toBe(
      true,
    );
  });
});

describe('PreferenciaDeComplexidade (entidade única do Core — doc 02 §6)', () => {
  it('toda Conta nasce no essencial, sem campos avançados', () => {
    const p = preferencia();
    expect(p.nivel).toBe(NivelDeComplexidade.ESSENCIAL);
    expect(p.camposHabilitados()).toEqual([]);
    expect(p.ehModoEspecialista()).toBe(false);
  });

  it('o iniciante não vê parâmetros técnicos de cara (EC/VPD/PPFD/DLI)', () => {
    const p = preferencia();
    expect(p.campoVisivel('grow.checkin', NivelDeComplexidade.ESSENCIAL)).toBe(true);
    expect(p.campoVisivel('grow.ec', NivelDeComplexidade.AVANCADO)).toBe(false);
    expect(p.campoVisivel('grow.dli', NivelDeComplexidade.ESPECIALISTA)).toBe(false);
  });

  it('habilitação progressiva: libera um campo sem subir de nível', () => {
    const p = preferencia();
    p.habilitarCampo('grow.ec');

    expect(p.campoVisivel('grow.ec', NivelDeComplexidade.AVANCADO)).toBe(true);
    // O nível não mudou: os demais campos avançados continuam ocultos.
    expect(p.nivel).toBe(NivelDeComplexidade.ESSENCIAL);
    expect(p.campoVisivel('grow.vpd', NivelDeComplexidade.AVANCADO)).toBe(false);
  });

  it('subir de nível revela todos os campos daquele nível de uma vez', () => {
    const p = preferencia();
    p.definirNivel(NivelDeComplexidade.AVANCADO);

    expect(p.campoVisivel('grow.ec', NivelDeComplexidade.AVANCADO)).toBe(true);
    expect(p.campoVisivel('grow.vpd', NivelDeComplexidade.AVANCADO)).toBe(true);
    expect(p.campoVisivel('grow.dli', NivelDeComplexidade.ESPECIALISTA)).toBe(false);
  });

  it('Modo Especialista libera todos os parâmetros de uma vez', () => {
    const p = preferencia();
    p.definirNivel(NivelDeComplexidade.ESPECIALISTA);

    expect(p.ehModoEspecialista()).toBe(true);
    expect(p.campoVisivel('grow.dli', NivelDeComplexidade.ESPECIALISTA)).toBe(true);
    expect(p.campoVisivel('med.concentracao', NivelDeComplexidade.ESPECIALISTA)).toBe(true);
  });

  it('desabilitar campo não esconde o que o NÍVEL já mostra', () => {
    const p = preferencia();
    p.definirNivel(NivelDeComplexidade.ESPECIALISTA);
    p.habilitarCampo('grow.ec');
    p.desabilitarCampo('grow.ec');

    // Para ver menos, o usuário baixa o nível — não recolhe campo por campo.
    expect(p.campoVisivel('grow.ec', NivelDeComplexidade.AVANCADO)).toBe(true);
    expect(p.camposHabilitados()).toEqual([]);
  });

  it('a mesma preferência vale para Grow e Med (nunca duplicada por app)', () => {
    const p = preferencia();
    p.definirNivel(NivelDeComplexidade.AVANCADO);
    expect(p.campoVisivel('grow.ec', NivelDeComplexidade.AVANCADO)).toBe(true);
    expect(p.campoVisivel('med.via_administracao', NivelDeComplexidade.AVANCADO)).toBe(true);
  });

  it('habilitar o mesmo campo duas vezes é idempotente', () => {
    const p = preferencia();
    p.habilitarCampo('grow.ec');
    p.habilitarCampo('grow.ec');
    expect(p.camposHabilitados()).toEqual(['grow.ec']);
  });

  it('atualiza o carimbo de tempo a cada alteração', () => {
    const p = preferencia();
    const depois = new Date(p.atualizadoEm.getTime() + 1000);
    p.definirNivel(NivelDeComplexidade.AVANCADO, depois);
    expect(p.atualizadoEm).toEqual(depois);
  });
});
