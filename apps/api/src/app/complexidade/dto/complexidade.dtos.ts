import { ArrayUnique, IsArray, IsIn, IsOptional, IsString, Matches } from 'class-validator';
import { NivelDeComplexidade } from '@cosmaria/core-domain';

const NIVEIS = Object.values(NivelDeComplexidade);

/**
 * Corpo de PUT /v1/preferencia-complexidade.
 *
 * Códigos de campo seguem o padrão `modulo.campo` (ex.: `grow.ec`, `med.concentracao`):
 * são identificadores declarados por Grow/Med, nunca texto livre do usuário.
 */
export class AtualizarPreferenciaComplexidadeDto {
  @IsOptional()
  @IsIn(NIVEIS)
  nivel?: NivelDeComplexidade;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(/^[a-z][a-z0-9_-]{1,31}\.[a-z][a-z0-9_-]{1,63}$/, { each: true })
  habilitarCampos?: string[];

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(/^[a-z][a-z0-9_-]{1,31}\.[a-z][a-z0-9_-]{1,63}$/, { each: true })
  desabilitarCampos?: string[];
}
