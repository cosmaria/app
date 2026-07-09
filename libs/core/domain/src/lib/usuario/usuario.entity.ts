import { Papel } from '../autorizacao/papel';
import { ContaInativaError } from '../errors/auth.errors';
import { Email } from './email.vo';
import { StatusConta } from './status-conta';

export interface UsuarioProps {
  id: string;
  email: Email;
  senhaHash: string;
  status: StatusConta;
  /** Papéis de acesso (RBAC, doc 04 §11). Toda conta nasce com [USUARIO]. */
  papeis: Papel[];
  criadoEm: Date;
}

/**
 * Entidade Usuário (Conta) — doc 08 §12.1.
 * É o agregado central de identidade. Nunca é exposta diretamente à Comunidade
 * (isso é papel do PerfilPublico, em sprints futuras).
 *
 * A entidade NÃO conhece bcrypt/jwt/pg — recebe a senha já em hash (a política de
 * hashing é uma porta da camada de aplicação, implementada na infraestrutura).
 */
export class Usuario {
  private constructor(private readonly props: UsuarioProps) {}

  /** Reconstitui a entidade a partir do repositório (dados já persistidos). */
  static reconstituir(props: UsuarioProps): Usuario {
    return new Usuario(props);
  }

  /** Cria uma nova conta ativa. O id e o hash de senha vêm da camada de aplicação. */
  static criar(params: {
    id: string;
    email: Email;
    senhaHash: string;
    papeis?: Papel[];
    criadoEm?: Date;
  }): Usuario {
    return new Usuario({
      id: params.id,
      email: params.email,
      senhaHash: params.senhaHash,
      status: StatusConta.ATIVO,
      papeis: params.papeis ?? [Papel.USUARIO],
      criadoEm: params.criadoEm ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get senhaHash(): string {
    return this.props.senhaHash;
  }

  get status(): StatusConta {
    return this.props.status;
  }

  get papeis(): Papel[] {
    return [...this.props.papeis];
  }

  get criadoEm(): Date {
    return this.props.criadoEm;
  }

  temPapel(papel: Papel): boolean {
    return this.props.papeis.includes(papel);
  }

  /** Regra de negócio: só uma conta ATIVA pode autenticar (doc 04 §10). */
  garantirQuePodeAutenticar(): void {
    if (this.props.status !== StatusConta.ATIVO) {
      throw new ContaInativaError();
    }
  }

  /**
   * Inicia a exclusão da conta (direito ao esquecimento, doc 04 §21.2).
   * Nunca é um DELETE direto — muda o status para EM_EXCLUSAO; o expurgo real é
   * feito por cada módulo ao reagir ao evento ContaExclusaoSolicitada.
   */
  solicitarExclusao(): void {
    this.props.status = StatusConta.EM_EXCLUSAO;
  }
}
