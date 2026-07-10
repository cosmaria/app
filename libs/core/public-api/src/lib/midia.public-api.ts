import type { MidiaView, UrlDeMidiaView } from '@cosmaria/core-application';

/**
 * Interface pública do Armazenamento de Mídia (doc 04 §16 / doc 14 §10).
 *
 * É por aqui que Grow (fotos de `Planta`) e Med (exames anexados a `Tratamento`) usam a
 * MESMA capacidade — nenhum dos dois implementa upload, assinatura de URL ou limite de
 * plano por conta própria (doc 08 §12.1: "nenhuma lógica de armazenamento é duplicada").
 *
 * Nunca expõe a chave no armazenamento de objetos: o consumidor lida com `midiaId` e
 * recebe URLs assinadas e temporárias.
 */
export interface MidiaPublicApi {
  /** Mídias anexadas a uma entidade do módulo consumidor, filtradas por posse. */
  listarDaEntidade(
    usuarioId: string,
    modulo: string,
    tipoEntidade: string,
    entidadeId: string,
  ): Promise<MidiaView[]>;

  /** URL temporária de leitura. Lança se a mídia não for do usuário. */
  obterUrl(usuarioId: string, midiaId: string): Promise<UrlDeMidiaView>;
}

/** Token de injeção da interface pública de mídia. */
export const MIDIA_PUBLIC_API = Symbol('MidiaPublicApi');
