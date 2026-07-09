import type { RegistroDeVinculoDePerfis } from '@cosmaria/core-domain';

export interface VinculoDePerfisRepository {
  salvar(vinculo: RegistroDeVinculoDePerfis): Promise<void>;
  buscarPorId(id: string): Promise<RegistroDeVinculoDePerfis | null>;
  /** O vínculo vigente que contém este perfil, se existir (doc 08: 0—1 por perfil). */
  buscarVigentePorPerfil(perfilId: string): Promise<RegistroDeVinculoDePerfis | null>;
  listarPorUsuario(usuarioId: string): Promise<RegistroDeVinculoDePerfis[]>;
}

export const VINCULO_DE_PERFIS_REPOSITORY = Symbol('VinculoDePerfisRepository');
