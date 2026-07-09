import { Papel } from '@cosmaria/core-domain';
import { BcryptPasswordHasher } from './bcrypt-password-hasher';
import { JwtTokenService } from './jwt-token-service';

describe('BcryptPasswordHasher', () => {
  const hasher = new BcryptPasswordHasher(4); // rounds baixos = testes rápidos

  it('gera hash diferente da senha e valida corretamente', async () => {
    const hash = await hasher.hash('senhaSegura123');
    expect(hash).not.toBe('senhaSegura123');
    expect(await hasher.comparar('senhaSegura123', hash)).toBe(true);
    expect(await hasher.comparar('senhaErrada', hash)).toBe(false);
  });
});

describe('JwtTokenService', () => {
  const svc = new JwtTokenService({
    accessSecret: 'a-secret',
    refreshSecret: 'r-secret',
    accessTtlSegundos: 900,
    refreshTtlSegundos: 3600,
  });

  it('gera e verifica access token com papéis (ida e volta)', () => {
    const { token, expiraEmSegundos } = svc.gerarAccessToken({
      usuarioId: 'u1',
      email: 'a@b.com',
      papeis: [Papel.USUARIO, Papel.ADMIN],
    });
    expect(expiraEmSegundos).toBe(900);
    const payload = svc.verificarAccessToken(token);
    expect(payload).toEqual({
      usuarioId: 'u1',
      email: 'a@b.com',
      papeis: [Papel.USUARIO, Papel.ADMIN],
    });
  });

  it('gera e verifica refresh token (ida e volta)', () => {
    const { token } = svc.gerarRefreshToken({ usuarioId: 'u1', sessaoId: 's1' });
    const payload = svc.verificarRefreshToken(token);
    expect(payload).toEqual({ usuarioId: 'u1', sessaoId: 's1' });
  });

  it('rejeita token assinado com segredo diferente', () => {
    const { token } = svc.gerarAccessToken({ usuarioId: 'u1', email: 'a@b.com', papeis: [] });
    const outro = new JwtTokenService({
      accessSecret: 'OUTRO',
      refreshSecret: 'r',
      accessTtlSegundos: 900,
      refreshTtlSegundos: 3600,
    });
    expect(() => outro.verificarAccessToken(token)).toThrow();
  });

  it('hashRefreshToken é determinístico', () => {
    expect(svc.hashRefreshToken('abc')).toBe(svc.hashRefreshToken('abc'));
    expect(svc.hashRefreshToken('abc')).not.toBe(svc.hashRefreshToken('xyz'));
  });
});
