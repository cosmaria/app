/**
 * Regra arquitetural fixa do nome sugerido de um Perfil Público (doc 06 §13,
 * decisão consolidada #2): o identificador sugerido automaticamente **nunca** deriva
 * de dado real do usuário (e-mail, nome, id da Conta) e **nunca** revela informação
 * pessoal — é sempre um identificador neutro.
 *
 * Deriva apenas do id do próprio Perfil Público, que já é um identificador opaco e
 * distinto por contexto: dois perfis da mesma Conta produzem sugestões sem nenhuma
 * relação entre si, então o nome nunca é um canal lateral de vínculo entre contextos.
 *
 * O **texto** definitivo (prefixo, formato) é decisão de conteúdo/UX dos docs 10/11 e
 * precisará de localização por idioma — por isso o prefixo é uma constante isolada,
 * trocável sem tocar em nenhuma outra regra.
 */
const PREFIXO_NEUTRO = 'perfil';
const TAMANHO_SUFIXO = 6;

export const PoliticaDeNomeDePerfil = {
  /** Sugestão neutra e editável, derivada só do id opaco do perfil. */
  sugerir(perfilId: string): string {
    const sufixo = perfilId.replace(/-/g, '').slice(-TAMANHO_SUFIXO).toLowerCase();
    return `${PREFIXO_NEUTRO}-${sufixo}`;
  },
} as const;
