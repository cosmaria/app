/**
 * Catálogos internos do Grow (doc 08 §8 — internacionalização de dados).
 *
 * Cada valor é um **código estável**, nunca o texto em português. O texto exibido vem
 * de uma tabela de tradução chaveada pelo código, na camada de apresentação. Renomear o
 * rótulo de uma fase nunca deve exigir migração de dado.
 */

/** Fases de vida de uma planta (doc 02 §5.2). */
export enum FaseDeVida {
  GERMINACAO = 'GERMINACAO',
  VEGETATIVO = 'VEGETATIVO',
  PRE_FLORACAO = 'PRE_FLORACAO',
  FLORACAO = 'FLORACAO',
  COLHEITA = 'COLHEITA',
  SECAGEM = 'SECAGEM',
  CURA = 'CURA',
}

export function ehFaseDeVidaValida(valor: string): valor is FaseDeVida {
  return (Object.values(FaseDeVida) as string[]).includes(valor);
}

/**
 * Ordem natural das fases. Vive numa tabela explícita, e não na ordem de declaração do
 * enum, para que reordenar o enum não mude silenciosamente quais transições são válidas.
 */
const ORDEM_DAS_FASES: readonly FaseDeVida[] = [
  FaseDeVida.GERMINACAO,
  FaseDeVida.VEGETATIVO,
  FaseDeVida.PRE_FLORACAO,
  FaseDeVida.FLORACAO,
  FaseDeVida.COLHEITA,
  FaseDeVida.SECAGEM,
  FaseDeVida.CURA,
];

export function ordemDaFase(fase: FaseDeVida): number {
  return ORDEM_DAS_FASES.indexOf(fase);
}

/**
 * A transição só pode avançar, nunca retroceder.
 *
 * Pular fases é permitido de propósito: uma autoflorescente vai de vegetativo direto à
 * floração sem pré-floração, e um cultivador pode não registrar a pré-floração. Bloquear
 * o pulo obrigaria o usuário a inventar um registro que não aconteceu.
 *
 * Retroceder, ao contrário, corromperia as métricas de duração de fase (doc 02 §5.12),
 * que são calculadas a partir dessas transições datadas.
 */
export function transicaoDeFasePermitida(atual: FaseDeVida, proxima: FaseDeVida): boolean {
  return ordemDaFase(proxima) > ordemDaFase(atual);
}

/** Tipo de genética (doc 02 §5.1). */
export enum TipoDeGenetica {
  FOTOPERIODICA = 'FOTOPERIODICA',
  AUTOFLORESCENTE = 'AUTOFLORESCENTE',
}

export function ehTipoDeGeneticaValido(valor: string): valor is TipoDeGenetica {
  return (Object.values(TipoDeGenetica) as string[]).includes(valor);
}

/** Tipo de ambiente. Os três são suportados desde a v1 (doc 02 §5.3). */
export enum TipoDeAmbiente {
  INDOOR = 'INDOOR',
  OUTDOOR = 'OUTDOOR',
  ESTUFA = 'ESTUFA',
}

export function ehTipoDeAmbienteValido(valor: string): valor is TipoDeAmbiente {
  return (Object.values(TipoDeAmbiente) as string[]).includes(valor);
}

/** Origem do material vegetal de uma planta (doc 02 §5.1). */
export enum OrigemDoMaterial {
  SEMENTE = 'SEMENTE',
  CLONE = 'CLONE',
  PLANTA_MAE = 'PLANTA_MAE',
}

export function ehOrigemDoMaterialValida(valor: string): valor is OrigemDoMaterial {
  return (Object.values(OrigemDoMaterial) as string[]).includes(valor);
}
