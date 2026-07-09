/**
 * Tipos de consentimento versionável e revogável (doc 04 §21.1).
 * Nenhum fluxo opt-in do produto (docs 02/03) roda sem checar/criar um destes.
 */
export enum TipoConsentimento {
  VINCULO_GROW_MED = 'VINCULO_GROW_MED',
  INSIGHTS_AGREGADOS = 'INSIGHTS_AGREGADOS',
  COMUNIDADE = 'COMUNIDADE',
  TERMOS_DE_USO = 'TERMOS_DE_USO',
}

export function ehTipoConsentimentoValido(valor: string): valor is TipoConsentimento {
  return (Object.values(TipoConsentimento) as string[]).includes(valor);
}
