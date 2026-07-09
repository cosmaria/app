import { SessaoDeAutenticacao, SessaoInvalidaError } from '@cosmaria/core-domain';
import { IdGenerator } from '../ports/id-generator.port';
import { SessaoRepository } from '../ports/sessao.repository';
import { TokenService } from '../ports/token-service.port';
import { UsuarioRepository } from '../ports/usuario.repository';
import { ResultadoAutenticacao } from './resultado-autenticacao';

export interface RefreshTokenInput {
  refreshToken: string;
}

/**
 * Rotação de refresh token (doc 09 POST /v1/auth/refresh).
 * Valida o refresh token, REVOGA a sessão atual e emite uma nova sessão +
 * novos tokens. A rotação garante que um refresh token só pode ser usado uma vez.
 */
export class RefreshTokenUseCase {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly sessoes: SessaoRepository,
    private readonly tokens: TokenService,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(input: RefreshTokenInput): Promise<ResultadoAutenticacao> {
    // 1) Assinatura/expiração do token
    let payload: { usuarioId: string; sessaoId: string };
    try {
      payload = this.tokens.verificarRefreshToken(input.refreshToken);
    } catch {
      throw new SessaoInvalidaError();
    }

    // 2) A sessão existe, está válida e o hash bate (detecta reuso/adulteração)
    const sessao = await this.sessoes.buscarPorId(payload.sessaoId);
    if (
      !sessao ||
      !sessao.estaValida() ||
      sessao.refreshTokenHash !== this.tokens.hashRefreshToken(input.refreshToken)
    ) {
      throw new SessaoInvalidaError();
    }

    // 3) A conta ainda pode autenticar
    const usuario = await this.usuarios.buscarPorId(payload.usuarioId);
    if (!usuario) {
      throw new SessaoInvalidaError();
    }
    usuario.garantirQuePodeAutenticar();

    // 4) Rotação: revoga a sessão atual e cria uma nova
    sessao.revogar();
    await this.sessoes.salvar(sessao);

    const novaSessaoId = this.idGen.gerar();
    const novoRefresh = this.tokens.gerarRefreshToken({
      usuarioId: usuario.id,
      sessaoId: novaSessaoId,
    });
    const novaSessao = SessaoDeAutenticacao.criar({
      id: novaSessaoId,
      usuarioId: usuario.id,
      refreshTokenHash: this.tokens.hashRefreshToken(novoRefresh.token),
      expiraEm: novoRefresh.expiraEm,
    });
    await this.sessoes.salvar(novaSessao);

    const access = this.tokens.gerarAccessToken({
      usuarioId: usuario.id,
      email: usuario.email.toString(),
      papeis: usuario.papeis,
    });

    return {
      accessToken: access.token,
      refreshToken: novoRefresh.token,
      tokenType: 'Bearer',
      expiresIn: access.expiraEmSegundos,
      usuario: { id: usuario.id, email: usuario.email.toString() },
    };
  }
}
