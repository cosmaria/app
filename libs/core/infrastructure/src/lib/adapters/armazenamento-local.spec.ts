import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  ArmazenamentoLocalDeObjetos,
  assinarChaveDeMidia,
  urlDeMidiaEhValida,
} from './armazenamento-local.adapter';

const SEGREDO = 'segredo-de-midia';
const URL_BASE = 'http://localhost:3000/v1/arquivos';

describe('ArmazenamentoLocalDeObjetos (doc 04 §16)', () => {
  let base = '';
  let armazenamento: ArmazenamentoLocalDeObjetos;

  beforeEach(async () => {
    base = await mkdtemp(join(tmpdir(), 'cosmaria-midia-'));
    armazenamento = new ArmazenamentoLocalDeObjetos(base, SEGREDO, URL_BASE);
  });

  afterEach(async () => {
    await rm(base, { recursive: true, force: true });
  });

  it('grava, lê e remove o objeto', async () => {
    await armazenamento.salvar('u-1/m-1', Buffer.from('conteudo'), 'image/jpeg');
    expect(await readFile(join(base, 'u-1', 'm-1'), 'utf8')).toBe('conteudo');
    expect((await armazenamento.ler('u-1/m-1'))?.toString()).toBe('conteudo');

    await armazenamento.remover('u-1/m-1');
    expect(await armazenamento.ler('u-1/m-1')).toBeNull();
  });

  it('remover objeto inexistente é no-op', async () => {
    await expect(armazenamento.remover('nao/existe')).resolves.toBeUndefined();
  });

  it('recusa chave que escapa do diretório base (path traversal)', async () => {
    await expect(
      armazenamento.salvar('../../fora.txt', Buffer.from('x'), 'image/jpeg'),
    ).rejects.toThrow('Chave de armazenamento inválida.');
    await expect(armazenamento.ler('../../../etc/passwd')).resolves.toBeNull();
  });

  describe('URL assinada', () => {
    it('gera link com chave, expiração e assinatura', async () => {
      const url = await armazenamento.gerarUrlAssinada('u-1/m-1', 300);
      expect(url).toContain(URL_BASE);
      expect(url).toContain('chave=u-1%2Fm-1');
      expect(url).toContain('assinatura=');
    });

    it('valida o próprio link que gerou', async () => {
      const url = new URL(await armazenamento.gerarUrlAssinada('u-1/m-1', 300));
      const chave = url.searchParams.get('chave') as string;
      const expiraEm = Number(url.searchParams.get('expiraEm'));
      const assinatura = url.searchParams.get('assinatura') as string;

      expect(armazenamento.urlEhValida(chave, expiraEm, assinatura)).toBe(true);
    });

    it('recusa link expirado', () => {
      const expirado = Math.floor(Date.now() / 1000) - 1;
      const assinatura = assinarChaveDeMidia('u-1/m-1', expirado, SEGREDO);
      expect(armazenamento.urlEhValida('u-1/m-1', expirado, assinatura)).toBe(false);
    });

    it('recusa assinatura de outro segredo, e para outra chave', () => {
      const expiraEm = Math.floor(Date.now() / 1000) + 300;
      const forjada = assinarChaveDeMidia('u-1/m-1', expiraEm, 'segredo-do-atacante');
      expect(armazenamento.urlEhValida('u-1/m-1', expiraEm, forjada)).toBe(false);

      // Assinatura válida de OUTRA chave não abre esta.
      const deOutraChave = assinarChaveDeMidia('u-2/m-9', expiraEm, SEGREDO);
      expect(armazenamento.urlEhValida('u-1/m-1', expiraEm, deOutraChave)).toBe(false);
    });

    it('recusa assinatura ausente, vazia ou de tamanho diferente', () => {
      const expiraEm = Math.floor(Date.now() / 1000) + 300;
      expect(armazenamento.urlEhValida('u-1/m-1', expiraEm, '')).toBe(false);
      expect(armazenamento.urlEhValida('u-1/m-1', expiraEm, 'curta')).toBe(false);
    });

    it('recusa expiração não numérica', () => {
      expect(
        urlDeMidiaEhValida({ chave: 'k', expiraEm: NaN, assinatura: 'x', segredo: SEGREDO }),
      ).toBe(false);
    });
  });
});
