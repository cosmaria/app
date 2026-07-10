import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import {
  AtualizarPreferenciaDeComplexidadeUseCase,
  type ComplexidadeView,
  ObterPreferenciaDeComplexidadeUseCase,
} from '@cosmaria/core-application';
import { identidadeDe, JwtAuthGuard, type RequestAutenticada } from '../auth/jwt-auth.guard';
import { AtualizarPreferenciaComplexidadeDto } from './dto/complexidade.dtos';

/**
 * Complexidade Progressiva (doc 09 `GET|PUT /v1/preferencia-complexidade`).
 *
 * Um único fluxo de app, não dois modos (doc 02 §5.0): o `GET` materializa a preferência
 * padrão (essencial) na primeira leitura, e o `PUT` sobe de nível, liga o Modo
 * Especialista ou libera campos avançados um a um.
 */
@Controller('preferencia-complexidade')
@UseGuards(JwtAuthGuard)
export class ComplexidadeController {
  constructor(
    private readonly obter: ObterPreferenciaDeComplexidadeUseCase,
    private readonly atualizar: AtualizarPreferenciaDeComplexidadeUseCase,
  ) {}

  @Get()
  obterPreferencia(@Req() req: RequestAutenticada): Promise<ComplexidadeView> {
    return this.obter.executar(identidadeDe(req).usuarioId);
  }

  @Put()
  atualizarPreferencia(
    @Body() dto: AtualizarPreferenciaComplexidadeDto,
    @Req() req: RequestAutenticada,
  ): Promise<ComplexidadeView> {
    return this.atualizar.executar({
      usuarioId: identidadeDe(req).usuarioId,
      nivel: dto.nivel,
      habilitarCampos: dto.habilitarCampos,
      desabilitarCampos: dto.desabilitarCampos,
    });
  }
}
