import type { ConsentimentoRegistro, TipoConsentimento } from '@cosmaria/core-domain';

export interface ConsentimentoRepository {
  salvar(registro: ConsentimentoRegistro): Promise<void>;
  listarPorUsuario(usuarioId: string): Promise<ConsentimentoRegistro[]>;
  /** O consentimento vigente (não revogado) daquele tipo, se existir. */
  buscarVigente(usuarioId: string, tipo: TipoConsentimento): Promise<ConsentimentoRegistro | null>;
}

export const CONSENTIMENTO_REPOSITORY = Symbol('ConsentimentoRepository');
