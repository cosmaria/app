import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import {
  Tratamento,
  TratamentoComProdutosError,
  TratamentoCriado,
  TratamentoEncerrado,
  TratamentoNaoEncontradoError,
} from '@cosmaria/med-domain';
import { TratamentoRepository } from '../ports/med.repositories';

export interface TratamentoView {
  tratamentoId: string;
  condicao: string;
  objetivo: string | null;
  medicoResponsavel: string | null;
  status: string;
  iniciadoEm: string;
  encerradoEm: string | null;
  criadoEm: string;
}

/** O `usuarioId` nunca sai na projeção — o dono já é quem faz a requisição. */
export const paraTratamentoView = (t: Tratamento): TratamentoView => ({
  tratamentoId: t.id,
  condicao: t.condicao,
  objetivo: t.objetivo,
  medicoResponsavel: t.medicoResponsavel,
  status: t.status,
  iniciadoEm: t.iniciadoEm.toISOString(),
  encerradoEm: t.encerradoEm ? t.encerradoEm.toISOString() : null,
  criadoEm: t.criadoEm.toISOString(),
});

/**
 * Busca o tratamento garantindo a posse. Tratamento de outro usuário responde igual a
 * inexistente — não confirmamos existência a quem não é dono (dado de saúde, doc 03 §16).
 */
export async function buscarTratamentoDoDono(
  repo: TratamentoRepository,
  usuarioId: string,
  tratamentoId: string,
): Promise<Tratamento> {
  const tratamento = await repo.buscarPorId(tratamentoId);
  if (!tratamento || !tratamento.pertenceA(usuarioId)) {
    throw new TratamentoNaoEncontradoError();
  }
  return tratamento;
}

export interface CriarTratamentoInput {
  usuarioId: string;
  condicao: string;
  objetivo?: string | null;
  medicoResponsavel?: string | null;
  iniciadoEm?: Date;
}

/** `POST /v1/tratamentos` (doc 09). */
export class CriarTratamentoUseCase {
  constructor(
    private readonly repo: TratamentoRepository,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: CriarTratamentoInput): Promise<TratamentoView> {
    const tratamento = Tratamento.criar({ id: this.idGen.gerar(), ...input });
    await this.repo.salvar(tratamento);
    await this.eventos.publicar(new TratamentoCriado(tratamento.id, tratamento.usuarioId));
    return paraTratamentoView(tratamento);
  }
}

/** `GET /v1/tratamentos` — histórico completo do paciente (inclui encerrados). */
export class ListarTratamentosUseCase {
  constructor(private readonly repo: TratamentoRepository) {}

  async executar(usuarioId: string, apenasAtivos = false): Promise<TratamentoView[]> {
    const tratamentos = await this.repo.listarPorUsuario(usuarioId, apenasAtivos);
    return tratamentos.map(paraTratamentoView);
  }
}

/** `GET /v1/tratamentos/{id}`. */
export class ObterTratamentoUseCase {
  constructor(private readonly repo: TratamentoRepository) {}

  async executar(input: { usuarioId: string; tratamentoId: string }): Promise<TratamentoView> {
    const tratamento = await buscarTratamentoDoDono(this.repo, input.usuarioId, input.tratamentoId);
    return paraTratamentoView(tratamento);
  }
}

export interface AtualizarTratamentoInput {
  usuarioId: string;
  tratamentoId: string;
  condicao?: string;
  objetivo?: string | null;
  medicoResponsavel?: string | null;
}

/** `PUT /v1/tratamentos/{id}` — atualização parcial (recusada se já encerrado). */
export class AtualizarTratamentoUseCase {
  constructor(private readonly repo: TratamentoRepository) {}

  async executar(input: AtualizarTratamentoInput): Promise<TratamentoView> {
    const tratamento = await buscarTratamentoDoDono(this.repo, input.usuarioId, input.tratamentoId);
    tratamento.atualizar(input);
    await this.repo.salvar(tratamento);
    return paraTratamentoView(tratamento);
  }
}

/** `POST /v1/tratamentos/{id}/encerrar` — encerra a fase ativa; idempotente. */
export class EncerrarTratamentoUseCase {
  constructor(
    private readonly repo: TratamentoRepository,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: { usuarioId: string; tratamentoId: string }): Promise<TratamentoView> {
    const tratamento = await buscarTratamentoDoDono(this.repo, input.usuarioId, input.tratamentoId);
    const estavaAtivo = tratamento.estaAtivo();
    tratamento.encerrar();
    await this.repo.salvar(tratamento);
    if (estavaAtivo) {
      await this.eventos.publicar(new TratamentoEncerrado(tratamento.id, tratamento.usuarioId));
    }
    return paraTratamentoView(tratamento);
  }
}

/**
 * `DELETE /v1/tratamentos/{id}`.
 *
 * Recusa se o tratamento já tem produtos: apagá-lo apagaria o histórico clínico. Parar um
 * tratamento é encerrá-lo, não excluí-lo (doc 03 §5.1).
 */
export class RemoverTratamentoUseCase {
  constructor(private readonly repo: TratamentoRepository) {}

  async executar(input: { usuarioId: string; tratamentoId: string }): Promise<void> {
    const tratamento = await buscarTratamentoDoDono(this.repo, input.usuarioId, input.tratamentoId);
    if (await this.repo.possuiProdutos(tratamento.id)) {
      throw new TratamentoComProdutosError();
    }
    await this.repo.remover(tratamento.id);
  }
}
