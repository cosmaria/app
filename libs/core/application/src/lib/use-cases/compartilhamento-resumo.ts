import type { Escopo } from '@cosmaria/core-domain';

/** Resumo de uma ConfiguraçãoDeCompartilhamento (retorno dos casos de uso de privacidade). */
export interface CompartilhamentoResumo {
  id: string;
  modulo: string;
  tipoConteudo: string;
  conteudoId: string;
  escopoPadrao: Escopo;
  dimensoes: { codigo: string; escopo: Escopo }[];
}
