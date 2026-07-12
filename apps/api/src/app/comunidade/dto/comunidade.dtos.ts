import { IsString, MaxLength, MinLength } from 'class-validator';

/** Corpo de `POST /v1/comunidade/publicacoes/{id}/comentarios`. */
export class ComentarDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  texto!: string;
}
