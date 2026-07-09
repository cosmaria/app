import { IsIn, IsString, MinLength } from 'class-validator';
import { TipoConsentimento } from '@cosmaria/core-domain';

const TIPOS = Object.values(TipoConsentimento);

/** Corpo de POST /v1/consentimento. */
export class RegistrarConsentimentoDto {
  @IsIn(TIPOS)
  tipo!: TipoConsentimento;

  @IsString()
  @MinLength(1)
  versaoTexto!: string;
}
