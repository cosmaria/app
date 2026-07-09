import { Email, Usuario } from '@cosmaria/core-domain';

/**
 * Porta de persistência de Usuário. Implementada na infraestrutura (Postgres /
 * in-memory). A aplicação depende desta abstração, nunca do driver de banco (DIP).
 */
export interface UsuarioRepository {
  salvar(usuario: Usuario): Promise<void>;
  buscarPorEmail(email: Email): Promise<Usuario | null>;
  buscarPorId(id: string): Promise<Usuario | null>;
  existeComEmail(email: Email): Promise<boolean>;
}

export const USUARIO_REPOSITORY = Symbol('UsuarioRepository');
