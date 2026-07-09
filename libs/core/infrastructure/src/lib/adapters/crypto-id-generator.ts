import { randomUUID } from 'node:crypto';
import type { IdGenerator } from '@cosmaria/core-application';

/** Implementação da porta IdGenerator usando o crypto nativo do Node. */
export class CryptoIdGenerator implements IdGenerator {
  gerar(): string {
    return randomUUID();
  }
}
