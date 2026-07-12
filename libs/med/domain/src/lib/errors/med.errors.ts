import { DomainError } from '@cosmaria/core-domain';

/**
 * Erros de domínio do Med.
 *
 * Estendem o `DomainError` do Core — shared kernel (DDD): um contrato técnico comum a
 * todos os bounded contexts, não uma entidade do Core. O Med nunca importa entidade nem
 * caso de uso do Core: capacidades do Core chegam sempre pelas interfaces públicas
 * (doc 14 §6/§10).
 */

// --- Núcleo: Tratamento, Produto, Registro de Uso (doc 03 §5.1-5.3) ---

/** Tratamento inexistente — ou de outro usuário; nunca revelamos qual dos dois. */
export class TratamentoNaoEncontradoError extends DomainError {
  readonly code = 'TRATAMENTO_NAO_ENCONTRADO';
  constructor() {
    super('Tratamento não encontrado.');
  }
}

/** Nenhuma escrita nova é aceita num tratamento encerrado — a fase ativa terminou. */
export class TratamentoEncerradoError extends DomainError {
  readonly code = 'TRATAMENTO_ENCERRADO';
  constructor() {
    super('Este tratamento já foi encerrado.');
  }
}

/**
 * O tratamento ainda tem produtos registrados: excluí-lo apagaria o histórico clínico.
 * Encerrar é o caminho para "parar" um tratamento sem perder o registro (doc 03 §5.1).
 */
export class TratamentoComProdutosError extends DomainError {
  readonly code = 'TRATAMENTO_COM_PRODUTOS';
  constructor() {
    super('Este tratamento possui produtos registrados e não pode ser excluído.');
  }
}

export class ProdutoNaoEncontradoError extends DomainError {
  readonly code = 'PRODUTO_NAO_ENCONTRADO';
  constructor() {
    super('Produto não encontrado.');
  }
}

/** O produto já tem doses registradas: apagá-lo desconectaria a série clínica. */
export class ProdutoComRegistrosError extends DomainError {
  readonly code = 'PRODUTO_COM_REGISTROS';
  constructor() {
    super('Este produto possui doses registradas e não pode ser excluído.');
  }
}

export class RegistroDeUsoNaoEncontradoError extends DomainError {
  readonly code = 'REGISTRO_DE_USO_NAO_ENCONTRADO';
  constructor() {
    super('Registro de uso não encontrado.');
  }
}

// --- Sessão Antes/Depois (doc 03 §5.4) ---

export class SessaoNaoEncontradaError extends DomainError {
  readonly code = 'SESSAO_NAO_ENCONTRADA';
  constructor() {
    super('Sessão antes/depois não encontrada.');
  }
}

/** 0—1: uma dose tem no máximo uma sessão antes/depois. */
export class SessaoJaRegistradaError extends DomainError {
  readonly code = 'SESSAO_JA_REGISTRADA';
  constructor() {
    super('Esta dose já possui uma sessão antes/depois registrada.');
  }
}

/** O "depois" é monotônico: registra-se uma única vez. */
export class SessaoDepoisJaRegistradaError extends DomainError {
  readonly code = 'SESSAO_DEPOIS_JA_REGISTRADA';
  constructor() {
    super('O registro "depois" desta sessão já foi feito.');
  }
}

// --- Sintomas Diários / Efeitos (doc 03 §5.3, §5.5) ---

/** Um check-in de linha de base sem nenhuma dimensão é ruído, não registro. */
export class SintomaDiarioSemMedicaoError extends DomainError {
  readonly code = 'SINTOMA_DIARIO_SEM_MEDICAO';
  constructor() {
    super('Informe ao menos uma dimensão (humor, ansiedade, dor, sono ou apetite).');
  }
}

export class SintomaDiarioNaoEncontradoError extends DomainError {
  readonly code = 'SINTOMA_DIARIO_NAO_ENCONTRADO';
  constructor() {
    super('Registro de sintoma diário não encontrado.');
  }
}

export class EfeitoNaoEncontradoError extends DomainError {
  readonly code = 'EFEITO_NAO_ENCONTRADO';
  constructor() {
    super('Efeito não encontrado.');
  }
}

// --- Modelos de Tratamento (doc 03 §10, Premium) ---

/** Modelo de tratamento inexistente — ou de outro usuário. */
export class ModeloDeTratamentoNaoEncontradoError extends DomainError {
  readonly code = 'MODELO_DE_TRATAMENTO_NAO_ENCONTRADO';
  constructor() {
    super('Modelo de tratamento não encontrado.');
  }
}

/**
 * Recurso exclusivo do Premium (doc 07 §8). Dispara o paywall no cliente (HTTP 402). O
 * acesso ao que já existe nunca é limitado — só a criação de novos modelos é gated.
 */
export class RecursoExclusivoPremiumError extends DomainError {
  readonly code = 'RECURSO_EXCLUSIVO_PREMIUM';
  constructor(recurso: string) {
    super(`"${recurso}" é um recurso exclusivo do Premium.`);
  }
}

/** Lote informado no vínculo não existe (ou não pertence ao usuário) no Grow — 404. */
export class LoteNaoEncontradoParaVinculoError extends DomainError {
  readonly code = 'LOTE_NAO_ENCONTRADO_PARA_VINCULO';
  constructor() {
    super('Lote não encontrado para vincular.');
  }
}
