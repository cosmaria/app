import type { EventPublisher, IdGenerator } from '@cosmaria/core-application';
import {
  ProdutoNaoEncontradoError,
  RegistroDeUsoNaoEncontradoError,
  SessaoAntesDepois,
  SessaoAntesRegistrada,
  SessaoDepoisRegistrada,
  SessaoJaRegistradaError,
  SessaoNaoEncontradaError,
} from '@cosmaria/med-domain';
import {
  ProdutoRepository,
  RegistroDeUsoRepository,
  SessaoAntesDepoisRepository,
} from '../ports/med.repositories';

export interface SessaoView {
  sessaoId: string;
  registroDeUsoId: string;
  sintomaAlvo: string;
  intensidadeAntes: number;
  intensidadeDepois: number | null;
  /** Variação antes − depois (positivo = melhora). Nulo enquanto o "depois" não veio. */
  variacao: number | null;
  intervaloMinutos: number;
  registradaDepoisEm: string | null;
  criadoEm: string;
}

export const paraSessaoView = (s: SessaoAntesDepois): SessaoView => ({
  sessaoId: s.id,
  registroDeUsoId: s.registroDeUsoId,
  sintomaAlvo: s.sintomaAlvo,
  intensidadeAntes: s.intensidadeAntes,
  intensidadeDepois: s.intensidadeDepois,
  variacao: s.variacao(),
  intervaloMinutos: s.intervaloMinutos,
  registradaDepoisEm: s.registradaDepoisEm ? s.registradaDepoisEm.toISOString() : null,
  criadoEm: s.criadoEm.toISOString(),
});

async function buscarSessaoDoDono(
  repo: SessaoAntesDepoisRepository,
  usuarioId: string,
  sessaoId: string,
): Promise<SessaoAntesDepois> {
  const sessao = await repo.buscarPorId(sessaoId);
  if (!sessao || !sessao.pertenceA(usuarioId)) {
    throw new SessaoNaoEncontradaError();
  }
  return sessao;
}

export interface RegistrarSessaoAntesInput {
  usuarioId: string;
  registroDeUsoId: string;
  sintomaAlvo: string;
  intensidadeAntes: number;
  intervaloMinutos: number;
}

/**
 * `POST /v1/sessoes` — abre a sessão com a medição "antes" (doc 03 §5.4).
 *
 * Ancora numa dose do próprio usuário; recusa se a dose já tem sessão (0—1). Publica
 * `SessaoAntesRegistrada` para Notificações agendar o pedido do "depois".
 */
export class RegistrarSessaoAntesUseCase {
  constructor(
    private readonly sessoes: SessaoAntesDepoisRepository,
    private readonly registros: RegistroDeUsoRepository,
    private readonly produtos: ProdutoRepository,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: RegistrarSessaoAntesInput): Promise<SessaoView> {
    const dose = await this.registros.buscarPorId(input.registroDeUsoId);
    if (!dose || !dose.pertenceA(input.usuarioId)) {
      throw new RegistroDeUsoNaoEncontradoError();
    }
    // Defesa em profundidade: a posse da dose já garante o usuário, mas confirmamos que o
    // produto ainda existe (a dose podia referenciar um produto excluído em corrida).
    const produto = await this.produtos.buscarPorId(dose.produtoId);
    if (!produto || !produto.pertenceA(input.usuarioId)) {
      throw new ProdutoNaoEncontradoError();
    }

    if (await this.sessoes.buscarPorRegistroDeUso(input.registroDeUsoId)) {
      throw new SessaoJaRegistradaError();
    }

    const sessao = SessaoAntesDepois.registrarAntes({ id: this.idGen.gerar(), ...input });
    await this.sessoes.salvar(sessao);
    await this.eventos.publicar(
      new SessaoAntesRegistrada(
        sessao.id,
        sessao.usuarioId,
        sessao.registroDeUsoId,
        sessao.intervaloMinutos,
      ),
    );
    return paraSessaoView(sessao);
  }
}

/** `PUT /v1/sessoes/{id}` — registra o "depois" (monotônico). */
export class RegistrarSessaoDepoisUseCase {
  constructor(
    private readonly sessoes: SessaoAntesDepoisRepository,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: {
    usuarioId: string;
    sessaoId: string;
    intensidadeDepois: number;
  }): Promise<SessaoView> {
    const sessao = await buscarSessaoDoDono(this.sessoes, input.usuarioId, input.sessaoId);
    sessao.registrarDepois(input.intensidadeDepois);
    await this.sessoes.salvar(sessao);
    await this.eventos.publicar(
      new SessaoDepoisRegistrada(
        sessao.id,
        sessao.usuarioId,
        sessao.variacao(),
        // Timestamp clínico do "depois": alinha a série na IA.
        sessao.registradaDepoisEm ?? undefined,
      ),
    );
    return paraSessaoView(sessao);
  }
}

/** `GET /v1/sessoes/{id}`. */
export class ObterSessaoUseCase {
  constructor(private readonly sessoes: SessaoAntesDepoisRepository) {}

  async executar(input: { usuarioId: string; sessaoId: string }): Promise<SessaoView> {
    const sessao = await buscarSessaoDoDono(this.sessoes, input.usuarioId, input.sessaoId);
    return paraSessaoView(sessao);
  }
}
