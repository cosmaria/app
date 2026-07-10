import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  FaseDeVida,
  OrigemDoMaterial,
  OrigemDoRegistro,
  TipoDeAmbiente,
  TipoDeGenetica,
} from '@cosmaria/grow-domain';

const FASES = Object.values(FaseDeVida);
const ORIGENS_DO_REGISTRO = Object.values(OrigemDoRegistro);
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

/**
 * Corpo de POST /v1/registros-ambientais — o "check-in diário único" (doc 02 §4).
 *
 * Todos os campos de medição são opcionais: o iniciante envia temperatura e umidade, e
 * já recebe o VPD calculado. A escrita NÃO é filtrada por nível de complexidade — recusar
 * um EC enviado por um usuário "essencial" seria hostil, e quebraria integrações futuras
 * de sensor, que não têm nível.
 */
export class RegistrarCheckInDto {
  @IsString()
  @MinLength(1)
  cicloId!: string;

  /** Ausente = medição do ambiente; presente = medição específica daquela planta. */
  @IsOptional()
  @IsString()
  plantaId?: string | null;

  @IsOptional()
  @IsDateString()
  registradoEm?: string;

  @IsOptional()
  @IsIn(ORIGENS_DO_REGISTRO)
  origem?: OrigemDoRegistro;

  @IsOptional()
  @IsNumber()
  @Min(-50)
  @Max(80)
  temperaturaC?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  umidadeRelativa?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(14)
  ph?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ec?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  ppfd?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(24)
  horasDeLuz?: number | null;

  /** Quanto a folha está mais fria que o ar. Sem isso, calculamos o VPD do ar. */
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(15)
  deltaFolhaC?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacoes?: string | null;
}
