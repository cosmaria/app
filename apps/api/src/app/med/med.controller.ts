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
  AtualizarProdutoUseCase,
  AtualizarTratamentoUseCase,
  CriarProdutoUseCase,
  CriarTratamentoUseCase,
  CriarModeloDeTratamentoUseCase,
  type EfeitoView,
  EncerrarTratamentoUseCase,
  type EvolucaoClinica,
  GerarRelatorioUseCase,
  ListarEfeitosDaDoseUseCase,
  ListarModelosDeTratamentoUseCase,
  ListarProdutosDoTratamentoUseCase,
  ListarSintomasDiariosUseCase,
  ListarTratamentosUseCase,
  ListarUsosDoProdutoUseCase,
  ListarUsosDoTratamentoUseCase,
  type ModeloDeTratamentoView,
  ObterEvolucaoUseCase,
  ObterProdutoUseCase,
  ObterSessaoUseCase,
  ObterTratamentoUseCase,
  ObterUsoUseCase,
  type ProdutoView,
  type RelatorioClinicoView,
  RegistrarEfeitoUseCase,
  RegistrarSessaoAntesUseCase,
  RegistrarSessaoDepoisUseCase,
  RegistrarSintomaDiarioUseCase,
  RegistrarUsoUseCase,
  type RegistroDeUsoView,
  RemoverModeloDeTratamentoUseCase,
  RemoverProdutoUseCase,
  RemoverTratamentoUseCase,
  type SessaoView,
  type SintomaDiarioView,
  type TratamentoView,
} from '@cosmaria/med-application';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';
import {
  AtualizarProdutoDto,
  AtualizarTratamentoDto,
  CriarModeloDeTratamentoDto,
  CriarProdutoDto,
  CriarTratamentoDto,
  RegistrarEfeitoDto,
  RegistrarSessaoAntesDto,
  RegistrarSessaoDepoisDto,
  RegistrarSintomaDiarioDto,
  RegistrarUsoDto,
} from './dto/med.dtos';

/** Tratamentos (doc 09 `/v1/tratamentos`) — a entidade central do Med. */
@Controller('tratamentos')
@UseGuards(JwtAuthGuard)
export class TratamentoController {
  constructor(
    private readonly criar: CriarTratamentoUseCase,
    private readonly listar: ListarTratamentosUseCase,
    private readonly obter: ObterTratamentoUseCase,
    private readonly atualizar: AtualizarTratamentoUseCase,
    private readonly encerrar: EncerrarTratamentoUseCase,
    private readonly remover: RemoverTratamentoUseCase,
    private readonly listarProdutos: ListarProdutosDoTratamentoUseCase,
    private readonly listarUsos: ListarUsosDoTratamentoUseCase,
  ) {}

  @Post()
  criarTratamento(
    @Body() dto: CriarTratamentoDto,
    @Req() req: RequestAutenticada,
  ): Promise<TratamentoView> {
    return this.criar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      condicao: dto.condicao,
      objetivo: dto.objetivo,
      medicoResponsavel: dto.medicoResponsavel,
      iniciadoEm: dto.iniciadoEm ? new Date(dto.iniciadoEm) : undefined,
    });
  }

  @Get()
  listarTratamentos(
    @Req() req: RequestAutenticada,
    @Query('ativos') ativos?: string,
  ): Promise<TratamentoView[]> {
    return this.listar.executar(identidadeDe(req).usuarioId, ativos === 'true');
  }

  @Get(':tratamentoId')
  obterTratamento(
    @Param('tratamentoId') tratamentoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<TratamentoView> {
    return this.obter.executar({ usuarioId: identidadeDe(req).usuarioId, tratamentoId });
  }

  @Get(':tratamentoId/produtos')
  produtosDoTratamento(
    @Param('tratamentoId') tratamentoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<ProdutoView[]> {
    return this.listarProdutos.executar({ usuarioId: identidadeDe(req).usuarioId, tratamentoId });
  }

  @Get(':tratamentoId/registros-uso')
  usosDoTratamento(
    @Param('tratamentoId') tratamentoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<RegistroDeUsoView[]> {
    return this.listarUsos.executar({ usuarioId: identidadeDe(req).usuarioId, tratamentoId });
  }

  @Put(':tratamentoId')
  atualizarTratamento(
    @Param('tratamentoId') tratamentoId: string,
    @Body() dto: AtualizarTratamentoDto,
    @Req() req: RequestAutenticada,
  ): Promise<TratamentoView> {
    return this.atualizar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      tratamentoId,
      ...dto,
    });
  }

  @Post(':tratamentoId/encerrar')
  encerrarTratamento(
    @Param('tratamentoId') tratamentoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<TratamentoView> {
    return this.encerrar.executar({ usuarioId: identidadeDe(req).usuarioId, tratamentoId });
  }

  @Delete(':tratamentoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removerTratamento(
    @Param('tratamentoId') tratamentoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<void> {
    await this.remover.executar({ usuarioId: identidadeDe(req).usuarioId, tratamentoId });
  }
}

/** Produtos (doc 09 `/v1/produtos`). */
@Controller('produtos')
@UseGuards(JwtAuthGuard)
export class ProdutoController {
  constructor(
    private readonly criar: CriarProdutoUseCase,
    private readonly obter: ObterProdutoUseCase,
    private readonly atualizar: AtualizarProdutoUseCase,
    private readonly remover: RemoverProdutoUseCase,
    private readonly listarUsos: ListarUsosDoProdutoUseCase,
  ) {}

  @Post()
  criarProduto(@Body() dto: CriarProdutoDto, @Req() req: RequestAutenticada): Promise<ProdutoView> {
    return this.criar.executar({ usuarioId: identidadeDe(req).usuarioId, ...dto });
  }

  @Get(':produtoId')
  obterProduto(
    @Param('produtoId') produtoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<ProdutoView> {
    return this.obter.executar({ usuarioId: identidadeDe(req).usuarioId, produtoId });
  }

  @Get(':produtoId/registros-uso')
  usosDoProduto(
    @Param('produtoId') produtoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<RegistroDeUsoView[]> {
    return this.listarUsos.executar({ usuarioId: identidadeDe(req).usuarioId, produtoId });
  }

  @Put(':produtoId')
  atualizarProduto(
    @Param('produtoId') produtoId: string,
    @Body() dto: AtualizarProdutoDto,
    @Req() req: RequestAutenticada,
  ): Promise<ProdutoView> {
    return this.atualizar.executar({ usuarioId: identidadeDe(req).usuarioId, produtoId, ...dto });
  }

  @Delete(':produtoId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removerProduto(
    @Param('produtoId') produtoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<void> {
    await this.remover.executar({ usuarioId: identidadeDe(req).usuarioId, produtoId });
  }
}

/** Registros de uso / doses (doc 09 `/v1/registros-uso`). */
@Controller('registros-uso')
@UseGuards(JwtAuthGuard)
export class RegistroDeUsoController {
  constructor(
    private readonly registrar: RegistrarUsoUseCase,
    private readonly obter: ObterUsoUseCase,
  ) {}

  @Post()
  registrarUso(
    @Body() dto: RegistrarUsoDto,
    @Req() req: RequestAutenticada,
  ): Promise<RegistroDeUsoView> {
    return this.registrar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      produtoId: dto.produtoId,
      quantidade: dto.quantidade,
      unidade: dto.unidade,
      via: dto.via,
      usadoEm: dto.usadoEm ? new Date(dto.usadoEm) : undefined,
      observacoes: dto.observacoes,
    });
  }

  @Get(':registroDeUsoId')
  obterUso(
    @Param('registroDeUsoId') registroDeUsoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<RegistroDeUsoView> {
    return this.obter.executar({ usuarioId: identidadeDe(req).usuarioId, registroDeUsoId });
  }
}

/** Sessões antes/depois (doc 09 `/v1/sessoes`) — o diferencial clínico do Med (doc 03 §5.4). */
@Controller('sessoes')
@UseGuards(JwtAuthGuard)
export class SessaoController {
  constructor(
    private readonly registrarAntes: RegistrarSessaoAntesUseCase,
    private readonly registrarDepois: RegistrarSessaoDepoisUseCase,
    private readonly obter: ObterSessaoUseCase,
  ) {}

  @Post()
  criarSessao(
    @Body() dto: RegistrarSessaoAntesDto,
    @Req() req: RequestAutenticada,
  ): Promise<SessaoView> {
    return this.registrarAntes.executar({ usuarioId: identidadeDe(req).usuarioId, ...dto });
  }

  @Put(':sessaoId')
  registrarDepoisDaSessao(
    @Param('sessaoId') sessaoId: string,
    @Body() dto: RegistrarSessaoDepoisDto,
    @Req() req: RequestAutenticada,
  ): Promise<SessaoView> {
    return this.registrarDepois.executar({
      usuarioId: identidadeDe(req).usuarioId,
      sessaoId,
      intensidadeDepois: dto.intensidadeDepois,
    });
  }

  @Get(':sessaoId')
  obterSessao(
    @Param('sessaoId') sessaoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<SessaoView> {
    return this.obter.executar({ usuarioId: identidadeDe(req).usuarioId, sessaoId });
  }
}

/** Linha de base diária (doc 09 `/v1/sintomas-diarios`) — humor/ansiedade/dor/sono/apetite. */
@Controller('sintomas-diarios')
@UseGuards(JwtAuthGuard)
export class SintomaDiarioController {
  constructor(
    private readonly registrar: RegistrarSintomaDiarioUseCase,
    private readonly listar: ListarSintomasDiariosUseCase,
  ) {}

  @Post()
  registrarSintoma(
    @Body() dto: RegistrarSintomaDiarioDto,
    @Req() req: RequestAutenticada,
  ): Promise<SintomaDiarioView> {
    return this.registrar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      humor: dto.humor,
      ansiedade: dto.ansiedade,
      dor: dto.dor,
      sono: dto.sono,
      apetite: dto.apetite,
      registradoEm: dto.registradoEm ? new Date(dto.registradoEm) : undefined,
      observacoes: dto.observacoes,
    });
  }

  @Get()
  listarSintomas(
    @Req() req: RequestAutenticada,
    @Query('de') de?: string,
    @Query('ate') ate?: string,
  ): Promise<SintomaDiarioView[]> {
    return this.listar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      de: de ? new Date(de) : undefined,
      ate: ate ? new Date(ate) : undefined,
    });
  }
}

/** Efeitos (doc 09 `/v1/efeitos`) — positivos/adversos ancorados numa dose. */
@Controller()
@UseGuards(JwtAuthGuard)
export class EfeitoController {
  constructor(
    private readonly registrar: RegistrarEfeitoUseCase,
    private readonly listar: ListarEfeitosDaDoseUseCase,
  ) {}

  @Post('efeitos')
  registrarEfeito(
    @Body() dto: RegistrarEfeitoDto,
    @Req() req: RequestAutenticada,
  ): Promise<EfeitoView> {
    return this.registrar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      registroDeUsoId: dto.registroDeUsoId,
      tipo: dto.tipo,
      descricao: dto.descricao,
      intensidade: dto.intensidade,
      duracaoMinutos: dto.duracaoMinutos,
      registradoEm: dto.registradoEm ? new Date(dto.registradoEm) : undefined,
    });
  }

  @Get('registros-uso/:registroDeUsoId/efeitos')
  efeitosDaDose(
    @Param('registroDeUsoId') registroDeUsoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<EfeitoView[]> {
    return this.listar.executar({ usuarioId: identidadeDe(req).usuarioId, registroDeUsoId });
  }
}

/**
 * Evolução clínica e relatório (doc 09 `/v1/tratamentos/{id}/evolucao|relatorio`).
 * Controller separado do TratamentoController para não misturar CRUD com o motor de leitura.
 */
@Controller('tratamentos')
@UseGuards(JwtAuthGuard)
export class EvolucaoController {
  constructor(
    private readonly obterEvolucao: ObterEvolucaoUseCase,
    private readonly gerarRelatorio: GerarRelatorioUseCase,
  ) {}

  @Get(':tratamentoId/evolucao')
  evolucao(
    @Param('tratamentoId') tratamentoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<EvolucaoClinica> {
    return this.obterEvolucao.executar({ usuarioId: identidadeDe(req).usuarioId, tratamentoId });
  }

  @Get(':tratamentoId/relatorio')
  relatorio(
    @Param('tratamentoId') tratamentoId: string,
    @Req() req: RequestAutenticada,
    @Query('de') de?: string,
    @Query('ate') ate?: string,
  ): Promise<RelatorioClinicoView> {
    return this.gerarRelatorio.executar({
      usuarioId: identidadeDe(req).usuarioId,
      tratamentoId,
      de: de ? new Date(de) : undefined,
      ate: ate ? new Date(ate) : undefined,
    });
  }
}

/**
 * Modelos de tratamento (doc 09 `/v1/tratamentos/modelos`, Premium).
 * Registrado antes do TratamentoController para `modelos` não casar como `:tratamentoId`.
 */
@Controller('tratamentos/modelos')
@UseGuards(JwtAuthGuard)
export class ModeloDeTratamentoController {
  constructor(
    private readonly criar: CriarModeloDeTratamentoUseCase,
    private readonly listar: ListarModelosDeTratamentoUseCase,
    private readonly remover: RemoverModeloDeTratamentoUseCase,
  ) {}

  @Post()
  criarModelo(
    @Body() dto: CriarModeloDeTratamentoDto,
    @Req() req: RequestAutenticada,
  ): Promise<ModeloDeTratamentoView> {
    return this.criar.executar({ usuarioId: identidadeDe(req).usuarioId, ...dto });
  }

  @Get()
  listarModelos(@Req() req: RequestAutenticada): Promise<ModeloDeTratamentoView[]> {
    return this.listar.executar(identidadeDe(req).usuarioId);
  }

  @Delete(':modeloId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removerModelo(
    @Param('modeloId') modeloId: string,
    @Req() req: RequestAutenticada,
  ): Promise<void> {
    await this.remover.executar({ usuarioId: identidadeDe(req).usuarioId, modeloId });
  }
}
