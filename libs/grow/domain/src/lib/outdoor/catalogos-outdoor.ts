/**
 * Catálogos do Módulo Outdoor (doc 02 §6, doc 08 §8). Código estável, nunca texto.
 */

/**
 * Origem dos dados climáticos. O MVP registra só **manual** (doc 02/doc 12 — "Outdoor
 * manual"); `PROVEDOR_EXTERNO` fica **modelado mas inativo** — a integração de API
 * climática é Versão 2 (doc 02 §16), entregue por um adaptador desacoplado que ainda não
 * existe. Reservar o código aqui deixa o dado pronto sem acoplar a nada.
 */
export enum FonteDeDadosClimaticos {
  MANUAL = 'MANUAL',
  PROVEDOR_EXTERNO = 'PROVEDOR_EXTERNO',
}

export function ehFonteDeDadosClimaticosValida(valor: string): valor is FonteDeDadosClimaticos {
  return (Object.values(FonteDeDadosClimaticos) as string[]).includes(valor);
}
