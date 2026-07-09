import {
  ContaInativaError,
  CredenciaisInvalidasError,
  Email,
  EmailJaCadastradoError,
  Papel,
  SessaoDeAutenticacao,
  SessaoInvalidaError,
  StatusConta,
  Usuario,
} from '@cosmaria/core-domain';
import type { IdGenerator } from '../ports/id-generator.port';
import type { PasswordHasher } from '../ports/password-hasher.port';
import type { SessaoRepository } from '../ports/sessao.repository';
import type {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenService,
} from '../ports/token-service.port';
import type { UsuarioRepository } from '../ports/usuario.repository';
import { LoginUseCase } from './login.use-case';
import { RefreshTokenUseCase } from './refresh-token.use-case';
import { RegistrarUsuarioUseCase } from './registrar-usuario.use-case';

// ---- Fakes inline (respeitam as fronteiras: nenhum import de infraestrutura) ----

class FakeUsuarioRepo implements UsuarioRepository {
  private readonly map = new Map<string, Usuario>();
  salvar(u: Usuario): Promise<void> {
    this.map.set(u.id, u);
    return Promise.resolve();
  }
  buscarPorEmail(email: Email): Promise<Usuario | null> {
    for (const u of this.map.values()) if (u.email.equals(email)) return Promise.resolve(u);
    return Promise.resolve(null);
  }
  buscarPorId(id: string): Promise<Usuario | null> {
    return Promise.resolve(this.map.get(id) ?? null);
  }
  async existeComEmail(email: Email): Promise<boolean> {
    return (await this.buscarPorEmail(email)) !== null;
  }
}

class FakeSessaoRepo implements SessaoRepository {
  private readonly map = new Map<string, SessaoDeAutenticacao>();
  salvar(s: SessaoDeAutenticacao): Promise<void> {
    this.map.set(s.id, s);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<SessaoDeAutenticacao | null> {
    return Promise.resolve(this.map.get(id) ?? null);
  }
}

class FakeHasher implements PasswordHasher {
  hash(s: string): Promise<string> {
    return Promise.resolve(`h:${s}`);
  }
  comparar(s: string, hash: string): Promise<boolean> {
    return Promise.resolve(hash === `h:${s}`);
  }
}

class FakeIdGen implements IdGenerator {
  private n = 0;
  gerar(): string {
    return `id-${++this.n}`;
  }
}

class FakeTokenService implements TokenService {
  gerarAccessToken(p: AccessTokenPayload) {
    return { token: `access:${p.usuarioId}:${p.papeis.join(',')}`, expiraEmSegundos: 900 };
  }
  verificarAccessToken(token: string): AccessTokenPayload {
    if (!token.startsWith('access:')) throw new Error('invalido');
    const [, usuarioId, papeis] = token.split(':');
    return {
      usuarioId,
      email: 'x@x.com',
      papeis: (papeis ? papeis.split(',') : []) as Papel[],
    };
  }
  gerarRefreshToken(p: RefreshTokenPayload) {
    return {
      token: `refresh:${p.usuarioId}:${p.sessaoId}`,
      expiraEm: new Date(Date.now() + 3_600_000),
    };
  }
  verificarRefreshToken(token: string) {
    const partes = token.split(':');
    if (partes[0] !== 'refresh') throw new Error('invalido');
    return { usuarioId: partes[1], sessaoId: partes[2] };
  }
  hashRefreshToken(token: string): string {
    return `H(${token})`;
  }
}

function montar() {
  const usuarios = new FakeUsuarioRepo();
  const sessoes = new FakeSessaoRepo();
  const hasher = new FakeHasher();
  const tokens = new FakeTokenService();
  const idGen = new FakeIdGen();
  return {
    usuarios,
    sessoes,
    registrar: new RegistrarUsuarioUseCase(usuarios, hasher, idGen),
    login: new LoginUseCase(usuarios, sessoes, hasher, tokens, idGen),
    refresh: new RefreshTokenUseCase(usuarios, sessoes, tokens, idGen),
  };
}

describe('RegistrarUsuarioUseCase', () => {
  it('registra um novo usuário', async () => {
    const { registrar } = montar();
    const r = await registrar.executar({ email: 'maria@cosmaria.app', senha: 'senha12345' });
    expect(r.usuarioId).toBeTruthy();
    expect(r.email).toBe('maria@cosmaria.app');
  });

  it('rejeita e-mail duplicado', async () => {
    const { registrar } = montar();
    await registrar.executar({ email: 'maria@cosmaria.app', senha: 'senha12345' });
    await expect(
      registrar.executar({ email: 'maria@cosmaria.app', senha: 'outra12345' }),
    ).rejects.toBeInstanceOf(EmailJaCadastradoError);
  });
});

describe('LoginUseCase', () => {
  it('autentica e emite tokens', async () => {
    const { registrar, login } = montar();
    await registrar.executar({ email: 'maria@cosmaria.app', senha: 'senha12345' });
    const r = await login.executar({ email: 'maria@cosmaria.app', senha: 'senha12345' });
    expect(r.tokenType).toBe('Bearer');
    expect(r.accessToken).toContain('access:');
    expect(r.refreshToken).toContain('refresh:');
    expect(r.usuario.email).toBe('maria@cosmaria.app');
  });

  it('rejeita senha incorreta com erro genérico', async () => {
    const { registrar, login } = montar();
    await registrar.executar({ email: 'maria@cosmaria.app', senha: 'senha12345' });
    await expect(
      login.executar({ email: 'maria@cosmaria.app', senha: 'errada' }),
    ).rejects.toBeInstanceOf(CredenciaisInvalidasError);
  });

  it('rejeita e-mail inexistente com o MESMO erro genérico', async () => {
    const { login } = montar();
    await expect(
      login.executar({ email: 'ninguem@cosmaria.app', senha: 'qualquer' }),
    ).rejects.toBeInstanceOf(CredenciaisInvalidasError);
  });

  it('bloqueia conta não ativa', async () => {
    const { usuarios, login } = montar();
    const suspenso = Usuario.reconstituir({
      id: 'u1',
      email: Email.criar('sus@cosmaria.app'),
      senhaHash: 'h:senha12345',
      status: StatusConta.SUSPENSO,
      papeis: [Papel.USUARIO],
      criadoEm: new Date(),
    });
    await usuarios.salvar(suspenso);
    await expect(
      login.executar({ email: 'sus@cosmaria.app', senha: 'senha12345' }),
    ).rejects.toBeInstanceOf(ContaInativaError);
  });
});

describe('RefreshTokenUseCase (rotação)', () => {
  it('rotaciona: emite novos tokens e revoga o refresh token anterior', async () => {
    const { registrar, login, refresh, sessoes } = montar();
    await registrar.executar({ email: 'maria@cosmaria.app', senha: 'senha12345' });
    const primeiro = await login.executar({ email: 'maria@cosmaria.app', senha: 'senha12345' });

    const novo = await refresh.executar({ refreshToken: primeiro.refreshToken });
    expect(novo.refreshToken).not.toBe(primeiro.refreshToken);
    expect(novo.accessToken).toContain('access:');

    // A sessão antiga deve estar revogada (reuso é bloqueado).
    const sessaoAntigaId = primeiro.refreshToken.split(':')[2];
    const sessaoAntiga = await sessoes.buscarPorId(sessaoAntigaId);
    expect(sessaoAntiga?.estaValida()).toBe(false);
  });

  it('rejeita reuso de um refresh token já rotacionado', async () => {
    const { registrar, login, refresh } = montar();
    await registrar.executar({ email: 'maria@cosmaria.app', senha: 'senha12345' });
    const primeiro = await login.executar({ email: 'maria@cosmaria.app', senha: 'senha12345' });

    await refresh.executar({ refreshToken: primeiro.refreshToken });

    await expect(refresh.executar({ refreshToken: primeiro.refreshToken })).rejects.toBeInstanceOf(
      SessaoInvalidaError,
    );
  });

  it('rejeita refresh token inválido', async () => {
    const { refresh } = montar();
    await expect(refresh.executar({ refreshToken: 'lixo' })).rejects.toBeInstanceOf(
      SessaoInvalidaError,
    );
  });
});
