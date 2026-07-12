import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import {
  DoseRegistrada,
  ProdutoNaoEncontradoError,
  RegistroDeUso,
  RegistroDeUsoNaoEncontradoError,
  type UnidadeDeDose,
  type ViaDeAdministracao,
} from '@cosmaria/med-domain';
import {
  ProdutoRepository,
  RegistroDeUsoRepository,
  TratamentoRepository,
} from '../ports/med.repositories';
import { buscarTratamentoDoDono } from './tratamento.use-cases';

export interface RegistroDeUsoView {
  registroDeUsoId: string;
  produtoId: string;
  quantidade: number;
  unidade: UnidadeDeDose;
  via: ViaDeAdministracao;
  usadoEm: string;
  observacoes: string | null;
  criadoEm: string;
}

export const paraRegistroDeUsoView = (r: RegistroDeUso): RegistroDeUsoView => ({
  registroDeUsoId: r.id,
  produtoId: r.produtoId,
  quantidade: r.quantidade,
  unidade: r.unidade,
  via: r.via,
  usadoEm: r.usadoEm.toISOString(),
  observacoes: r.observacoes,
  criadoEm: r.criadoEm.toISOString(),
});

export interface RegistrarUsoInput {
  usuarioId: string;
  produtoId: string;
  quantidade: number;
  unidade: UnidadeDeDose;
  via: ViaDeAdministracao;
  usadoEm?: Date;
  observacoes?: string | null;
}

/**
 * `POST /v1/registros-uso` — registra uma dose (doc 03 §5.2).
 *
 * A dose ancora num produto do próprio usuário. Não exigimos que o tratamento esteja
 * ativo: o paciente pode registrar, atrasado, uma dose que tomou antes de encerrar — o
 * horário (`usadoEm`) é quem posiciona o evento na linha clínica, não o momento do
 * registro. A imutabilidade da série (Arquétipo B) é o que preserva a verdade do histórico.
 */
export class RegistrarUsoUseCase {
  constructor(
    private readonly registros: RegistroDeUsoRepository,
    private readonly produtos: ProdutoRepository,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: RegistrarUsoInput): Promise<RegistroDeUsoView> {
    const produto = await this.produtos.buscarPorId(input.produtoId);
    if (!produto || !produto.pertenceA(input.usuarioId)) {
      throw new ProdutoNaoEncontradoError();
    }

    const registro = RegistroDeUso.registrar({ id: this.idGen.gerar(), ...input });
    await this.registros.salvar(registro);
    await this.eventos.publicar(
      new DoseRegistrada(
        registro.id,
        registro.usuarioId,
        registro.produtoId,
        registro.usadoEm,
        registro.quantidade,
      ),
    );
    return paraRegistroDeUsoView(registro);
  }
}

/** `GET /v1/produtos/{id}/registros-uso` — doses de um produto (mais recentes primeiro). */
export class ListarUsosDoProdutoUseCase {
  constructor(
    private readonly registros: RegistroDeUsoRepository,
    private readonly produtos: ProdutoRepository,
  ) {}

  async executar(input: { usuarioId: string; produtoId: string }): Promise<RegistroDeUsoView[]> {
    const produto = await this.produtos.buscarPorId(input.produtoId);
    if (!produto || !produto.pertenceA(input.usuarioId)) {
      throw new ProdutoNaoEncontradoError();
    }
    const registros = await this.registros.listarPorProduto(input.produtoId);
    return registros.map(paraRegistroDeUsoView);
  }
}

/** `GET /v1/tratamentos/{id}/registros-uso` — todas as doses de um tratamento. */
export class ListarUsosDoTratamentoUseCase {
  constructor(
    private readonly registros: RegistroDeUsoRepository,
    private readonly tratamentos: TratamentoRepository,
  ) {}

  async executar(input: { usuarioId: string; tratamentoId: string }): Promise<RegistroDeUsoView[]> {
    await buscarTratamentoDoDono(this.tratamentos, input.usuarioId, input.tratamentoId);
    const registros = await this.registros.listarPorTratamento(input.tratamentoId);
    return registros.map(paraRegistroDeUsoView);
  }
}

/** `GET /v1/registros-uso/{id}`. */
export class ObterUsoUseCase {
  constructor(private readonly registros: RegistroDeUsoRepository) {}

  async executar(input: {
    usuarioId: string;
    registroDeUsoId: string;
  }): Promise<RegistroDeUsoView> {
    const registro = await this.registros.buscarPorId(input.registroDeUsoId);
    if (!registro || !registro.pertenceA(input.usuarioId)) {
      throw new RegistroDeUsoNaoEncontradoError();
    }
    return paraRegistroDeUsoView(registro);
  }
}
