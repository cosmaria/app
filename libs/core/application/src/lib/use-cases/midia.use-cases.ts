import {
  ChavesDeLimite,
  Midia,
  MidiaAcimaDoLimiteError,
  MidiaNaoEncontradaError,
  type TipoDeMidia,
  TipoDeMidiaNaoSuportadoError,
  tipoDeMidiaDoMime,
} from '@cosmaria/core-domain';
import { IdGenerator } from '../ports/id-generator.port';
import {
  ArmazenamentoDeObjetos,
  TTL_URL_ASSINADA_SEGUNDOS,
} from '../ports/armazenamento-de-objetos.port';
import { MidiaRepository } from '../ports/midia.repository';
import { VerificarLimiteUseCase } from './limites.use-cases';

export interface MidiaView {
  midiaId: string;
  tipo: TipoDeMidia;
  nomeArquivo: string;
  tipoConteudo: string;
  tamanhoBytes: number;
  modulo: string;
  tipoEntidade: string;
  entidadeId: string | null;
  criadoEm: string;
}

/** A chave de armazenamento NUNCA sai daqui — o cliente só recebe `midiaId` e URL assinada. */
const paraMidiaView = (m: Midia): MidiaView => ({
  midiaId: m.id,
  tipo: m.tipo,
  nomeArquivo: m.nomeArquivo,
  tipoConteudo: m.tipoConteudo,
  tamanhoBytes: m.tamanhoBytes,
  modulo: m.modulo,
  tipoEntidade: m.tipoEntidade,
  entidadeId: m.entidadeId,
  criadoEm: m.criadoEm.toISOString(),
});

export interface RegistrarMidiaInput {
  usuarioId: string;
  modulo: string;
  tipoEntidade: string;
  entidadeId?: string | null;
  nomeArquivo: string;
  tipoConteudo: string;
  conteudo: Buffer;
}

/**
 * `POST /v1/midia` — capacidade genérica do Core (doc 08 §12.1): Grow e Med anexam pela
 * MESMA porta, sem duplicar lógica de armazenamento.
 *
 * O limite de tamanho reusa o gate de Premium (`VerificarLimiteUseCase`) em vez de uma
 * regra própria: é o mesmo `LimiteDePlano` configurável do doc 07, e barrar aqui publica
 * `LimitePremiumAtingido`, que já dispara paywall e notificação. Nenhuma constante nova.
 */
export class RegistrarMidiaUseCase {
  constructor(
    private readonly repo: MidiaRepository,
    private readonly armazenamento: ArmazenamentoDeObjetos,
    private readonly verificarLimite: VerificarLimiteUseCase,
    private readonly idGen: IdGenerator,
  ) {}

  async executar(input: RegistrarMidiaInput): Promise<MidiaView> {
    const tipo = tipoDeMidiaDoMime(input.tipoConteudo);
    if (!tipo) {
      throw new TipoDeMidiaNaoSuportadoError(input.tipoConteudo);
    }

    const tamanhoBytes = input.conteudo.byteLength;
    const limite = await this.verificarLimite.executar({
      usuarioId: input.usuarioId,
      chave: ChavesDeLimite.MIDIA_TAMANHO_MAXIMO_BYTES,
      usoAtual: tamanhoBytes,
    });
    if (!limite.permitido) {
      throw new MidiaAcimaDoLimiteError(tamanhoBytes, limite.limite as number);
    }

    const id = this.idGen.gerar();
    // Chave particionada por usuário: um vazamento de chave de outro usuário não é
    // adivinhável, e a remoção em massa de uma Conta vira um prefixo só.
    const chaveDeArmazenamento = `${input.usuarioId}/${id}`;

    // Grava o binário ANTES da linha: uma linha apontando para um objeto inexistente
    // seria pior do que um objeto órfão, que um expurgo por prefixo recolhe depois.
    await this.armazenamento.salvar(chaveDeArmazenamento, input.conteudo, input.tipoConteudo);

    const midia = Midia.registrar({
      id,
      usuarioId: input.usuarioId,
      modulo: input.modulo,
      tipoEntidade: input.tipoEntidade,
      entidadeId: input.entidadeId,
      tipo,
      nomeArquivo: input.nomeArquivo,
      tipoConteudo: input.tipoConteudo,
      tamanhoBytes,
      chaveDeArmazenamento,
    });
    await this.repo.salvar(midia);
    return paraMidiaView(midia);
  }
}

export interface UrlDeMidiaView {
  midiaId: string;
  url: string;
  expiraEmSegundos: number;
}

/** `GET /v1/midia/{id}` — devolve URL assinada temporária, nunca o binário nem a chave. */
export class ObterUrlDeMidiaUseCase {
  constructor(
    private readonly repo: MidiaRepository,
    private readonly armazenamento: ArmazenamentoDeObjetos,
  ) {}

  async executar(input: { usuarioId: string; midiaId: string }): Promise<UrlDeMidiaView> {
    const midia = await this.repo.buscarPorId(input.midiaId);
    // Mídia de outro usuário responde igual a inexistente — não confirma existência.
    if (!midia || !midia.pertenceA(input.usuarioId)) {
      throw new MidiaNaoEncontradaError();
    }
    const url = await this.armazenamento.gerarUrlAssinada(
      midia.chaveDeArmazenamento,
      TTL_URL_ASSINADA_SEGUNDOS,
    );
    return { midiaId: midia.id, url, expiraEmSegundos: TTL_URL_ASSINADA_SEGUNDOS };
  }
}

/** Mídias anexadas a uma entidade (Planta no Grow, Tratamento/exame no Med). */
export class ListarMidiaDaEntidadeUseCase {
  constructor(private readonly repo: MidiaRepository) {}

  async executar(input: {
    usuarioId: string;
    modulo: string;
    tipoEntidade: string;
    entidadeId: string;
  }): Promise<MidiaView[]> {
    const midias = await this.repo.listarPorEntidade(
      input.modulo,
      input.tipoEntidade,
      input.entidadeId,
    );
    // Filtro por posse: listar por entidade nunca vaza mídia de outra Conta.
    return midias.filter((m) => m.pertenceA(input.usuarioId)).map(paraMidiaView);
  }
}

/** `DELETE /v1/midia/{id}` — remove o objeto e a linha. Idempotente. */
export class RemoverMidiaUseCase {
  constructor(
    private readonly repo: MidiaRepository,
    private readonly armazenamento: ArmazenamentoDeObjetos,
  ) {}

  async executar(input: { usuarioId: string; midiaId: string }): Promise<void> {
    const midia = await this.repo.buscarPorId(input.midiaId);
    if (!midia) {
      return;
    }
    midia.garantirAutoria(input.usuarioId);

    // Linha primeiro: se o objeto falhar em sumir, sobra lixo no bucket — nunca uma
    // referência viva para um arquivo que o usuário mandou apagar.
    await this.repo.remover(midia.id);
    await this.armazenamento.remover(midia.chaveDeArmazenamento);
  }
}
