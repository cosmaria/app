import {
  ConsentimentoAlterado,
  ConsentimentoRegistro,
  type TipoConsentimento,
} from '@cosmaria/core-domain';
import { IdGenerator } from '../ports/id-generator.port';
import { EventPublisher } from '../ports/event-publisher.port';
import { ConsentimentoRepository } from '../ports/consentimento.repository';

export interface ConsentimentoView {
  tipo: TipoConsentimento;
  versaoTexto: string;
  concedidoEm: string;
  revogadoEm: string | null;
  vigente: boolean;
}

const paraView = (c: ConsentimentoRegistro): ConsentimentoView => ({
  tipo: c.tipo,
  versaoTexto: c.versaoTexto,
  concedidoEm: c.concedidoEm.toISOString(),
  revogadoEm: c.revogadoEm ? c.revogadoEm.toISOString() : null,
  vigente: c.estaVigente(),
});

/** Concede um consentimento (idempotente: se já vigente, devolve o existente). */
export class RegistrarConsentimentoUseCase {
  constructor(
    private readonly repo: ConsentimentoRepository,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: {
    usuarioId: string;
    tipo: TipoConsentimento;
    versaoTexto: string;
  }): Promise<ConsentimentoView> {
    const vigente = await this.repo.buscarVigente(input.usuarioId, input.tipo);
    if (vigente) {
      return paraView(vigente);
    }
    const registro = ConsentimentoRegistro.conceder({
      id: this.idGen.gerar(),
      usuarioId: input.usuarioId,
      tipo: input.tipo,
      versaoTexto: input.versaoTexto,
    });
    await this.repo.salvar(registro);
    await this.eventos.publicar(new ConsentimentoAlterado(input.usuarioId, input.tipo, true));
    return paraView(registro);
  }
}

/** Revoga o consentimento vigente de um tipo (idempotente: no-op se não houver). */
export class RevogarConsentimentoUseCase {
  constructor(
    private readonly repo: ConsentimentoRepository,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: { usuarioId: string; tipo: TipoConsentimento }): Promise<void> {
    const vigente = await this.repo.buscarVigente(input.usuarioId, input.tipo);
    if (!vigente) {
      return;
    }
    vigente.revogar();
    await this.repo.salvar(vigente);
    await this.eventos.publicar(new ConsentimentoAlterado(input.usuarioId, input.tipo, false));
  }
}

/** Lista todos os consentimentos do usuário (direito de acesso — doc 09 GET /consentimento). */
export class ListarConsentimentosUseCase {
  constructor(private readonly repo: ConsentimentoRepository) {}

  async executar(usuarioId: string): Promise<ConsentimentoView[]> {
    const registros = await this.repo.listarPorUsuario(usuarioId);
    return registros.map(paraView);
  }
}
