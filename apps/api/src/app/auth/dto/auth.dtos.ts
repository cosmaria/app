import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import type { LoginRequest, RefreshRequest, RegistrarRequest } from '@cosmaria/shared-contracts';

/**
 * DTOs de entrada com validação (class-validator). Implementam os contratos
 * compartilhados de @cosmaria/shared-contracts — a validação vive na camada de
 * apresentação; o contrato de tipo é único e compartilhado com o mobile.
 */

export class RegistrarDto implements RegistrarRequest {
  @IsEmail({}, { message: 'E-mail inválido.' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'A senha deve ter ao menos 8 caracteres.' })
  senha!: string;
}

export class LoginDto implements LoginRequest {
  // No login não usamos @IsEmail de propósito: um formato inválido deve resultar
  // em "credenciais inválidas" genérico, sem revelar que o e-mail é malformado.
  @IsString()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  senha!: string;
}

export class RefreshDto implements RefreshRequest {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}
