import { IsIn, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { CicloDeCobranca } from '@cosmaria/core-domain';

const CICLOS = Object.values(CicloDeCobranca);

/** Corpo de POST /v1/assinatura/upgrade. */
export class IniciarUpgradeDto {
  @IsIn(CICLOS)
  ciclo!: CicloDeCobranca;

  /** ISO-3166-1 alfa-2, normalizado no controller. */
  @IsString()
  @Length(2, 2)
  pais!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  cupomCodigo?: string | null;
}

/** Corpo de POST /v1/assinatura/cupom. */
export class AplicarCupomDto {
  @IsString()
  @Length(1, 40)
  codigo!: string;
}
