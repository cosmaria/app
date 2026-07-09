/**
 * Contexto de aplicativo da COSMARIA (doc 06 §4). Uma Conta tem, no máximo, um
 * `PerfilPublico` por contexto — e os perfis são identidades sociais totalmente
 * independentes entre si.
 *
 * Adicionar um novo contexto (ex.: um futuro app da COSMARIA) é só acrescentar um
 * valor aqui: nenhum modelo de dado muda (doc 06 §14).
 */
export enum ContextoDeApp {
  GROW = 'GROW',
  MED = 'MED',
}

export function ehContextoDeAppValido(valor: string): valor is ContextoDeApp {
  return (Object.values(ContextoDeApp) as string[]).includes(valor);
}
