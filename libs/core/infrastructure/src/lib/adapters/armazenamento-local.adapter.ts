import { createHmac, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import type { ArmazenamentoDeObjetos } from '@cosmaria/core-application';

/**
 * Armazenamento de objetos em disco local (doc 04 §16, Provider Agnostic — doc 13 §16.1).
 *
 * É o adaptador de desenvolvimento e teste. O adaptador oficial planejado é o Cloud
 * Storage do GCP (doc 13), que implementa esta mesma porta — nenhum caso de uso muda.
 *
 * A "URL assinada" aqui é uma rota da própria API com HMAC e expiração, imitando a
 * semântica do provedor real: link temporário, não adivinhável, sem expor a chave.
 */
export class ArmazenamentoLocalDeObjetos implements ArmazenamentoDeObjetos {
  constructor(
    private readonly diretorioBase: string,
    private readonly segredoAssinatura: string,
    private readonly urlBase: string,
  ) {}

  async salvar(chave: string, conteudo: Buffer, _tipoConteudo: string): Promise<void> {
    const caminho = this.caminhoDe(chave);
    await mkdir(dirname(caminho), { recursive: true });
    await writeFile(caminho, conteudo);
  }

  gerarUrlAssinada(chave: string, ttlSegundos: number): Promise<string> {
    const expiraEm = Math.floor(Date.now() / 1000) + ttlSegundos;
    const assinatura = assinarChaveDeMidia(chave, expiraEm, this.segredoAssinatura);
    const parametros = new URLSearchParams({
      chave,
      expiraEm: String(expiraEm),
      assinatura,
    });
    return Promise.resolve(`${this.urlBase}?${parametros.toString()}`);
  }

  async remover(chave: string): Promise<void> {
    await rm(this.caminhoDe(chave), { force: true });
  }

  /**
   * Fora da porta, de propósito: só o adaptador local precisa que a API sirva os bytes.
   * Em produção a URL assinada aponta direto para o object store, e a API nunca vira
   * proxy de download. É o mesmo padrão do `fechar()` do cache — capacidade de infra,
   * detectada em runtime por quem sabe que ela pode existir.
   */
  async ler(chave: string): Promise<Buffer | null> {
    try {
      return await readFile(this.caminhoDe(chave));
    } catch {
      return null;
    }
  }

  /**
   * Confere a assinatura do link. Fica aqui, e não no controller, porque o esquema de
   * assinatura é detalhe deste adaptador — o Cloud Storage tem o seu próprio, e a
   * camada HTTP não deve conhecer nenhum dos dois.
   */
  urlEhValida(chave: string, expiraEm: number, assinatura: string): boolean {
    return urlDeMidiaEhValida({
      chave,
      expiraEm,
      assinatura,
      segredo: this.segredoAssinatura,
    });
  }

  /**
   * Resolve o caminho e **prova** que ele permanece sob o diretório base: uma chave com
   * `../` escaparia do bucket e escreveria em qualquer lugar do disco.
   */
  private caminhoDe(chave: string): string {
    const base = resolve(this.diretorioBase);
    const caminho = resolve(join(base, chave));
    if (caminho !== base && !caminho.startsWith(base + sep)) {
      throw new Error('Chave de armazenamento inválida.');
    }
    return caminho;
  }
}

/** Assinatura de uma chave + expiração. Usada para gerar e para conferir a URL. */
export function assinarChaveDeMidia(chave: string, expiraEm: number, segredo: string): string {
  return createHmac('sha256', segredo).update(`${chave}:${expiraEm}`).digest('hex');
}

/** Confere a assinatura em tempo constante e valida a expiração. */
export function urlDeMidiaEhValida(params: {
  chave: string;
  expiraEm: number;
  assinatura: string;
  segredo: string;
  agoraSegundos?: number;
}): boolean {
  const agora = params.agoraSegundos ?? Math.floor(Date.now() / 1000);
  if (!Number.isFinite(params.expiraEm) || params.expiraEm < agora) {
    return false;
  }
  const esperada = Buffer.from(assinarChaveDeMidia(params.chave, params.expiraEm, params.segredo));
  const recebida = Buffer.from(params.assinatura);
  return recebida.length === esperada.length && timingSafeEqual(recebida, esperada);
}
