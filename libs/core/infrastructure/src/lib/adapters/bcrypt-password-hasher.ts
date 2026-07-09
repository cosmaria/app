import bcrypt from 'bcryptjs';
import type { PasswordHasher } from '@cosmaria/core-application';

/**
 * Implementação da porta PasswordHasher com bcrypt.
 * bcryptjs é JS puro (sem binário nativo) — instala de forma confiável em
 * qualquer ambiente. A troca por outro algoritmo é isolada aqui (doc 13 §16.1).
 */
export class BcryptPasswordHasher implements PasswordHasher {
  constructor(private readonly saltRounds = 12) {}

  hash(senhaEmClaro: string): Promise<string> {
    return bcrypt.hash(senhaEmClaro, this.saltRounds);
  }

  comparar(senhaEmClaro: string, hash: string): Promise<boolean> {
    return bcrypt.compare(senhaEmClaro, hash);
  }
}
