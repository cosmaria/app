import { Module, type Provider } from '@nestjs/common';
import type { Pool } from 'pg';
import {
  ID_GENERATOR,
  LoginUseCase,
  PASSWORD_HASHER,
  RefreshTokenUseCase,
  RegistrarUsuarioUseCase,
  SESSAO_REPOSITORY,
  TOKEN_SERVICE,
  USUARIO_REPOSITORY,
  ValidarAccessTokenUseCase,
  type IdGenerator,
  type PasswordHasher,
  type SessaoRepository,
  type TokenService,
  type UsuarioRepository,
} from '@cosmaria/core-application';
import { AUTENTICACAO_PUBLIC_API, type AutenticacaoPublicApi } from '@cosmaria/core-public-api';
import {
  BcryptPasswordHasher,
  CryptoIdGenerator,
  InMemorySessaoRepository,
  InMemoryUsuarioRepository,
  JwtTokenService,
  PostgresSessaoRepository,
  PostgresUsuarioRepository,
} from '@cosmaria/core-infrastructure';
import { AuthController } from './auth.controller';
import { jwtConfigFromEnv } from './auth.config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PG_POOL } from '../infra/infra.tokens';

/**
 * Composition root da autenticação (doc 14 §10): liga as PORTAS da aplicação às
 * IMPLEMENTAÇÕES da infraestrutura. É o único lugar que conhece ambas as
 * camadas — os casos de uso permanecem agnósticos de framework e de banco.
 *
 * O pool Postgres (PG_POOL) é provido pelo PersistenceModule (global), não mais
 * criado aqui — assim Auth e Health compartilham a mesma conexão.
 */
const infraProviders: Provider[] = [
  { provide: ID_GENERATOR, useClass: CryptoIdGenerator },
  { provide: PASSWORD_HASHER, useFactory: (): PasswordHasher => new BcryptPasswordHasher(12) },
  {
    provide: TOKEN_SERVICE,
    useFactory: (): TokenService => new JwtTokenService(jwtConfigFromEnv()),
  },
  {
    provide: USUARIO_REPOSITORY,
    useFactory: (pool: Pool | null): UsuarioRepository =>
      pool ? new PostgresUsuarioRepository(pool) : new InMemoryUsuarioRepository(),
    inject: [PG_POOL],
  },
  {
    provide: SESSAO_REPOSITORY,
    useFactory: (pool: Pool | null): SessaoRepository =>
      pool ? new PostgresSessaoRepository(pool) : new InMemorySessaoRepository(),
    inject: [PG_POOL],
  },
];

const useCaseProviders: Provider[] = [
  {
    provide: RegistrarUsuarioUseCase,
    useFactory: (repo: UsuarioRepository, hasher: PasswordHasher, idGen: IdGenerator) =>
      new RegistrarUsuarioUseCase(repo, hasher, idGen),
    inject: [USUARIO_REPOSITORY, PASSWORD_HASHER, ID_GENERATOR],
  },
  {
    provide: LoginUseCase,
    useFactory: (
      repo: UsuarioRepository,
      sessoes: SessaoRepository,
      hasher: PasswordHasher,
      tokens: TokenService,
      idGen: IdGenerator,
    ) => new LoginUseCase(repo, sessoes, hasher, tokens, idGen),
    inject: [USUARIO_REPOSITORY, SESSAO_REPOSITORY, PASSWORD_HASHER, TOKEN_SERVICE, ID_GENERATOR],
  },
  {
    provide: RefreshTokenUseCase,
    useFactory: (
      repo: UsuarioRepository,
      sessoes: SessaoRepository,
      tokens: TokenService,
      idGen: IdGenerator,
    ) => new RefreshTokenUseCase(repo, sessoes, tokens, idGen),
    inject: [USUARIO_REPOSITORY, SESSAO_REPOSITORY, TOKEN_SERVICE, ID_GENERATOR],
  },
  {
    provide: ValidarAccessTokenUseCase,
    useFactory: (tokens: TokenService) => new ValidarAccessTokenUseCase(tokens),
    inject: [TOKEN_SERVICE],
  },
];

const publicApiProvider: Provider = {
  provide: AUTENTICACAO_PUBLIC_API,
  useFactory: (validar: ValidarAccessTokenUseCase): AutenticacaoPublicApi => ({
    validar: (accessToken: string) => validar.executar(accessToken),
  }),
  inject: [ValidarAccessTokenUseCase],
};

@Module({
  controllers: [AuthController],
  providers: [...infraProviders, ...useCaseProviders, publicApiProvider, JwtAuthGuard],
  // Exporta o que os módulos Grow/Med/Core consumirão em sprints futuras.
  // USUARIO_REPOSITORY é exportado para que o Core (ex.: LGPD) compartilhe a MESMA
  // instância do repositório de contas, em vez de criar uma paralela.
  exports: [AUTENTICACAO_PUBLIC_API, JwtAuthGuard, USUARIO_REPOSITORY],
})
export class AuthModule {}
