import {
  ConfiguracaoDeCompartilhamentoAlterada,
  ConsentimentoAlterado,
  ConsentimentoRegistro,
  ContaExclusaoSolicitada,
  type DomainEvent,
  Email,
  SolicitacaoDeExportacao,
  StatusConta,
  StatusExportacao,
  TipoConsentimento,
  type TrilhaDeAuditoria,
  Usuario,
} from '@cosmaria/core-domain';
import type { IdGenerator } from '../ports/id-generator.port';
import type { EventPublisher } from '../ports/event-publisher.port';
import type { ConsentimentoRepository } from '../ports/consentimento.repository';
import type { TrilhaDeAuditoriaRepository } from '../ports/trilha-de-auditoria.repository';
import type { SolicitacaoExportacaoRepository } from '../ports/solicitacao-exportacao.repository';
import type { UsuarioRepository } from '../ports/usuario.repository';
import {
  ListarConsentimentosUseCase,
  RegistrarConsentimentoUseCase,
  RevogarConsentimentoUseCase,
} from './consentimento.use-cases';
import { SolicitarExclusaoContaUseCase, SolicitarExportacaoUseCase } from './conta-lgpd.use-cases';
import { RegistrarNaTrilhaDeAuditoriaService } from './auditoria.use-cases';

class FakeConsentimentoRepo implements ConsentimentoRepository {
  private readonly porId = new Map<string, ConsentimentoRegistro>();
  salvar(r: ConsentimentoRegistro): Promise<void> {
    this.porId.set(r.id, r);
    return Promise.resolve();
  }
  listarPorUsuario(usuarioId: string): Promise<ConsentimentoRegistro[]> {
    return Promise.resolve([...this.porId.values()].filter((r) => r.usuarioId === usuarioId));
  }
  buscarVigente(usuarioId: string, tipo: TipoConsentimento): Promise<ConsentimentoRegistro | null> {
    return Promise.resolve(
      [...this.porId.values()].find(
        (r) => r.usuarioId === usuarioId && r.tipo === tipo && r.estaVigente(),
      ) ?? null,
    );
  }
}
class FakeTrilhaRepo implements TrilhaDeAuditoriaRepository {
  readonly entradas: TrilhaDeAuditoria[] = [];
  registrar(e: TrilhaDeAuditoria): Promise<void> {
    this.entradas.push(e);
    return Promise.resolve();
  }
  listar(limite: number): Promise<TrilhaDeAuditoria[]> {
    return Promise.resolve([...this.entradas].reverse().slice(0, limite));
  }
}
class FakeExportacaoRepo implements SolicitacaoExportacaoRepository {
  readonly porId = new Map<string, SolicitacaoDeExportacao>();
  salvar(s: SolicitacaoDeExportacao): Promise<void> {
    this.porId.set(s.id, s);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<SolicitacaoDeExportacao | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
}
class FakeUsuarioRepo implements UsuarioRepository {
  readonly porId = new Map<string, Usuario>();
  salvar(u: Usuario): Promise<void> {
    this.porId.set(u.id, u);
    return Promise.resolve();
  }
  buscarPorEmail(email: Email): Promise<Usuario | null> {
    return Promise.resolve([...this.porId.values()].find((u) => u.email.equals(email)) ?? null);
  }
  buscarPorId(id: string): Promise<Usuario | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  existeComEmail(): Promise<boolean> {
    return Promise.resolve(false);
  }
}
class FakeIdGen implements IdGenerator {
  private n = 0;
  gerar(): string {
    return `id-${++this.n}`;
  }
}
class FakeEventPublisher implements EventPublisher {
  readonly publicados: DomainEvent[] = [];
  publicar(e: DomainEvent): Promise<void> {
    this.publicados.push(e);
    return Promise.resolve();
  }
}

describe('Consentimento use cases', () => {
  it('concede (publica evento) e é idempotente se já vigente', async () => {
    const repo = new FakeConsentimentoRepo();
    const eventos = new FakeEventPublisher();
    const registrar = new RegistrarConsentimentoUseCase(repo, new FakeIdGen(), eventos);

    const entrada = { usuarioId: 'u1', tipo: TipoConsentimento.COMUNIDADE, versaoTexto: 'v1' };
    const primeiro = await registrar.executar(entrada);
    const segundo = await registrar.executar(entrada);

    expect(primeiro.vigente).toBe(true);
    expect(segundo.vigente).toBe(true);
    expect(eventos.publicados).toHaveLength(1); // não republica se já vigente
    expect(eventos.publicados[0]).toBeInstanceOf(ConsentimentoAlterado);
  });

  it('revoga o vigente e publica ConsentimentoAlterado(concedido=false)', async () => {
    const repo = new FakeConsentimentoRepo();
    const eventos = new FakeEventPublisher();
    await new RegistrarConsentimentoUseCase(
      repo,
      new FakeIdGen(),
      new FakeEventPublisher(),
    ).executar({ usuarioId: 'u1', tipo: TipoConsentimento.COMUNIDADE, versaoTexto: 'v1' });
    await new RevogarConsentimentoUseCase(repo, eventos).executar({
      usuarioId: 'u1',
      tipo: TipoConsentimento.COMUNIDADE,
    });

    const lista = await new ListarConsentimentosUseCase(repo).executar('u1');
    expect(lista[0].vigente).toBe(false);
    expect((eventos.publicados[0] as ConsentimentoAlterado).concedido).toBe(false);
  });
});

describe('Conta LGPD use cases', () => {
  it('exclusão muda status para EM_EXCLUSAO e publica evento', async () => {
    const usuarios = new FakeUsuarioRepo();
    const eventos = new FakeEventPublisher();
    const usuario = Usuario.criar({ id: 'u1', email: Email.criar('a@b.com'), senhaHash: 'h' });
    await usuarios.salvar(usuario);

    await new SolicitarExclusaoContaUseCase(usuarios, eventos).executar('u1');

    expect((await usuarios.buscarPorId('u1'))?.status).toBe(StatusConta.EM_EXCLUSAO);
    expect(eventos.publicados[0]).toBeInstanceOf(ContaExclusaoSolicitada);
  });

  it('exportação cria solicitação PENDENTE e publica evento', async () => {
    const repo = new FakeExportacaoRepo();
    const eventos = new FakeEventPublisher();
    const view = await new SolicitarExportacaoUseCase(repo, new FakeIdGen(), eventos).executar(
      'u1',
    );
    expect(view.status).toBe(StatusExportacao.PENDENTE);
    expect(repo.porId.size).toBe(1);
    expect(eventos.publicados[0].nome).toBe('ExportacaoDadosSolicitada');
  });
});

describe('RegistrarNaTrilhaDeAuditoriaService', () => {
  it('mapeia ConfiguracaoDeCompartilhamentoAlterada para uma entrada de auditoria', async () => {
    const repo = new FakeTrilhaRepo();
    const service = new RegistrarNaTrilhaDeAuditoriaService(repo, new FakeIdGen());

    await service.registrar(
      new ConfiguracaoDeCompartilhamentoAlterada('cfg1', 'autor1', 'grow', 'growlog', 'g1'),
    );

    expect(repo.entradas).toHaveLength(1);
    expect(repo.entradas[0].entidadeAfetada).toBe('ConfiguracaoDeCompartilhamento');
    expect(repo.entradas[0].acao).toBe('ALTERADA');
    expect(repo.entradas[0].autorId).toBe('autor1');
  });

  it('mapeia ConsentimentoAlterado (concedido/revogado)', async () => {
    const repo = new FakeTrilhaRepo();
    const service = new RegistrarNaTrilhaDeAuditoriaService(repo, new FakeIdGen());
    await service.registrar(new ConsentimentoAlterado('u1', TipoConsentimento.COMUNIDADE, true));
    expect(repo.entradas[0].acao).toBe('CONCEDIDO');
  });

  it('ignora eventos não auditados', async () => {
    const repo = new FakeTrilhaRepo();
    const service = new RegistrarNaTrilhaDeAuditoriaService(repo, new FakeIdGen());
    await service.registrar({ nome: 'EventoQualquer', ocorridoEm: new Date() });
    expect(repo.entradas).toHaveLength(0);
  });
});
