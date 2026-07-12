/**
 * Catálogos internos do Med (doc 08 §8 — internacionalização de dados).
 *
 * Como no Grow, cada valor é um **código estável**, nunca o texto em português. O rótulo
 * exibido vem de uma tabela de tradução por idioma, na camada de apresentação — renomear
 * "óleo" para "óleo full spectrum" nunca deve exigir migração de dado clínico.
 */

/** Situação de um tratamento (doc 03 §5.1). Encerrado é terminal, mas o histórico permanece. */
export enum StatusDoTratamento {
  ATIVO = 'ATIVO',
  ENCERRADO = 'ENCERRADO',
}

export function ehStatusDoTratamentoValido(valor: string): valor is StatusDoTratamento {
  return (Object.values(StatusDoTratamento) as string[]).includes(valor);
}

/** Forma farmacêutica do produto (doc 03 §5.2). */
export enum TipoDeProduto {
  OLEO = 'OLEO',
  FLOR = 'FLOR',
  COMESTIVEL = 'COMESTIVEL',
  EXTRATO = 'EXTRATO',
  CONCENTRADO = 'CONCENTRADO',
  CAPSULA = 'CAPSULA',
  TOPICO = 'TOPICO',
  OUTRO = 'OUTRO',
}

export function ehTipoDeProdutoValido(valor: string): valor is TipoDeProduto {
  return (Object.values(TipoDeProduto) as string[]).includes(valor);
}

/** Via de administração de uma dose (doc 03 §5.2). */
export enum ViaDeAdministracao {
  ORAL = 'ORAL',
  SUBLINGUAL = 'SUBLINGUAL',
  INALADA = 'INALADA',
  TOPICA = 'TOPICA',
  OUTRA = 'OUTRA',
}

export function ehViaDeAdministracaoValida(valor: string): valor is ViaDeAdministracao {
  return (Object.values(ViaDeAdministracao) as string[]).includes(valor);
}

/**
 * Unidade de dose (doc 03 §5.2). Código estável, não texto livre: a agregação clínica
 * (dose × sintoma) precisa comparar doses, o que exige unidade normalizada. "OUTRA" cobre
 * casos raros sem travar o registro.
 */
export enum UnidadeDeDose {
  MG = 'MG',
  ML = 'ML',
  GOTAS = 'GOTAS',
  GRAMA = 'GRAMA',
  UNIDADE = 'UNIDADE',
  PUFF = 'PUFF',
  OUTRA = 'OUTRA',
}

export function ehUnidadeDeDoseValida(valor: string): valor is UnidadeDeDose {
  return (Object.values(UnidadeDeDose) as string[]).includes(valor);
}

/** Natureza de um efeito registrado (doc 03 §5.5). */
export enum TipoDeEfeito {
  POSITIVO = 'POSITIVO',
  ADVERSO = 'ADVERSO',
}

export function ehTipoDeEfeitoValido(valor: string): valor is TipoDeEfeito {
  return (Object.values(TipoDeEfeito) as string[]).includes(valor);
}
