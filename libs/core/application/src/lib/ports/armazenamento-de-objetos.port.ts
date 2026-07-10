/**
 * Porta de Armazenamento de Objetos (doc 04 §16, Provider Agnostic — doc 13 §16.1).
 *
 * A implementação oficial planejada é o Cloud Storage do GCP (doc 13), mas nada aqui
 * depende disso: o adaptador concreto vive na Infraestrutura e trocá-lo (S3, MinIO,
 * disco local em dev) não toca em nenhum caso de uso.
 *
 * O binário nunca entra no domínio nem no banco relacional — a entidade `Midia` guarda
 * apenas a chave, e o arquivo é servido por **URL assinada e temporária**.
 */
export interface ArmazenamentoDeObjetos {
  /** Grava o objeto sob a chave dada. Sobrescreve se a chave já existir. */
  salvar(chave: string, conteudo: Buffer, tipoConteudo: string): Promise<void>;

  /**
   * URL temporária de leitura. É o único caminho pelo qual um cliente alcança o
   * arquivo: nunca expomos a chave nem servimos o binário pela API.
   */
  gerarUrlAssinada(chave: string, ttlSegundos: number): Promise<string>;

  /** Remove o objeto. No-op se a chave não existir (exclusão é idempotente). */
  remover(chave: string): Promise<void>;
}

export const ARMAZENAMENTO_DE_OBJETOS = Symbol('ArmazenamentoDeObjetos');

/** TTL padrão da URL assinada: curto o bastante para não virar link permanente. */
export const TTL_URL_ASSINADA_SEGUNDOS = 300;
