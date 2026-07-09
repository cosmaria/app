import { EmailInvalidoError } from '../errors/auth.errors';

/**
 * Value Object de E-mail (doc 08 — atributo de credencial do Usuário).
 * Normaliza para minúsculas e valida o formato na criação — um Email inválido
 * simplesmente não pode existir no domínio.
 */
export class Email {
  private static readonly PADRAO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  private constructor(private readonly valor: string) {}

  static criar(valor: string): Email {
    const normalizado = valor.trim().toLowerCase();
    if (!Email.PADRAO.test(normalizado)) {
      throw new EmailInvalidoError(valor);
    }
    return new Email(normalizado);
  }

  toString(): string {
    return this.valor;
  }

  equals(outro: Email): boolean {
    return this.valor === outro.valor;
  }
}
