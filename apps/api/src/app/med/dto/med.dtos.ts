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
  TipoDeEfeito,
  TipoDeProduto,
  UnidadeDeDose,
  ViaDeAdministracao,
} from '@cosmaria/med-domain';

const TIPOS_DE_PRODUTO = Object.values(TipoDeProduto);
const UNIDADES_DE_DOSE = Object.values(UnidadeDeDose);
const VIAS = Object.values(ViaDeAdministracao);
const TIPOS_DE_EFEITO = Object.values(TipoDeEfeito);

// --- Tratamento (doc 03 §5.1) ---

export class CriarTratamentoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  condicao!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  objetivo?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  medicoResponsavel?: string | null;

  @IsOptional()
  @IsDateString()
  iniciadoEm?: string;
}

/** Atualização parcial: campo ausente não muda; `null` limpa. */
export class AtualizarTratamentoDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  condicao?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  objetivo?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  medicoResponsavel?: string | null;
}

// --- Produto (doc 03 §5.2) ---

export class CriarProdutoDto {
  @IsString()
  @MinLength(1)
  tratamentoId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  nome!: string;

  @IsIn(TIPOS_DE_PRODUTO)
  tipo!: TipoDeProduto;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  concentracaoCbd?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  concentracaoThc?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  fabricante?: string | null;
}

export class AtualizarProdutoDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  nome?: string;

  @IsOptional()
  @IsIn(TIPOS_DE_PRODUTO)
  tipo?: TipoDeProduto;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  concentracaoCbd?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  concentracaoThc?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  fabricante?: string | null;
}

// --- Registro de Uso / Dose (doc 03 §5.2) ---

export class RegistrarUsoDto {
  @IsString()
  @MinLength(1)
  produtoId!: string;

  @IsNumber()
  @Min(0)
  quantidade!: number;

  @IsIn(UNIDADES_DE_DOSE)
  unidade!: UnidadeDeDose;

  @IsIn(VIAS)
  via!: ViaDeAdministracao;

  @IsOptional()
  @IsDateString()
  usadoEm?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacoes?: string | null;
}

// --- Sessão Antes/Depois (doc 03 §5.4) ---

/** Corpo de POST /v1/sessoes — abre a sessão com a medição "antes". */
export class RegistrarSessaoAntesDto {
  @IsString()
  @MinLength(1)
  registroDeUsoId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  sintomaAlvo!: string;

  @IsInt()
  @Min(0)
  @Max(10)
  intensidadeAntes!: number;

  @IsInt()
  @Min(0)
  intervaloMinutos!: number;
}

/** Corpo de PUT /v1/sessoes/{id} — registra o "depois". */
export class RegistrarSessaoDepoisDto {
  @IsInt()
  @Min(0)
  @Max(10)
  intensidadeDepois!: number;
}

// --- Sintomas Diários (doc 03 §5.3) ---

/** Corpo de POST /v1/sintomas-diarios. Todas as dimensões opcionais (ao menos uma). */
export class RegistrarSintomaDiarioDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  humor?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  ansiedade?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  dor?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  sono?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  apetite?: number | null;

  @IsOptional()
  @IsDateString()
  registradoEm?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacoes?: string | null;
}

// --- Efeitos (doc 03 §5.5) ---

/** Corpo de POST /v1/efeitos — efeito positivo/adverso de uma dose. */
export class RegistrarEfeitoDto {
  @IsString()
  @MinLength(1)
  registroDeUsoId!: string;

  @IsIn(TIPOS_DE_EFEITO)
  tipo!: TipoDeEfeito;

  @IsString()
  @MinLength(1)
  @MaxLength(300)
  descricao!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  intensidade?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  duracaoMinutos?: number | null;

  @IsOptional()
  @IsDateString()
  registradoEm?: string;
}

// --- Modelos de Tratamento (doc 03 §10, Premium) ---

/** Corpo de POST /v1/tratamentos/modelos. Todos os padrões são opcionais. */
export class CriarModeloDeTratamentoDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  condicaoPadrao?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  objetivoPadrao?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notas?: string | null;
}
