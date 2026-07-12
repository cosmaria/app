import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import {
  EfeitoRegistrado,
  RegistroDeEfeito,
  RegistroDeUsoNaoEncontradoError,
  type TipoDeEfeito,
} from '@cosmaria/med-domain';
import { EfeitoRepository, RegistroDeUsoRepository } from '../ports/med.repositories';

export interface EfeitoView {
  efeitoId: string;
  registroDeUsoId: string;
  tipo: TipoDeEfeito;
  descricao: string;
  intensidade: number | null;
  duracaoMinutos: number | null;
  registradoEm: string;
}

export const paraEfeitoView = (e: RegistroDeEfeito): EfeitoView => ({
  efeitoId: e.id,
  registroDeUsoId: e.registroDeUsoId,
  tipo: e.tipo,
  descricao: e.descricao,
  intensidade: e.intensidade,
  duracaoMinutos: e.duracaoMinutos,
  registradoEm: e.registradoEm.toISOString(),
});

export interface RegistrarEfeitoInput {
  usuarioId: string;
  registroDeUsoId: string;
  tipo: TipoDeEfeito;
  descricao: string;
  intensidade?: number | null;
  duracaoMinutos?: number | null;
  registradoEm?: Date;
}

/** `POST /v1/efeitos` — efeito positivo/adverso de uma dose (doc 03 §5.5). */
export class RegistrarEfeitoUseCase {
  constructor(
    private readonly efeitos: EfeitoRepository,
    private readonly registros: RegistroDeUsoRepository,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: RegistrarEfeitoInput): Promise<EfeitoView> {
    const dose = await this.registros.buscarPorId(input.registroDeUsoId);
    if (!dose || !dose.pertenceA(input.usuarioId)) {
      throw new RegistroDeUsoNaoEncontradoError();
    }
    const efeito = RegistroDeEfeito.registrar({ id: this.idGen.gerar(), ...input });
    await this.efeitos.salvar(efeito);
    await this.eventos.publicar(
      new EfeitoRegistrado(
        efeito.id,
        efeito.usuarioId,
        efeito.registroDeUsoId,
        efeito.tipo,
        efeito.intensidade,
        // Timestamp clínico (não o de publicação): alinha a série na IA.
        efeito.registradoEm,
      ),
    );
    return paraEfeitoView(efeito);
  }
}

/** `GET /v1/registros-uso/{id}/efeitos` — efeitos de uma dose do próprio usuário. */
export class ListarEfeitosDaDoseUseCase {
  constructor(
    private readonly efeitos: EfeitoRepository,
    private readonly registros: RegistroDeUsoRepository,
  ) {}

  async executar(input: { usuarioId: string; registroDeUsoId: string }): Promise<EfeitoView[]> {
    const dose = await this.registros.buscarPorId(input.registroDeUsoId);
    if (!dose || !dose.pertenceA(input.usuarioId)) {
      throw new RegistroDeUsoNaoEncontradoError();
    }
    const lista = await this.efeitos.listarPorRegistroDeUso(input.registroDeUsoId);
    return lista.map(paraEfeitoView);
  }
}
