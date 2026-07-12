// @cosmaria/comunidade-domain — núcleo social do Core (doc 06). Ver docs/14-estrutura-do-codigo.md

export {
  PublicacaoComunidade,
  type PublicacaoComunidadeProps,
  type ReferenciaDeConteudo,
} from './lib/publicacao/publicacao-comunidade.entity';
export {
  Seguimento,
  type SeguimentoProps,
  Curtida,
  type CurtidaProps,
  Comentario,
  type ComentarioProps,
} from './lib/interacao/interacoes';
export { RegistroDeFork, type RegistroDeForkProps } from './lib/fork/registro-de-fork.entity';
export {
  calcularReputacao,
  PESOS_REPUTACAO,
  type ReputacaoDoPerfil,
  type SinaisDeReputacao,
} from './lib/reputacao/reputacao';
export {
  PerfilSeguido,
  PublicacaoCurtida,
  PublicacaoComentada,
  GrowlogForkRealizado,
} from './lib/eventos/comunidade.events';
export {
  PublicacaoNaoEncontradaError,
  ContextoInvalidoError,
  SeguimentoInvalidoError,
  ConteudoNaoForkavelError,
  EstatisticasExclusivasPremiumError,
} from './lib/errors/comunidade.errors';
