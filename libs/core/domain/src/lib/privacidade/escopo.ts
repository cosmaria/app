/**
 * Escopo de visibilidade de uma dimensão de conteúdo (Motor de Privacidade,
 * doc 04 §12 / doc 02 §9.1). Todo conteúdo nasce PRIVADO; cada dimensão pode ter
 * seu próprio escopo.
 *
 * Escopo do MVP: PRIVADO, SEGUIDORES, PUBLICO. AMIGOS (doc 02 §18 = Pesquisa) e
 * LINK (doc 02 §18 = Versão 2) já são modelados aqui — o motor os avalia
 * corretamente — mas só serão expostos na UI quando promovidos de escopo.
 */
export enum Escopo {
  PRIVADO = 'PRIVADO',
  AMIGOS = 'AMIGOS',
  SEGUIDORES = 'SEGUIDORES',
  LINK = 'LINK',
  PUBLICO = 'PUBLICO',
}

export function ehEscopoValido(valor: string): valor is Escopo {
  return (Object.values(Escopo) as string[]).includes(valor);
}
