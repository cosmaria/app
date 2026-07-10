import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  FaseDeVida,
  OrigemDoMaterial,
  TipoDeAmbiente,
  TipoDeGenetica,
} from '@cosmaria/grow-domain';

const FASES = Object.values(FaseDeVida);
const TIPOS_GENETICA = Object.values(TipoDeGenetica);
const TIPOS_AMBIENTE = Object.values(TipoDeAmbiente);
const ORIGENS = Object.values(OrigemDoMaterial);

export class CriarGeneticaDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome!: string;

  @IsIn(TIPOS_GENETICA)
  tipo!: TipoDeGenetica;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  linhagem?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  breeder?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  caracteristicasEsperadas?: string | null;
}

/** Atualização parcial: campo ausente não muda; `null` limpa. */
export class AtualizarGeneticaDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome?: string;

  @IsOptional()
  @IsIn(TIPOS_GENETICA)
  tipo?: TipoDeGenetica;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  linhagem?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  breeder?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  caracteristicasEsperadas?: string | null;
}

export class CriarAmbienteDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome!: string;

  @IsIn(TIPOS_AMBIENTE)
  tipo!: TipoDeAmbiente;

  @IsOptional()
  @IsInt()
  @Min(1)
  larguraCm?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  comprimentoCm?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  alturaCm?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacidadePlantas?: number | null;
}

export class AtualizarAmbienteDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome?: string;

  @IsOptional()
  @IsIn(TIPOS_AMBIENTE)
  tipo?: TipoDeAmbiente;

  @IsOptional()
  @IsInt()
  @Min(1)
  larguraCm?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  comprimentoCm?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  alturaCm?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacidadePlantas?: number | null;
}

export class IniciarCicloDto {
  @IsString()
  @MinLength(1)
  ambienteId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome!: string;

  @IsOptional()
  @IsIn(FASES)
  faseInicial?: FaseDeVida;
}

export class RenomearCicloDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome!: string;
}

/** Corpo de `POST /v1/ciclos/{id}/fase` e `POST /v1/plantas/{id}/fase`. */
export class AvancarFaseDto {
  @IsIn(FASES)
  fase!: FaseDeVida;
}

export class AdicionarPlantaDto {
  @IsString()
  @MinLength(1)
  cicloId!: string;

  @IsString()
  @MinLength(1)
  geneticaId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome!: string;

  @IsIn(ORIGENS)
  origem!: OrigemDoMaterial;

  @IsOptional()
  @IsString()
  plantaMaeId?: string | null;

  @IsOptional()
  @IsIn(FASES)
  faseInicial?: FaseDeVida;

  @IsOptional()
  @IsDateString()
  germinadaEm?: string | null;
}

export class AtualizarPlantaDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome?: string;

  @IsOptional()
  @IsDateString()
  @Type(() => String)
  germinadaEm?: string | null;
}
