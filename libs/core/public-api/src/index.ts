// @cosmaria/core-public-api — Interface pública do Core consumida por outros módulos (doc 14 §10).

export {
  AUTENTICACAO_PUBLIC_API,
  type AutenticacaoPublicApi,
  type IdentidadeAutenticada,
} from './lib/autenticacao.public-api';

export {
  PRIVACIDADE_PUBLIC_API,
  type PrivacidadePublicApi,
  type ReferenciaDeConteudo,
  type DefinirCompartilhamentoEntrada,
} from './lib/privacidade.public-api';

export { PERFIL_PUBLIC_API, type PerfilPublicApi } from './lib/perfil.public-api';
