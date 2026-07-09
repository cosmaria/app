import { Email, EmailJaCadastradoError, Usuario } from '@cosmaria/core-domain';
import { IdGenerator } from '../ports/id-generator.port';
import { PasswordHasher } from '../ports/password-hasher.port';
import { UsuarioRepository } from '../ports/usuario.repository';

export interface RegistrarUsuarioInput {
  email: string;
  senha: string;
}

export interface RegistrarUsuarioOutput {
  usuarioId: string;
  email: string;
}

/**
 * Cria uma nova conta ATIVA. Fundação da autenticação — a criação de perfis
 * públicos, onboarding etc. são responsabilidade de sprints futuras.
 */
export class RegistrarUsuarioUseCase {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly hasher: PasswordHasher,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(input: RegistrarUsuarioInput): Promise<RegistrarUsuarioOutput> {
    const email = Email.criar(input.email);

    if (await this.usuarios.existeComEmail(email)) {
      throw new EmailJaCadastradoError();
    }

    const senhaHash = await this.hasher.hash(input.senha);
    const usuario = Usuario.criar({ id: this.idGen.gerar(), email, senhaHash });

    await this.usuarios.salvar(usuario);

    return { usuarioId: usuario.id, email: usuario.email.toString() };
  }
}
