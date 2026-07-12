import { DomainError } from '@cosmaria/core-domain';

/** Publicação inexistente, ou fora do alcance de visibilidade de quem pergunta. */
export class PublicacaoNaoEncontradaError extends DomainError {
  readonly code = 'PUBLICACAO_NAO_ENCONTRADA';
  constructor() {
    super('Publicação não encontrada.');
  }
}

/** Contexto de aplicativo inválido no parâmetro de feed/busca (ex.: ?contexto=xpto). */
export class ContextoInvalidoError extends DomainError {
  readonly code = 'CONTEXTO_INVALIDO';
  constructor() {
    super('Contexto de aplicativo inválido.');
  }
}

/** Tentativa de seguir a si mesmo, ou de seguir um perfil de outro contexto. */
export class SeguimentoInvalidoError extends DomainError {
  readonly code = 'SEGUIMENTO_INVALIDO';
  constructor() {
    super('Não é possível seguir este perfil.');
  }
}

/** Fork só é possível sobre conteúdo do contexto Grow (doc 06 §7.2). */
export class ConteudoNaoForkavelError extends DomainError {
  readonly code = 'CONTEUDO_NAO_FORKAVEL';
  constructor() {
    super('Este conteúdo não pode ser copiado como modelo.');
  }
}

/** Estatísticas avançadas de perfil são exclusivas do Premium (doc 06 §11, doc 07). */
export class EstatisticasExclusivasPremiumError extends DomainError {
  readonly code = 'ESTATISTICAS_EXCLUSIVAS_PREMIUM';
  constructor() {
    super('As estatísticas avançadas de perfil são exclusivas do plano Premium.');
  }
}
