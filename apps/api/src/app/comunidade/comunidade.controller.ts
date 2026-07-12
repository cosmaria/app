import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  BuscarPublicacoesUseCase,
  ComentarPublicacaoUseCase,
  type ComentarioView,
  type ConfiguracaoDeForkView,
  CurtirPublicacaoUseCase,
  DeixarDeSeguirUseCase,
  DescurtirPublicacaoUseCase,
  ForkarPublicacaoUseCase,
  ListarComentariosUseCase,
  type EstatisticasDePerfilView,
  ObterEstatisticasDePerfilUseCase,
  ObterFeedUseCase,
  ObterPublicacaoUseCase,
  ObterReputacaoUseCase,
  type PublicacaoView,
  RegistrarVisualizacaoDePerfilUseCase,
  type ReputacaoView,
  SeguirPerfilUseCase,
} from '@cosmaria/comunidade-application';
import { ContextoInvalidoError } from '@cosmaria/comunidade-domain';
import { ContextoDeApp, ehContextoDeAppValido } from '@cosmaria/core-domain';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';
import { ComentarDto } from './dto/comunidade.dtos';

/** Traduz o parâmetro `?contexto=grow|med` no enum, ou recusa com 400 (doc 06 §2). */
function paraContexto(valor: string | undefined): ContextoDeApp {
  const normalizado = (valor ?? '').toUpperCase();
  if (!ehContextoDeAppValido(normalizado)) {
    throw new ContextoInvalidoError();
  }
  return normalizado as ContextoDeApp;
}

/**
 * Superfície HTTP da Comunidade (doc 06 §Lista de APIs, doc 09).
 *
 * Tudo é escopado por contexto: um feed do Grow nunca devolve conteúdo do Med, mesmo da
 * mesma Conta (doc 06 §2). O Perfil Público do visualizador é resolvido internamente pela
 * PERFIL_PUBLIC_API — a Comunidade nunca vê o `usuarioId`.
 */
@Controller('comunidade')
@UseGuards(JwtAuthGuard)
export class ComunidadeController {
  constructor(
    private readonly feed: ObterFeedUseCase,
    private readonly obterPublicacao: ObterPublicacaoUseCase,
    private readonly busca: BuscarPublicacoesUseCase,
    private readonly reputacao: ObterReputacaoUseCase,
    private readonly registrarVisualizacao: RegistrarVisualizacaoDePerfilUseCase,
    private readonly estatisticas: ObterEstatisticasDePerfilUseCase,
  ) {}

  /** `GET /v1/comunidade/feed?contexto=grow|med&limite=&antes=` — feed escopado por contexto. */
  @Get('feed')
  obterFeed(
    @Req() req: RequestAutenticada,
    @Query('contexto') contexto?: string,
    @Query('limite') limite?: string,
    @Query('antes') antes?: string,
  ): Promise<PublicacaoView[]> {
    return this.feed.executar({
      usuarioId: identidadeDe(req).usuarioId,
      contexto: paraContexto(contexto),
      limite: limite !== undefined ? Number(limite) : undefined,
      publicadasAntesDe: antes !== undefined ? new Date(antes) : undefined,
    });
  }

  /**
   * `GET /v1/comunidade/busca?contexto=grow|med&chave=&valor=` — busca estruturada por
   * parâmetro técnico (doc 06 §7.1). Sem `chave`/`valor` não há o que casar: devolve vazio.
   */
  @Get('busca')
  buscar(
    @Req() req: RequestAutenticada,
    @Query('contexto') contexto?: string,
    @Query('chave') chave?: string,
    @Query('valor') valor?: string,
  ): Promise<PublicacaoView[]> {
    const ctx = paraContexto(contexto);
    if (!chave || !valor) {
      return Promise.resolve([]);
    }
    return this.busca.executar({
      usuarioId: identidadeDe(req).usuarioId,
      contexto: ctx,
      chave,
      valor,
    });
  }

  /** `GET /v1/comunidade/perfis/{perfilId}/reputacao` — reputação por perfil/contexto (doc 06 §12). */
  @Get('perfis/:perfilId/reputacao')
  obterReputacao(@Param('perfilId') perfilId: string): Promise<ReputacaoView> {
    return this.reputacao.executar({ perfilId });
  }

  /** `POST /v1/comunidade/perfis/{perfilId}/visualizacao` — registra visita agregada (livre). */
  @Post('perfis/:perfilId/visualizacao')
  @HttpCode(HttpStatus.NO_CONTENT)
  async visualizar(
    @Param('perfilId') perfilId: string,
    @Req() req: RequestAutenticada,
  ): Promise<void> {
    await this.registrarVisualizacao.executar({
      usuarioId: identidadeDe(req).usuarioId,
      perfilId,
    });
  }

  /** `GET /v1/comunidade/perfis/{perfilId}/estatisticas` — estatísticas avançadas (Premium, só o dono). */
  @Get('perfis/:perfilId/estatisticas')
  obterEstatisticas(
    @Param('perfilId') perfilId: string,
    @Req() req: RequestAutenticada,
  ): Promise<EstatisticasDePerfilView> {
    return this.estatisticas.executar({ usuarioId: identidadeDe(req).usuarioId, perfilId });
  }

  /** `GET /v1/comunidade/publicacoes/{id}` — detalhe; 404 se fora do alcance de visibilidade. */
  @Get('publicacoes/:publicacaoId')
  obter(
    @Param('publicacaoId') publicacaoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<PublicacaoView> {
    return this.obterPublicacao.executar({
      usuarioId: identidadeDe(req).usuarioId,
      publicacaoId,
    });
  }
}

/**
 * Interações sociais (doc 06 §7.1): seguir, curtir, comentar. Sempre entre perfis do MESMO
 * contexto (o caso de uso resolve o perfil do visualizador no contexto do alvo). As ações de
 * escrita publicam eventos (`PerfilSeguido`/`PublicacaoCurtida`/`PublicacaoComentada`) para o
 * Serviço de Notificações avisar o autor.
 */
@Controller('comunidade')
@UseGuards(JwtAuthGuard)
export class InteracaoController {
  constructor(
    private readonly seguir: SeguirPerfilUseCase,
    private readonly deixarDeSeguir: DeixarDeSeguirUseCase,
    private readonly curtir: CurtirPublicacaoUseCase,
    private readonly descurtir: DescurtirPublicacaoUseCase,
    private readonly comentar: ComentarPublicacaoUseCase,
    private readonly listarComentarios: ListarComentariosUseCase,
    private readonly fork: ForkarPublicacaoUseCase,
  ) {}

  @Post('seguir/:perfilId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async seguirPerfil(
    @Param('perfilId') perfilId: string,
    @Req() req: RequestAutenticada,
  ): Promise<void> {
    await this.seguir.executar({ usuarioId: identidadeDe(req).usuarioId, perfilAlvoId: perfilId });
  }

  @Delete('seguir/:perfilId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deixarDeSeguirPerfil(
    @Param('perfilId') perfilId: string,
    @Req() req: RequestAutenticada,
  ): Promise<void> {
    await this.deixarDeSeguir.executar({
      usuarioId: identidadeDe(req).usuarioId,
      perfilAlvoId: perfilId,
    });
  }

  @Post('publicacoes/:publicacaoId/curtir')
  @HttpCode(HttpStatus.NO_CONTENT)
  async curtirPublicacao(
    @Param('publicacaoId') publicacaoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<void> {
    await this.curtir.executar({ usuarioId: identidadeDe(req).usuarioId, publicacaoId });
  }

  @Delete('publicacoes/:publicacaoId/curtir')
  @HttpCode(HttpStatus.NO_CONTENT)
  async descurtirPublicacao(
    @Param('publicacaoId') publicacaoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<void> {
    await this.descurtir.executar({ usuarioId: identidadeDe(req).usuarioId, publicacaoId });
  }

  @Post('publicacoes/:publicacaoId/comentarios')
  comentarPublicacao(
    @Param('publicacaoId') publicacaoId: string,
    @Body() dto: ComentarDto,
    @Req() req: RequestAutenticada,
  ): Promise<ComentarioView> {
    return this.comentar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      publicacaoId,
      texto: dto.texto,
    });
  }

  @Get('publicacoes/:publicacaoId/comentarios')
  listar(@Param('publicacaoId') publicacaoId: string): Promise<ComentarioView[]> {
    return this.listarComentarios.executar({ publicacaoId });
  }

  /** `POST /v1/comunidade/publicacoes/{id}/fork` — copia a config de um Growlog (doc 02 §9.2). */
  @Post('publicacoes/:publicacaoId/fork')
  forkar(
    @Param('publicacaoId') publicacaoId: string,
    @Req() req: RequestAutenticada,
  ): Promise<ConfiguracaoDeForkView> {
    return this.fork.executar({ usuarioId: identidadeDe(req).usuarioId, publicacaoId });
  }
}
