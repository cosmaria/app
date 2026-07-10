import { DomainError } from './auth.errors';

/** Mídia inexistente — ou de outro usuário; nunca revelamos qual dos dois. */
export class MidiaNaoEncontradaError extends DomainError {
  readonly code = 'MIDIA_NAO_ENCONTRADA';
  constructor() {
    super('Mídia não encontrada.');
  }
}

/**
 * MIME fora da lista fechada de tipos aceitos.
 * Falha fechada: aceitar `image/*` genérico permitiria subir conteúdo executável
 * travestido de imagem.
 */
export class TipoDeMidiaNaoSuportadoError extends DomainError {
  readonly code = 'TIPO_DE_MIDIA_NAO_SUPORTADO';
  constructor(tipoConteudo: string) {
    super(`Tipo de arquivo não suportado: "${tipoConteudo}".`);
  }
}

/** Arquivo maior que o permitido pelo plano vigente (doc 07 §8 — categoria Armazenamento). */
export class MidiaAcimaDoLimiteError extends DomainError {
  readonly code = 'MIDIA_ACIMA_DO_LIMITE';
  constructor(
    readonly tamanhoBytes: number,
    readonly limiteBytes: number,
  ) {
    super(`Arquivo de ${tamanhoBytes} bytes excede o limite de ${limiteBytes} bytes do seu plano.`);
  }
}
