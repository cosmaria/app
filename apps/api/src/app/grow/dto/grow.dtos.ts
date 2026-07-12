import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Escopo } from '@cosmaria/core-domain';
import {
  FaseDeVida,
  OrigemDoMaterial,
  OrigemDoRegistro,
  Severidade,
  TipoDeAmbiente,
  TipoDeGenetica,
  TipoDeManejo,
  TipoDeSanidade,
  TipoDeTarefa,
} from '@cosmaria/grow-domain';

/** Escopos expostos na UI do MVP (doc 02 §18): AMIGOS=Pesquisa, LINK=V2 ficam de fora. */
const ESCOPOS_MVP = [Escopo.PRIVADO, Escopo.SEGUIDORES, Escopo.PUBLICO];

const FASES = Object.values(FaseDeVida);
const ORIGENS_DO_REGISTRO = Object.values(OrigemDoRegistro);
const TIPOS_GENETICA = Object.values(TipoDeGenetica);
const TIPOS_AMBIENTE = Object.values(TipoDeAmbiente);
const ORIGENS = Object.values(OrigemDoMaterial);
const TIPOS_DE_MANEJO = Object.values(TipoDeManejo);
const TIPOS_DE_SANIDADE = Object.values(TipoDeSanidade);
const SEVERIDADES = Object.values(Severidade);
const TIPOS_DE_TAREFA = Object.values(TipoDeTarefa);

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

/** Corpo de POST /v1/eventos-manejo (doc 02 §5.7). */
export class RegistrarManejoDto {
  @IsString()
  @MinLength(1)
  cicloId!: string;

  @IsOptional()
  @IsString()
  plantaId?: string | null;

  @IsIn(TIPOS_DE_MANEJO)
  tipo!: TipoDeManejo;

  @IsOptional()
  @IsDateString()
  ocorridoEm?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacoes?: string | null;
}

/** Corpo de POST /v1/eventos-sanidade (doc 02 §5.8). */
export class RegistrarSanidadeDto {
  @IsString()
  @MinLength(1)
  cicloId!: string;

  @IsOptional()
  @IsString()
  plantaId?: string | null;

  @IsIn(TIPOS_DE_SANIDADE)
  tipo!: TipoDeSanidade;

  @IsIn(SEVERIDADES)
  severidade!: Severidade;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descricao?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  tratamentoAplicado?: string | null;

  @IsOptional()
  @IsDateString()
  ocorridoEm?: string;
}

/** Corpo de POST /v1/eventos-sanidade/{id}/resolver. */
export class ResolverSanidadeDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  tratamentoAplicado?: string | null;
}

// --- Pós-colheita (doc 02 §5.11) ---

/** Corpo de POST /v1/colheitas. `plantaIds` é o subconjunto de plantas colhidas. */
export class RegistrarColheitaDto {
  @IsString()
  @MinLength(1)
  cicloId!: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  plantaIds!: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  pesoUmidoGramas?: number | null;

  @IsOptional()
  @IsDateString()
  colhidoEm?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacoes?: string | null;
}

/** Corpo de POST /v1/secagens. 1—1 com a colheita. */
export class RegistrarSecagemDto {
  @IsString()
  @MinLength(1)
  colheitaId!: string;

  @IsOptional()
  @IsDateString()
  iniciadaEm?: string;

  @IsOptional()
  @IsDateString()
  finalizadaEm?: string | null;

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
  @IsString()
  @MaxLength(2000)
  observacoes?: string | null;
}

/** Corpo de POST /v1/curas. 1—1 com a secagem. */
export class RegistrarCuraDto {
  @IsString()
  @MinLength(1)
  secagemId!: string;

  @IsOptional()
  @IsDateString()
  iniciadaEm?: string;

  @IsOptional()
  @IsDateString()
  finalizadaEm?: string | null;

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
  @IsString()
  @MaxLength(2000)
  burping?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacoes?: string | null;
}

/** Corpo de POST /v1/lotes. Fecha o fluxo pós-colheita: 1—1 com a cura. */
export class GerarLoteDto {
  @IsString()
  @MinLength(1)
  curaId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  codigo!: string;

  @IsNumber()
  @Min(0)
  pesoSecoGramas!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacoes?: string | null;
}

// --- Tarefas (doc 02 §5.10) ---

/** Corpo de POST /v1/tarefas. `recorrenciaDias` ausente/nulo = tarefa pontual. */
export class CriarTarefaDto {
  @IsString()
  @MinLength(1)
  cicloId!: string;

  @IsOptional()
  @IsString()
  plantaId?: string | null;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  titulo!: string;

  @IsIn(TIPOS_DE_TAREFA)
  tipo!: TipoDeTarefa;

  @IsOptional()
  @IsDateString()
  previstaPara?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  recorrenciaDias?: number | null;
}

// --- Modelos de Ciclo (doc 02 §7, Premium) ---

/** Corpo de POST /v1/ciclos/modelos. Padrões (ambiente/genética/fase/rotina) são opcionais. */
export class CriarModeloDeCicloDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome!: string;

  @IsOptional()
  @IsString()
  ambienteId?: string | null;

  @IsOptional()
  @IsString()
  geneticaId?: string | null;

  @IsOptional()
  @IsIn(FASES)
  faseInicial?: FaseDeVida | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  rotinaPadrao?: string | null;
}

// --- Módulo Outdoor (doc 02 §6) ---

/** Corpo de PUT /v1/ambientes/{id}/clima. Localização é opt-in e aproximada. */
export class DefinirClimaDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  localizacaoAproximada?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitudeAproximada?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitudeAproximada?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacoes?: string | null;
}

/** Corpo de PUT /v1/tarefas/{id}. Campo ausente não muda; `null` limpa data/recorrência. */
export class AtualizarTarefaDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  titulo?: string;

  @IsOptional()
  @IsIn(TIPOS_DE_TAREFA)
  tipo?: TipoDeTarefa;

  @IsOptional()
  @IsDateString()
  previstaPara?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  recorrenciaDias?: number | null;
}

/** `POST /v1/ciclos/{id}/publicar` — publica o Growlog na Comunidade (doc 06 §9). */
export class PublicarCicloDto {
  @IsIn(ESCOPOS_MVP)
  escopo!: Escopo;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  titulo?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  resumo?: string | null;

  /** Parâmetros técnicos compartilhados (chave→valor), indexados pela busca estruturada. */
  @IsOptional()
  @IsObject()
  dimensoes?: Record<string, string>;
}
