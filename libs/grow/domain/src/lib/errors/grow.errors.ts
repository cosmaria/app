import { DomainError } from '@cosmaria/core-domain';

/**
 * Erros de domínio do Grow.
 *
 * Estendem o `DomainError` do Core — que, junto com `DomainEvent`, é **shared kernel**
 * (DDD): um contrato técnico comum a todos os bounded contexts, não uma entidade do
 * Core. O Grow nunca importa entidade nem caso de uso do Core: capacidades do Core
 * chegam sempre pelas interfaces públicas (doc 14 §6/§10).
 */

/** Genética inexistente — ou de outro usuário; nunca revelamos qual dos dois. */
export class GeneticaNaoEncontradaError extends DomainError {
  readonly code = 'GENETICA_NAO_ENCONTRADA';
  constructor() {
    super('Genética não encontrada.');
  }
}

export class AmbienteNaoEncontradoError extends DomainError {
  readonly code = 'AMBIENTE_NAO_ENCONTRADO';
  constructor() {
    super('Ambiente não encontrado.');
  }
}

export class CicloNaoEncontradoError extends DomainError {
  readonly code = 'CICLO_NAO_ENCONTRADO';
  constructor() {
    super('Ciclo de cultivo não encontrado.');
  }
}

export class PlantaNaoEncontradaError extends DomainError {
  readonly code = 'PLANTA_NAO_ENCONTRADA';
  constructor() {
    super('Planta não encontrada.');
  }
}

/** Nenhuma escrita é aceita num ciclo já encerrado — o histórico é imutável. */
export class CicloEncerradoError extends DomainError {
  readonly code = 'CICLO_ENCERRADO';
  constructor() {
    super('Este ciclo de cultivo já foi encerrado.');
  }
}

/**
 * Retroceder de fase corromperia as métricas de duração de fase (doc 02 §5.12), que são
 * calculadas a partir das transições datadas. Avançar pulando fases é permitido.
 */
export class TransicaoDeFaseInvalidaError extends DomainError {
  readonly code = 'TRANSICAO_DE_FASE_INVALIDA';
  constructor(
    readonly faseAtual: string,
    readonly faseSolicitada: string,
  ) {
    super(`Não é possível voltar de "${faseAtual}" para "${faseSolicitada}".`);
  }
}

/** O ambiente ainda hospeda ciclos: excluí-lo apagaria o histórico do próprio espaço. */
export class AmbienteComCiclosError extends DomainError {
  readonly code = 'AMBIENTE_COM_CICLOS';
  constructor() {
    super('Este ambiente possui ciclos registrados e não pode ser excluído.');
  }
}

/** Evento de manejo/sanidade inexistente — ou de outro usuário. */
export class EventoDeCultivoNaoEncontradoError extends DomainError {
  readonly code = 'EVENTO_DE_CULTIVO_NAO_ENCONTRADO';
  constructor() {
    super('Evento de cultivo não encontrado.');
  }
}

/** Um check-in sem nenhuma medição não é um registro — é ruído na série temporal. */
export class RegistroSemMedicaoError extends DomainError {
  readonly code = 'REGISTRO_SEM_MEDICAO';
  constructor() {
    super('Informe ao menos uma medição para registrar o check-in.');
  }
}

/** A genética ainda origina plantas: excluí-la quebraria a comparação entre cultivos. */
export class GeneticaEmUsoError extends DomainError {
  readonly code = 'GENETICA_EM_USO';
  constructor() {
    super('Esta genética está em uso por plantas registradas e não pode ser excluída.');
  }
}

// --- Pós-colheita: Colheita, Secagem, Cura, Lote (doc 02 §5.11) ---

/** Uma colheita sem plantas seria um registro sobre o nada. */
export class ColheitaSemPlantasError extends DomainError {
  readonly code = 'COLHEITA_SEM_PLANTAS';
  constructor() {
    super('Informe ao menos uma planta para registrar a colheita.');
  }
}

export class ColheitaNaoEncontradaError extends DomainError {
  readonly code = 'COLHEITA_NAO_ENCONTRADA';
  constructor() {
    super('Colheita não encontrada.');
  }
}

export class SecagemNaoEncontradaError extends DomainError {
  readonly code = 'SECAGEM_NAO_ENCONTRADA';
  constructor() {
    super('Secagem não encontrada.');
  }
}

export class CuraNaoEncontradaError extends DomainError {
  readonly code = 'CURA_NAO_ENCONTRADA';
  constructor() {
    super('Cura não encontrada.');
  }
}

export class LoteNaoEncontradoError extends DomainError {
  readonly code = 'LOTE_NAO_ENCONTRADO';
  constructor() {
    super('Lote não encontrado.');
  }
}

/** Cada etapa é 1—1 com a anterior: a colheita seca uma única vez. */
export class SecagemJaRegistradaError extends DomainError {
  readonly code = 'SECAGEM_JA_REGISTRADA';
  constructor() {
    super('Esta colheita já possui uma secagem registrada.');
  }
}

export class CuraJaRegistradaError extends DomainError {
  readonly code = 'CURA_JA_REGISTRADA';
  constructor() {
    super('Esta secagem já possui uma cura registrada.');
  }
}

export class LoteJaGeradoError extends DomainError {
  readonly code = 'LOTE_JA_GERADO';
  constructor() {
    super('Esta cura já gerou um lote.');
  }
}
