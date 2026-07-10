import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/**
 * Corpo de POST /v1/midia (multipart, ao lado do campo `arquivo`).
 *
 * `modulo`/`tipoEntidade`/`entidadeId` formam a referência polimórfica (doc 08 §11).
 * O padrão restringe a identificadores simples: estes valores viram parte de consultas
 * e de nomes lógicos, e não devem aceitar texto arbitrário.
 */
export class RegistrarMidiaDto {
  @IsString()
  @Matches(/^[a-z][a-z0-9_-]{1,31}$/)
  modulo!: string;

  @IsString()
  @Matches(/^[a-z][a-z0-9_-]{1,63}$/)
  tipoEntidade!: string;

  /** Ausente = mídia nasce solta e é anexada depois. */
  @IsOptional()
  @IsString()
  @MaxLength(64)
  entidadeId?: string | null;
}
