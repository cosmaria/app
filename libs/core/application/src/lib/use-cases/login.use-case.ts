import { CredenciaisInvalidasError, Email, SessaoDeAutenticacao } from '@cosmaria/core-domain';
import { IdGenerator } from '../ports/id-generator.port';
import { PasswordHasher } from '../ports/password-hasher.port';
import { SessaoRepository } from '../ports/sessao.repository';
import { TokenService } from '../ports/token-service.port';
import { UsuarioRepository } from '../ports/usuario.repository';
import { ResultadoAutenticacao } from './resultado-autenticacao';

export interface LoginInput {
  email: string;
  senha: string;
}

/**
 * Autentica por e-mail + senha e emite access token + refresh token,
 * criando uma SessaoDeAutenticacao (doc 04 §10, doc 09 POST /v1/auth/login).
 */
export class LoginUseCase {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly sessoes: SessaoRepository,
    private readonly hasher: PasswordHasher,
    private readonly tokens: TokenService,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(input: LoginInput): Promise<ResultadoAutenticacao> {
    // E-mail inválido não deve revelar nada diferente de "credenciais inválidas".
    let email: Email;
    try {
      email = Email.criar(input.email);
    } catch {
      throw new CredenciaisInvalidasError();
    }

    const usuario = await this.usuarios.buscarPorEmail(email);
    if (!usuario) {
      throw new CredenciaisInvalidasError();
    }

    usuario.garantirQuePodeAutenticar();

    const senhaConfere = await this.hasher.comparar(input.senha, usuario.senhaHash);
    if (!senhaConfere) {
      throw new CredenciaisInvalidasError();
    }

    // Emite a sessão (refresh token) e o access token.
    const sessaoId = this.idGen.gerar();
    const refresh = this.tokens.gerarRefreshToken({ usuarioId: usuario.id, sessaoId });
    const sessao = SessaoDeAutenticacao.criar({
      id: sessaoId,
      usuarioId: usuario.id,
      refreshTokenHash: this.tokens.hashRefreshToken(refresh.token),
      expiraEm: refresh.expiraEm,
    });
    await this.sessoes.salvar(sessao);

    const access = this.tokens.gerarAccessToken({
      usuarioId: usuario.id,
      email: usuario.email.toString(),
      papeis: usuario.papeis,
    });

    return {
      accessToken: access.token,
      refreshToken: refresh.token,
      tokenType: 'Bearer',
      expiresIn: access.expiraEmSegundos,
      usuario: { id: usuario.id, email: usuario.email.toString() },
    };
  }
}
