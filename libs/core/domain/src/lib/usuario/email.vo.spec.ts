import { EmailInvalidoError } from '../errors/auth.errors';
import { Email } from './email.vo';

describe('Email (VO)', () => {
  it('normaliza para minúsculas e remove espaços', () => {
    const email = Email.criar('  Maria@Cosmaria.App  ');
    expect(email.toString()).toBe('maria@cosmaria.app');
  });

  it('rejeita formato inválido', () => {
    expect(() => Email.criar('sem-arroba')).toThrow(EmailInvalidoError);
    expect(() => Email.criar('a@b')).toThrow(EmailInvalidoError);
    expect(() => Email.criar('')).toThrow(EmailInvalidoError);
  });

  it('compara por valor', () => {
    expect(Email.criar('a@b.com').equals(Email.criar('A@B.COM'))).toBe(true);
    expect(Email.criar('a@b.com').equals(Email.criar('c@d.com'))).toBe(false);
  });
});
