import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import {
  ARMAZENAMENTO_DE_OBJETOS,
  type ArmazenamentoDeObjetos,
  ListarMidiaDaEntidadeUseCase,
  type MidiaView,
  ObterUrlDeMidiaUseCase,
  RegistrarMidiaUseCase,
  RemoverMidiaUseCase,
  type UrlDeMidiaView,
} from '@cosmaria/core-application';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';
import { RegistrarMidiaDto } from './dto/midia.dtos';

/**
 * Arquivo recebido pelo multer. Tipado aqui em vez de depender de `@types/multer`:
 * são os únicos campos que usamos, e evita mais uma dependência de tipos.
 */
interface ArquivoEnviado {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

/**
 * Mídia (doc 09 `POST /v1/midia`) — capacidade do **Core**, reclassificada do Grow na
 * revisão 00-09: o Med também anexa exames, e a lógica não podia ser duplicada.
 *
 * A resposta nunca contém a chave no armazenamento de objetos; o cliente recebe o
 * `midiaId` e busca uma URL assinada e temporária quando for exibir o arquivo.
 */
@Controller('midia')
@UseGuards(JwtAuthGuard)
export class MidiaController {
  constructor(
    private readonly registrar: RegistrarMidiaUseCase,
    private readonly obterUrl: ObterUrlDeMidiaUseCase,
    private readonly listar: ListarMidiaDaEntidadeUseCase,
    private readonly remover: RemoverMidiaUseCase,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('arquivo'))
  registrarMidia(
    @UploadedFile() arquivo: ArquivoEnviado | undefined,
    @Body() dto: RegistrarMidiaDto,
    @Req() req: RequestAutenticada,
  ): Promise<MidiaView> {
    if (!arquivo) {
      throw new BadRequestException({
        code: 'ARQUIVO_AUSENTE',
        message: 'Envie o arquivo no campo "arquivo".',
      });
    }
    return this.registrar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      modulo: dto.modulo,
      tipoEntidade: dto.tipoEntidade,
      entidadeId: dto.entidadeId,
      nomeArquivo: arquivo.originalname,
      tipoConteudo: arquivo.mimetype,
      conteudo: arquivo.buffer,
    });
  }

  @Get('entidade/:modulo/:tipoEntidade/:entidadeId')
  listarDaEntidade(
    @Param('modulo') modulo: string,
    @Param('tipoEntidade') tipoEntidade: string,
    @Param('entidadeId') entidadeId: string,
    @Req() req: RequestAutenticada,
  ): Promise<MidiaView[]> {
    return this.listar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      modulo,
      tipoEntidade,
      entidadeId,
    });
  }

  @Get(':midiaId')
  obterUrlDeMidia(
    @Param('midiaId') midiaId: string,
    @Req() req: RequestAutenticada,
  ): Promise<UrlDeMidiaView> {
    return this.obterUrl.executar({ usuarioId: identidadeDe(req).usuarioId, midiaId });
  }

  @Delete(':midiaId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removerMidia(
    @Param('midiaId') midiaId: string,
    @Req() req: RequestAutenticada,
  ): Promise<void> {
    await this.remover.executar({ usuarioId: identidadeDe(req).usuarioId, midiaId });
  }
}

/**
 * Capacidades opcionais do adaptador de armazenamento — só o local as implementa.
 * O esquema de assinatura do link é detalhe do adaptador (o Cloud Storage tem o seu):
 * a camada HTTP não conhece nenhum dos dois, apenas pergunta se o link vale.
 */
interface ArmazenamentoLegivel {
  ler?(chave: string): Promise<Buffer | null>;
  urlEhValida?(chave: string, expiraEm: number, assinatura: string): boolean;
}

/**
 * `GET /v1/arquivos` — serve os bytes de uma URL assinada.
 *
 * NÃO usa Bearer: a autenticação é a própria assinatura HMAC do link, exatamente como
 * numa signed URL de object store. Existe **apenas** para o adaptador local: em produção
 * a URL assinada aponta direto para o Cloud Storage e a API nunca vira proxy de download.
 * Se o adaptador ativo não souber ler bytes, esta rota responde 404.
 */
@Controller('arquivos')
export class ArquivoAssinadoController {
  constructor(
    @Inject(ARMAZENAMENTO_DE_OBJETOS)
    private readonly armazenamento: ArmazenamentoDeObjetos & ArmazenamentoLegivel,
  ) {}

  @Get()
  async baixar(
    @Query('chave') chave: string,
    @Query('expiraEm') expiraEm: string,
    @Query('assinatura') assinatura: string,
    @Res() res: Response,
  ): Promise<void> {
    const { ler, urlEhValida } = this.armazenamento;
    const suportado = typeof ler === 'function' && typeof urlEhValida === 'function';

    // Link expirado, link forjado e adaptador sem download respondem igual: nenhuma
    // dessas respostas confirma ao atacante que a chave existe.
    const naoEncontrado = new NotFoundException({
      code: 'ARQUIVO_NAO_ENCONTRADO',
      message: 'Arquivo não encontrado.',
    });

    if (
      !suportado ||
      !urlEhValida.call(this.armazenamento, chave ?? '', Number(expiraEm), assinatura ?? '')
    ) {
      throw naoEncontrado;
    }

    const conteudo = await ler.call(this.armazenamento, chave);
    if (!conteudo) {
      throw naoEncontrado;
    }
    res.setHeader('Content-Type', 'application/octet-stream');
    res.send(conteudo);
  }
}
