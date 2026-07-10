/**
 * Níveis de complexidade (doc 02 §5.0, validado 2026-07-08).
 *
 * NÃO são apps nem telas separadas: são um único fluxo em que cada campo declara o
 * nível a partir do qual aparece. A complexidade cresce com o usuário.
 */
export enum NivelDeComplexidade {
  /** Primeiro cultivo/tratamento: só o essencial. Nunca exige EC/VPD/PPFD/DLI de cara. */
  ESSENCIAL = 'ESSENCIAL',
  /** Campos avançados aparecem conforme o usuário demonstra interesse. */
  AVANCADO = 'AVANCADO',
  /** Modo Especialista: libera todos os parâmetros de uma vez (doc 02 §5.0). */
  ESPECIALISTA = 'ESPECIALISTA',
}

export function ehNivelDeComplexidadeValido(valor: string): valor is NivelDeComplexidade {
  return (Object.values(NivelDeComplexidade) as string[]).includes(valor);
}

/**
 * Ordem dos níveis. Um campo aparece quando o nível do usuário alcança o nível do campo.
 * A ordem mora aqui, e não na ordem de declaração do enum, para que reordenar o enum não
 * mude silenciosamente qual campo é visível para quem.
 */
const ORDEM: Readonly<Record<NivelDeComplexidade, number>> = {
  [NivelDeComplexidade.ESSENCIAL]: 0,
  [NivelDeComplexidade.AVANCADO]: 1,
  [NivelDeComplexidade.ESPECIALISTA]: 2,
};

export function ordemDoNivel(nivel: NivelDeComplexidade): number {
  return ORDEM[nivel];
}

/** `true` quando o nível do usuário alcança (ou passa) o nível exigido pelo campo. */
export function nivelAlcanca(
  nivelDoUsuario: NivelDeComplexidade,
  nivelDoCampo: NivelDeComplexidade,
): boolean {
  return ORDEM[nivelDoUsuario] >= ORDEM[nivelDoCampo];
}
