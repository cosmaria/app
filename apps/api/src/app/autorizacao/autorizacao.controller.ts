import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ehPermissaoValida, PoliticaDeAutorizacao } from '@cosmaria/core-domain';
import type {
  MinhaAutorizacaoResponse,
  VerificarPermissaoResponse,
} from '@cosmaria/shared-contracts';
import { JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';

/**
 * Endpoints de autorização (doc 04 §11 / doc 04 Artefatos — `GET /autorizacao/verificar`).
 * Exigem autenticação (JwtAuthGuard). Não decidem visibilidade fina de conteúdo —
 * isso é o Motor de Privacidade (doc 04 §12), próxima épica.
 */
@Controller('autorizacao')
@UseGuards(JwtAuthGuard)
export class AutorizacaoController {
  /** O usuário autenticado tem a permissão informada? */
  @Get('verificar')
  verificar(
    @Query('permissao') permissao: string,
    @Req() req: RequestAutenticada,
  ): VerificarPermissaoResponse {
    if (!permissao || !ehPermissaoValida(permissao)) {
      throw new BadRequestException({
        code: 'PERMISSAO_INVALIDA',
        message: 'Permissão desconhecida.',
      });
    }
    const papeis = req.usuario?.papeis ?? [];
    return { permissao, permitido: PoliticaDeAutorizacao.concede(papeis, permissao) };
  }

  /** Papéis e permissões efetivas do próprio usuário autenticado. */
  @Get('eu')
  eu(@Req() req: RequestAutenticada): MinhaAutorizacaoResponse {
    const identidade = req.usuario;
    if (!identidade) {
      // Defensivo: o JwtAuthGuard já garante a identidade antes de chegar aqui.
      throw new UnauthorizedException({ code: 'SESSAO_INVALIDA', message: 'Sessão inválida.' });
    }
    return {
      usuarioId: identidade.usuarioId,
      email: identidade.email,
      papeis: identidade.papeis,
      permissoes: PoliticaDeAutorizacao.permissoesDe(identidade.papeis),
    };
  }
}
