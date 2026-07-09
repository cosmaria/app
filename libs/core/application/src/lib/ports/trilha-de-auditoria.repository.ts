import type { TrilhaDeAuditoria } from '@cosmaria/core-domain';

export interface TrilhaDeAuditoriaRepository {
  registrar(entrada: TrilhaDeAuditoria): Promise<void>;
  /** Lista as entradas mais recentes (append-only, ordem decrescente por data). */
  listar(limite: number): Promise<TrilhaDeAuditoria[]>;
}

export const TRILHA_DE_AUDITORIA_REPOSITORY = Symbol('TrilhaDeAuditoriaRepository');
