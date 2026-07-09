import {
  ContaExclusaoSolicitada,
  ExportacaoDadosSolicitada,
  SessaoInvalidaError,
  SolicitacaoDeExportacao,
  type StatusExportacao,
} from '@cosmaria/core-domain';
import { IdGenerator } from '../ports/id-generator.port';
import { EventPublisher } from '../ports/event-publisher.port';
import { UsuarioRepository } from '../ports/usuario.repository';
import { SolicitacaoExportacaoRepository } from '../ports/solicitacao-exportacao.repository';

/** Inicia a exclusão da conta (direito ao esquecimento, doc 04 §21.2). */
export class SolicitarExclusaoContaUseCase {
  constructor(
    private readonly usuarios: UsuarioRepository,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(usuarioId: string): Promise<void> {
    const usuario = await this.usuarios.buscarPorId(usuarioId);
    if (!usuario) {
      throw new SessaoInvalidaError();
    }
    usuario.solicitarExclusao();
    await this.usuarios.salvar(usuario);
    await this.eventos.publicar(new ContaExclusaoSolicitada(usuarioId));
  }
}

export interface ExportacaoView {
  solicitacaoId: string;
  status: StatusExportacao;
  urlDownload: string | null;
}

/** Solicita a exportação/portabilidade dos dados (LGPD Art. 18, doc 04 §21.3). */
export class SolicitarExportacaoUseCase {
  constructor(
    private readonly repo: SolicitacaoExportacaoRepository,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(usuarioId: string): Promise<ExportacaoView> {
    const solicitacao = SolicitacaoDeExportacao.criar({ id: this.idGen.gerar(), usuarioId });
    await this.repo.salvar(solicitacao);
    await this.eventos.publicar(new ExportacaoDadosSolicitada(usuarioId, solicitacao.id));
    return {
      solicitacaoId: solicitacao.id,
      status: solicitacao.status,
      urlDownload: solicitacao.urlDownload,
    };
  }
}

/** Consulta o status/link de uma exportação — só o dono da solicitação (doc 09). */
export class ConsultarExportacaoUseCase {
  constructor(private readonly repo: SolicitacaoExportacaoRepository) {}

  async executar(usuarioId: string, solicitacaoId: string): Promise<ExportacaoView | null> {
    const solicitacao = await this.repo.buscarPorId(solicitacaoId);
    if (!solicitacao || solicitacao.usuarioId !== usuarioId) {
      // Não revela existência de solicitação de outro usuário.
      return null;
    }
    return {
      solicitacaoId: solicitacao.id,
      status: solicitacao.status,
      urlDownload: solicitacao.urlDownload,
    };
  }
}
