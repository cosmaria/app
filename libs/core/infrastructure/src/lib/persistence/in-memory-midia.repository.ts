import type { ArmazenamentoDeObjetos, MidiaRepository } from '@cosmaria/core-application';
import type { Midia } from '@cosmaria/core-domain';

/** Mesma porta do Postgres (LSP, doc 04 §4). Usado em testes e dev sem banco. */
export class InMemoryMidiaRepository implements MidiaRepository {
  private readonly porId = new Map<string, Midia>();

  salvar(midia: Midia): Promise<void> {
    this.porId.set(midia.id, midia);
    return Promise.resolve();
  }

  buscarPorId(id: string): Promise<Midia | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }

  listarPorEntidade(modulo: string, tipoEntidade: string, entidadeId: string): Promise<Midia[]> {
    return Promise.resolve(
      [...this.porId.values()].filter(
        (m) =>
          m.modulo === modulo && m.tipoEntidade === tipoEntidade && m.entidadeId === entidadeId,
      ),
    );
  }

  remover(id: string): Promise<void> {
    this.porId.delete(id);
    return Promise.resolve();
  }
}

/**
 * Armazenamento de objetos em memória — mesma porta do disco/GCS.
 * Mantém os bytes num Map, para que os testes exercitem o caminho completo sem tocar
 * no sistema de arquivos.
 */
export class InMemoryArmazenamentoDeObjetos implements ArmazenamentoDeObjetos {
  private readonly objetos = new Map<string, Buffer>();

  salvar(chave: string, conteudo: Buffer): Promise<void> {
    this.objetos.set(chave, conteudo);
    return Promise.resolve();
  }

  gerarUrlAssinada(chave: string, ttlSegundos: number): Promise<string> {
    return Promise.resolve(`memoria://${chave}?ttl=${ttlSegundos}`);
  }

  remover(chave: string): Promise<void> {
    this.objetos.delete(chave);
    return Promise.resolve();
  }

  ler(chave: string): Promise<Buffer | null> {
    return Promise.resolve(this.objetos.get(chave) ?? null);
  }

  /** Inspeção em teste — não faz parte da porta. */
  quantidade(): number {
    return this.objetos.size;
  }
}
