import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  LoginUseCase,
  RefreshTokenUseCase,
  RegistrarUsuarioUseCase,
  type ResultadoAutenticacao,
} from '@cosmaria/core-application';
import type { AutenticacaoResponse, RegistrarResponse } from '@cosmaria/shared-contracts';
import { LoginDto, RefreshDto, RegistrarDto } from './dto/auth.dtos';

/**
 * Endpoints de autenticação (doc 09 — /v1/auth/*).
 * O controller é fino: só traduz HTTP ↔ casos de uso. Nenhuma regra de negócio
 * vive aqui (Clean Architecture, doc 04 §8).
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly registrarUsuario: RegistrarUsuarioUseCase,
    private readonly login: LoginUseCase,
    private readonly refreshToken: RefreshTokenUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegistrarDto): Promise<RegistrarResponse> {
    return this.registrarUsuario.executar({ email: dto.email, senha: dto.senha });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async postLogin(@Body() dto: LoginDto): Promise<AutenticacaoResponse> {
    return this.mapear(await this.login.executar({ email: dto.email, senha: dto.senha }));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async postRefresh(@Body() dto: RefreshDto): Promise<AutenticacaoResponse> {
    return this.mapear(await this.refreshToken.executar({ refreshToken: dto.refreshToken }));
  }

  private mapear(r: ResultadoAutenticacao): AutenticacaoResponse {
    return {
      accessToken: r.accessToken,
      refreshToken: r.refreshToken,
      tokenType: r.tokenType,
      expiresIn: r.expiresIn,
      usuario: r.usuario,
    };
  }
}
