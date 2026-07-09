import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { CanalDeNotificacao, CategoriaDeNotificacao } from '@cosmaria/core-domain';

const CATEGORIAS = Object.values(CategoriaDeNotificacao);
const CANAIS = Object.values(CanalDeNotificacao);

export class CanaisPorCategoriaDto {
  @IsIn(CATEGORIAS)
  categoria!: CategoriaDeNotificacao;

  @IsArray()
  @ArrayUnique()
  @IsIn(CANAIS, { each: true })
  canais!: CanalDeNotificacao[];
}

/** Corpo de PUT /v1/preferencia-notificacao. Campo ausente = não alterar. */
export class AtualizarPreferenciaNotificacaoDto {
  @IsOptional()
  @IsBoolean()
  modoDiscreto?: boolean;

  /** Fuso IANA. Validado de fato pelo domínio/Intl; aqui só limitamos o tamanho. */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  fusoHorario?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1439)
  silencioInicioMinutos?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1439)
  silencioFimMinutos?: number | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CanaisPorCategoriaDto)
  canaisPorCategoria?: CanaisPorCategoriaDto[];
}
