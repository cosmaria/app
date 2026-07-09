import {
  type ContextoDeApp,
  PerfilNaoEncontradoError,
  PerfilPublico,
  PerfilPublicoCriado,
} from '@cosmaria/core-domain';
import { EventPublisher } from '../ports/event-publisher.port';
import { IdGenerator } from '../ports/id-generator.port';
import { PerfilPublicoRepository } from '../ports/perfil-publico.repository';
import { type PerfilView, paraPerfilView } from './perfil-view';

/**
 * Criação lazy e idempotente do PerfilPúblico (doc 06 §9): o perfil nasce na primeira
 * interação da Conta com a Comunidade daquele contexto, sem formulário obrigatório.
 *
 * Idempotência é requisito explícito (doc 06, Riscos Técnicos). Não basta "checar e
 * inserir": duas requisições concorrentes passariam pela checagem antes de qualquer
 * escrita. Por isso a decisão de criar é do repositório (`inserirSeNaoExistir`), que a
 * resolve com a chave natural (usuário, contexto) do banco — e só quem realmente criou
 * a linha publica `PerfilPublicoCriado`.
 */
export class ObterOuCriarPerfilPublicoUseCase {
  constructor(
    private readonly repo: PerfilPublicoRepository,
    private readonly idGen: IdGenerator,
    private readonly eventos: EventPublisher,
  ) {}

  async executar(input: { usuarioId: string; contexto: ContextoDeApp }): Promise<PerfilView> {
    const existente = await this.repo.buscarPorUsuarioEContexto(input.usuarioId, input.contexto);
    if (existente) {
      return paraPerfilView(existente);
    }

    const { perfil, criado } = await this.repo.inserirSeNaoExistir(
      PerfilPublico.criar({
        id: this.idGen.gerar(),
        usuarioId: input.usuarioId,
        contexto: input.contexto,
      }),
    );

    if (criado) {
      await this.eventos.publicar(
        new PerfilPublicoCriado(perfil.id, perfil.usuarioId, perfil.contexto),
      );
    }
    return paraPerfilView(perfil);
  }
}

export interface AtualizarPerfilPublicoInput {
  usuarioId: string;
  contexto: ContextoDeApp;
  nomeExibicao?: string | null;
  avatarUrl?: string | null;
  biografia?: string | null;
}

/** Edita a identidade social do próprio perfil naquele contexto (doc 09 `PUT`). */
export class AtualizarPerfilPublicoUseCase {
  constructor(private readonly repo: PerfilPublicoRepository) {}

  async executar(input: AtualizarPerfilPublicoInput): Promise<PerfilView> {
    const perfil = await this.repo.buscarPorUsuarioEContexto(input.usuarioId, input.contexto);
    if (!perfil) {
      throw new PerfilNaoEncontradoError();
    }
    perfil.garantirAutoria(input.usuarioId);
    perfil.atualizar({
      nomeExibicao: input.nomeExibicao,
      avatarUrl: input.avatarUrl,
      biografia: input.biografia,
    });
    await this.repo.salvar(perfil);
    return paraPerfilView(perfil);
  }
}

/**
 * Leitura pública de um perfil por id (o que um terceiro vê na Comunidade).
 * Devolve só a projeção — a Conta dona nunca sai daqui.
 */
export class ObterPerfilPublicoUseCase {
  constructor(private readonly repo: PerfilPublicoRepository) {}

  async executar(perfilId: string): Promise<PerfilView> {
    const perfil = await this.repo.buscarPorId(perfilId);
    if (!perfil) {
      throw new PerfilNaoEncontradoError();
    }
    return paraPerfilView(perfil);
  }
}
