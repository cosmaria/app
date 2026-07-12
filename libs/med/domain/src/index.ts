// @cosmaria/med-domain — Domínio do COSMARIA Med (doc 03, doc 08, doc 14).
// Puro: sem framework, sem SDK externo (enforçado pelo eslint, doc 14 §6).
//
// Do Core, importa apenas o SHARED KERNEL (DomainEvent, DomainError, AcessoNegadoError):
// contratos técnicos comuns a todos os bounded contexts. Capacidades de negócio do Core
// (privacidade, premium, mídia, complexidade) chegam sempre pelas interfaces públicas.
// O Med nunca importa o Grow (doc 04 §24, enforçado por lint).

export {
  StatusDoTratamento,
  ehStatusDoTratamentoValido,
  TipoDeProduto,
  ehTipoDeProdutoValido,
  ViaDeAdministracao,
  ehViaDeAdministracaoValida,
  UnidadeDeDose,
  ehUnidadeDeDoseValida,
  TipoDeEfeito,
  ehTipoDeEfeitoValido,
} from './lib/catalogos';

export { Tratamento } from './lib/tratamento.entity';
export type { TratamentoProps } from './lib/tratamento.entity';
export { Produto } from './lib/produto.entity';
export type { ProdutoProps } from './lib/produto.entity';
export { RegistroDeUso } from './lib/registro-uso.entity';
export type { RegistroDeUsoProps } from './lib/registro-uso.entity';
export { SessaoAntesDepois } from './lib/sessao-antes-depois.entity';
export type { SessaoAntesDepoisProps } from './lib/sessao-antes-depois.entity';
export { RegistroDeSintomaDiario } from './lib/sintoma-diario.entity';
export type { RegistroDeSintomaDiarioProps, MedicoesDeBemEstar } from './lib/sintoma-diario.entity';
export { RegistroDeEfeito } from './lib/efeito.entity';
export type { RegistroDeEfeitoProps } from './lib/efeito.entity';
export { ModeloDeTratamento } from './lib/modelos/modelo-de-tratamento.entity';
export type { ModeloDeTratamentoProps } from './lib/modelos/modelo-de-tratamento.entity';

export {
  resumirUso,
  resumirSessoes,
  resumirSintomas,
  resumirEfeitos,
  montarEvolucaoClinica,
} from './lib/evolucao/evolucao';
export type {
  ResumoDeUso,
  ResumoDeSessoes,
  ResumoDeSintomas,
  ResumoDeEfeitos,
  EvolucaoClinica,
  DadosParaEvolucao,
} from './lib/evolucao/evolucao';
export { DISCLAIMER_RELATORIO_CLINICO } from './lib/relatorio/disclaimer';

export {
  TratamentoCriado,
  TratamentoEncerrado,
  ProdutoRegistrado,
  DoseRegistrada,
  SessaoAntesRegistrada,
  SessaoDepoisRegistrada,
  SintomaDiarioRegistrado,
  EfeitoRegistrado,
  RelatorioGerado,
} from './lib/eventos/med.events';

export {
  TratamentoNaoEncontradoError,
  TratamentoEncerradoError,
  TratamentoComProdutosError,
  ProdutoNaoEncontradoError,
  ProdutoComRegistrosError,
  RegistroDeUsoNaoEncontradoError,
  SessaoNaoEncontradaError,
  SessaoJaRegistradaError,
  SessaoDepoisJaRegistradaError,
  SintomaDiarioSemMedicaoError,
  SintomaDiarioNaoEncontradoError,
  EfeitoNaoEncontradoError,
  ModeloDeTratamentoNaoEncontradoError,
  RecursoExclusivoPremiumError,
} from './lib/errors/med.errors';
