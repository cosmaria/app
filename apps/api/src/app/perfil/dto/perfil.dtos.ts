import { ArrayMinSize, IsArray, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ContextoDeApp } from '@cosmaria/core-domain';

const CONTEXTOS = Object.values(ContextoDeApp);

/**
 * Corpo de PUT /v1/comunidade/perfis/{contexto}.
 * Campo ausente = não alterar. `null` explícito = limpar o campo (voltar ao anonimato,
 * doc 06 §7.3) — por isso `@IsOptional()`, que aceita tanto `null` quanto ausência,
 * e o caso de uso distingue os dois.
 */
export class AtualizarPerfilDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  nomeExibicao?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  avatarUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  biografia?: string | null;
}

/** Corpo de POST /v1/comunidade/vinculo-perfis (Versão 2, atrás de feature flag). */
export class AutorizarVinculoPerfisDto {
  @IsArray()
  @ArrayMinSize(2)
  @IsString({ each: true })
  perfilIds!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsIn(CONTEXTOS, { each: true })
  visivelEm!: ContextoDeApp[];
}
