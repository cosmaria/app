import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import { RegistroDeSintomaDiario, SintomaDiarioRegistrado } from '@cosmaria/med-domain';
import { SintomaDiarioRepository } from '../ports/med.repositories';

export interface SintomaDiarioView {
  registroId: string;
  humor: number | null;
  ansiedade: number | null;
  dor: number | null;
  sono: number | null;
  apetite: number | null;
  registradoEm: string;
  observacoes: string | null;
}

export const paraSintomaDiarioView = (r: RegistroDeSintomaDiario): SintomaDiarioView => ({
  registroId: r.id,
  humor: r.humor,
  ansiedade: r.ansiedade,
  dor: r.dor,
  sono: r.sono,
  apetite: r.apetite,
  registradoEm: r.registradoEm.toISOString(),
  observacoes: r.observacoes,
});

export interface RegistrarSintomaDiarioInput {
  usuarioId: string;
  humor?: number | null;
  ansiedade?: number | null;
  dor?: number | null;
  sono?: number | null;
  apetite?: number | null;
  registradoEm?: Date;
  observacoes?: string | null;
}

/** `POST /v1/sintomas-diarios` — check-in de linha de base (doc 03 §5.3). */
export class RegistrarSintomaDiarioUseCase {
  constructor(
    private readonly repo: SintomaDiarioRepository,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: RegistrarSintomaDiarioInput): Promise<SintomaDiarioView> {
    // `registrar` lança se nenhuma dimensão foi informada (regra do domínio).
    const registro = RegistroDeSintomaDiario.registrar({ id: this.idGen.gerar(), ...input });
    await this.repo.salvar(registro);
    await this.eventos.publicar(
      new SintomaDiarioRegistrado(
        registro.id,
        registro.usuarioId,
        registro.humor,
        registro.ansiedade,
        registro.dor,
        registro.sono,
        registro.apetite,
        // Timestamp clínico (não o de publicação): é ele que alinha a série na IA.
        registro.registradoEm,
      ),
    );
    return paraSintomaDiarioView(registro);
  }
}

/** `GET /v1/sintomas-diarios?de=&ate=` — linha de base do próprio usuário. */
export class ListarSintomasDiariosUseCase {
  constructor(private readonly repo: SintomaDiarioRepository) {}

  async executar(input: {
    usuarioId: string;
    de?: Date;
    ate?: Date;
  }): Promise<SintomaDiarioView[]> {
    const registros = await this.repo.listarPorUsuario(input.usuarioId, {
      de: input.de,
      ate: input.ate,
    });
    return registros.map(paraSintomaDiarioView);
  }
}
