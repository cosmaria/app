/**
 * Porta de hashing de senha. Implementada na infraestrutura (bcrypt).
 * A regra de negócio nunca conhece o algoritmo — só o contrato.
 */
export interface PasswordHasher {
  hash(senhaEmClaro: string): Promise<string>;
  comparar(senhaEmClaro: string, hash: string): Promise<boolean>;
}

export const PASSWORD_HASHER = Symbol('PasswordHasher');
