import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  AtualizarPerfilPublicoUseCase,
  ObterOuCriarPerfilPublicoUseCase,
  type PerfilView,
} from '@cosmaria/core-application';
import { ContextoDeApp, ehContextoDeAppValido } from '@cosmaria/core-domain';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';
import { AtualizarPerfilDto } from './dto/perfil.dtos';

/**
 * Perfil Público do usuário autenticado, por contexto de aplicativo
 * (doc 06 §4 / doc 09 `GET|PUT /v1/comunidade/perfis/{contexto}`).
 *
 * O `GET` é a **criação implícita** (doc 06 §9): a primeira leitura materializa o
 * perfil, sem formulário obrigatório. Nenhum endpoint aqui aceita ou devolve o id da
 * Conta — só o `perfilId`, opaco e escopado ao contexto.
 */
@Controller('comunidade/perfis')
@UseGuards(JwtAuthGuard)
export class PerfilController {
  constructor(
    private readonly obterOuCriar: ObterOuCriarPerfilPublicoUseCase,
    private readonly atualizar: AtualizarPerfilPublicoUseCase,
  ) {}

  @Get(':contexto')
  obterPerfil(
    @Param('contexto') contexto: string,
    @Req() req: RequestAutenticada,
  ): Promise<PerfilView> {
    return this.obterOuCriar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      contexto: normalizarContexto(contexto),
    });
  }

  @Put(':contexto')
  atualizarPerfil(
    @Param('contexto') contexto: string,
    @Body() dto: AtualizarPerfilDto,
    @Req() req: RequestAutenticada,
  ): Promise<PerfilView> {
    return this.atualizar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      contexto: normalizarContexto(contexto),
      nomeExibicao: dto.nomeExibicao,
      avatarUrl: dto.avatarUrl,
      biografia: dto.biografia,
    });
  }
}

/** Aceita `grow`/`GROW` na URL (doc 09 usa minúsculas) e normaliza para o enum do domínio. */
export function normalizarContexto(valor: string): ContextoDeApp {
  const normalizado = valor.toUpperCase();
  if (!ehContextoDeAppValido(normalizado)) {
    throw new BadRequestException({
      code: 'CONTEXTO_INVALIDO',
      message: 'Contexto de aplicativo desconhecido.',
    });
  }
  return normalizado;
}
