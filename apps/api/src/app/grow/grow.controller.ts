import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  AdicionarPlantaUseCase,
  type AmbienteView,
  AtualizarAmbienteUseCase,
  AtualizarGeneticaUseCase,
  AtualizarPlantaUseCase,
  AvancarFaseDaPlantaUseCase,
  AvancarFaseDoCicloUseCase,
  type CicloView,
  CriarAmbienteUseCase,
  CriarGeneticaUseCase,
  EncerrarCicloUseCase,
  type GeneticaView,
  IniciarCicloUseCase,
  ListarAmbientesUseCase,
  ListarCiclosUseCase,
  ListarGeneticasUseCase,
  ListarPlantasDoCicloUseCase,
  ObterCicloUseCase,
  type PlantaView,
  type PublicacaoDoCicloView,
  PublicarCicloUseCase,
  RemoverAmbienteUseCase,
  RemoverGeneticaUseCase,
  RenomearCicloUseCase,
} from '@cosmaria/grow-application';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';
import {
  AdicionarPlantaDto,
  AtualizarAmbienteDto,
  AtualizarGeneticaDto,
  AtualizarPlantaDto,
  AvancarFaseDto,
  CriarAmbienteDto,
  CriarGeneticaDto,
  IniciarCicloDto,
  PublicarCicloDto,
  RenomearCicloDto,
} from './dto/grow.dtos';

/** `undefined` = não alterar; `null` = limpar; texto ISO = nova data. */
function converterData(valor: string | null | undefined): Date | null | undefined {
  if (valor === undefined || valor === null) {
    return valor;
  }
  return new Date(valor);
}

/** Biblioteca de genéticas do usuário (doc 09 `/v1/geneticas`). */
@Controller('geneticas')
@UseGuards(JwtAuthGuard)
export class GeneticaController {
  constructor(
    private readonly criar: CriarGeneticaUseCase,
    private readonly listar: ListarGeneticasUseCase,
    private readonly atualizar: AtualizarGeneticaUseCase,
    private readonly remover: RemoverGeneticaUseCase,
  ) {}

  @Post()
  criarGenetica(
    @Body() dto: CriarGeneticaDto,
    @Req() req: RequestAutenticada,
  ): Promise<GeneticaView> {
    return this.criar.executar({ usuarioId: identidadeDe(req).usuarioId, ...dto });
  }

  @Get()
  listarGeneticas(@Req() req: RequestAutenticada): Promise<GeneticaView[]> {
    return this.listar.executar(identidadeDe(req).usuarioId);
  }

  @Put(':geneticaId')
  atualizarGenetica(
    @Param('geneticaId') geneticaId: string,
    @Body() dto: AtualizarGeneticaDto,
    @Req() req: RequestAutenticada,
  ): Promise<GeneticaView> {
    return this.atualizar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      geneticaId,
      ...dto,
    });
  }

  @Delete(':geneticaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removerGenetica(
    @Param('geneticaId') geneticaId: string,
    @Req() req: RequestAutenticada,
  ): Promise<void> {
    await this.remover.executar({ usuarioId: identidadeDe(req).usuarioId, geneticaId });
  }
}

/**
 * Ambientes (doc 09 `/v1/ambientes`).
 * O `POST` é o único ponto do Grow que consulta o plano — o limite de ambientes
 * simultâneos é a fronteira de capacidade do gratuito (doc 07 §9).
 */
@Controller('ambientes')
@UseGuards(JwtAuthGuard)
export class AmbienteController {
  constructor(
    private readonly criar: CriarAmbienteUseCase,
    private readonly listar: ListarAmbientesUseCase,
    private readonly atualizar: AtualizarAmbienteUseCase,
    private readonly remover: RemoverAmbienteUseCase,
  ) {}

  @Post()
  criarAmbiente(
    @Body() dto: CriarAmbienteDto,
    @Req() req: RequestAutenticada,
  ): Promise<AmbienteView> {
    return this.criar.executar({ usuarioId: identidadeDe(req).usuarioId, ...dto });
  }

  @Get()
  listarAmbientes(@Req() req: RequestAutenticada): Promise<AmbienteView[]> {
    return this.listar.executar(identidadeDe(req).usuarioId);
  }

  @Put(':ambienteId')
  atualizarAmbiente(
    @Param('ambienteId') ambienteId: string,
    @Body() dto: AtualizarAmbienteDto,
    @Req() req: RequestAutenticada,
  ): Promise<AmbienteView> {
    return this.atualizar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      ambienteId,
      ...dto,
    });
  }

  @Delete(':ambienteId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removerAmbiente(
    @Param('ambienteId') ambienteId: string,
    @Req() req: RequestAutenticada,
  ): Promise<void> {
    await this.remover.executar({ usuarioId: identidadeDe(req).usuarioId, ambienteId });
  }
}

/** Ciclos de cultivo (doc 09 `/v1/ciclos`) — a entidade central do Grow. */
@Controller('ciclos')
@UseGuards(JwtAuthGuard)
export class CicloController {
  constructor(
    private readonly iniciar: IniciarCicloUseCase,
    private readonly listar: ListarCiclosUseCase,
    private readonly obter: ObterCicloUseCase,
    private readonly avancarFase: AvancarFaseDoCicloUseCase,
    private readonly renomear: RenomearCicloUseCase,
    private readonly encerrar: EncerrarCicloUseCase,
    private readonly listarPlantas: ListarPlantasDoCicloUseCase,
    private readonly publicar: PublicarCicloUseCase,
  ) {}

  @Post()
  iniciarCiclo(@Body() dto: IniciarCicloDto, @Req() req: RequestAutenticada): Promise<CicloView> {
    return this.iniciar.executar({ usuarioId: identidadeDe(req).usuarioId, ...dto });
  }

  @Get()
  listarCiclos(
    @Req() req: RequestAutenticada,
    @Query('ativos') ativos?: string,
  ): Promise<CicloView[]> {
    return this.listar.executar(identidadeDe(req).usuarioId, ativos === 'true');
  }

  @Get(':cicloId')
  obterCiclo(
    @Param('cicloId') cicloId: string,
    @Req() req: RequestAutenticada,
  ): Promise<CicloView> {
    return this.obter.executar({ usuarioId: identidadeDe(req).usuarioId, cicloId });
  }

  @Get(':cicloId/plantas')
  plantasDoCiclo(
    @Param('cicloId') cicloId: string,
    @Req() req: RequestAutenticada,
  ): Promise<PlantaView[]> {
    return this.listarPlantas.executar({ usuarioId: identidadeDe(req).usuarioId, cicloId });
  }

  @Put(':cicloId')
  renomearCiclo(
    @Param('cicloId') cicloId: string,
    @Body() dto: RenomearCicloDto,
    @Req() req: RequestAutenticada,
  ): Promise<CicloView> {
    return this.renomear.executar({
      usuarioId: identidadeDe(req).usuarioId,
      cicloId,
      nome: dto.nome,
    });
  }

  @Post(':cicloId/fase')
  avancarFaseDoCiclo(
    @Param('cicloId') cicloId: string,
    @Body() dto: AvancarFaseDto,
    @Req() req: RequestAutenticada,
  ): Promise<CicloView> {
    return this.avancarFase.executar({
      usuarioId: identidadeDe(req).usuarioId,
      cicloId,
      fase: dto.fase,
    });
  }

  @Post(':cicloId/encerrar')
  encerrarCiclo(
    @Param('cicloId') cicloId: string,
    @Req() req: RequestAutenticada,
  ): Promise<CicloView> {
    return this.encerrar.executar({ usuarioId: identidadeDe(req).usuarioId, cicloId });
  }

  /** Publica o Growlog na Comunidade (doc 06 §9). O Grow é dono do conteúdo e da privacidade. */
  @Post(':cicloId/publicar')
  publicarCiclo(
    @Param('cicloId') cicloId: string,
    @Body() dto: PublicarCicloDto,
    @Req() req: RequestAutenticada,
  ): Promise<PublicacaoDoCicloView> {
    return this.publicar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      cicloId,
      escopo: dto.escopo,
      titulo: dto.titulo,
      resumo: dto.resumo,
      dimensoes: dto.dimensoes,
    });
  }
}

/** Plantas (doc 09 `/v1/plantas`) — unidade central de registro, com fase própria. */
@Controller('plantas')
@UseGuards(JwtAuthGuard)
export class PlantaController {
  constructor(
    private readonly adicionar: AdicionarPlantaUseCase,
    private readonly avancarFase: AvancarFaseDaPlantaUseCase,
    private readonly atualizar: AtualizarPlantaUseCase,
  ) {}

  @Post()
  adicionarPlanta(
    @Body() dto: AdicionarPlantaDto,
    @Req() req: RequestAutenticada,
  ): Promise<PlantaView> {
    return this.adicionar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      cicloId: dto.cicloId,
      geneticaId: dto.geneticaId,
      nome: dto.nome,
      origem: dto.origem,
      plantaMaeId: dto.plantaMaeId,
      faseInicial: dto.faseInicial,
      germinadaEm: dto.germinadaEm ? new Date(dto.germinadaEm) : undefined,
    });
  }

  @Post(':plantaId/fase')
  avancarFaseDaPlanta(
    @Param('plantaId') plantaId: string,
    @Body() dto: AvancarFaseDto,
    @Req() req: RequestAutenticada,
  ): Promise<PlantaView> {
    return this.avancarFase.executar({
      usuarioId: identidadeDe(req).usuarioId,
      plantaId,
      fase: dto.fase,
    });
  }

  @Put(':plantaId')
  atualizarPlanta(
    @Param('plantaId') plantaId: string,
    @Body() dto: AtualizarPlantaDto,
    @Req() req: RequestAutenticada,
  ): Promise<PlantaView> {
    return this.atualizar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      plantaId,
      nome: dto.nome,
      // Ausente não mexe; `null` explícito limpa a data de germinação.
      germinadaEm: converterData(dto.germinadaEm),
    });
  }
}
