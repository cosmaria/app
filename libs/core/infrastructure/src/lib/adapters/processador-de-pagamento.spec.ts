import { AssinaturaDePayloadInvalidaError, CicloDeCobranca, Plano } from '@cosmaria/core-domain';
import { InMemoryCacheAdapter } from './in-memory-cache.adapter';
import {
  assinarPayloadWebhook,
  CABECALHO_ASSINATURA,
  ProcessadorDePagamentoHmac,
} from './processador-de-pagamento-hmac';
import { CacheRegistroDeIdempotenciaRepository } from '../persistence/cache-idempotencia.repository';

const SEGREDO = 'segredo-compartilhado';
const corpo = Buffer.from('{"id":"evt-1","tipo":"PAGAMENTO_RECEBIDO","usuarioId":"u-1"}');

describe('ProcessadorDePagamentoHmac (doc 09, arquétipo API-7)', () => {
  const processador = new ProcessadorDePagamentoHmac(SEGREDO);

  it('expõe o cabeçalho de assinatura, mantendo o detalhe do provedor fora do controller', () => {
    expect(processador.nomeDoCabecalhoDeAssinatura()).toBe(CABECALHO_ASSINATURA);
  });

  it('aceita a assinatura correta do corpo bruto', () => {
    const assinatura = assinarPayloadWebhook(corpo, SEGREDO);
    expect(processador.verificarAssinatura(corpo, assinatura)).toBe(true);
  });

  it('recusa assinatura de outro segredo', () => {
    const forjada = assinarPayloadWebhook(corpo, 'segredo-do-atacante');
    expect(processador.verificarAssinatura(corpo, forjada)).toBe(false);
  });

  it('recusa quando o corpo muda, mesmo um único byte', () => {
    const assinatura = assinarPayloadWebhook(corpo, SEGREDO);
    const adulterado = Buffer.from(corpo.toString().replace('u-1', 'u-2'));
    expect(processador.verificarAssinatura(adulterado, assinatura)).toBe(false);
  });

  it('recusa assinatura ausente ou de tamanho diferente', () => {
    expect(processador.verificarAssinatura(corpo, undefined)).toBe(false);
    expect(processador.verificarAssinatura(corpo, 'curta')).toBe(false);
  });

  it('sem segredo configurado, recusa TUDO — falha fechada, nunca aberta', () => {
    const semSegredo = new ProcessadorDePagamentoHmac('');
    expect(semSegredo.verificarAssinatura(corpo, assinarPayloadWebhook(corpo, ''))).toBe(false);
  });

  describe('interpretarEvento', () => {
    it('traduz o payload do provedor para o evento de domínio', () => {
      const evento = processador.interpretarEvento({
        id: 'evt-1',
        tipo: 'PAGAMENTO_RECEBIDO',
        usuarioId: 'u-1',
        vigenteAte: '2026-08-09T12:00:00.000Z',
      });
      expect(evento.eventoExternoId).toBe('evt-1');
      expect(evento.tipo).toBe('PAGAMENTO_RECEBIDO');
      expect(evento.vigenteAte).toEqual(new Date('2026-08-09T12:00:00.000Z'));
    });

    it('recusa payload assinado porém malformado — não adivinha a quem creditar', () => {
      expect(() => processador.interpretarEvento({ id: 'evt-1' })).toThrow(
        AssinaturaDePayloadInvalidaError,
      );
      expect(() =>
        processador.interpretarEvento({ id: 'e', tipo: 'DESCONHECIDO', usuarioId: 'u' }),
      ).toThrow(AssinaturaDePayloadInvalidaError);
    });
  });

  it('criarCheckout não concede Premium — só devolve a sessão de cobrança', async () => {
    const checkout = await processador.criarCheckout({
      usuarioId: 'u-1',
      plano: Plano.PREMIUM,
      ciclo: CicloDeCobranca.MENSAL,
      moeda: 'BRL',
      valorCentavos: 2990,
      cupomCodigo: 'BEMVINDO',
    });
    expect(checkout.urlCheckout).toContain('cupom=BEMVINDO');
    expect(checkout.referenciaExterna).toContain('u-1');
  });
});

describe('CacheRegistroDeIdempotencia (doc 09 §9)', () => {
  it('a primeira chave é nova; a reentrega, não', async () => {
    const repo = new CacheRegistroDeIdempotenciaRepository(new InMemoryCacheAdapter());
    expect(await repo.registrarSeNova('pagamento:evt-1', 60)).toBe(true);
    expect(await repo.registrarSeNova('pagamento:evt-1', 60)).toBe(false);
    expect(await repo.registrarSeNova('pagamento:evt-2', 60)).toBe(true);
  });

  it('duas entregas simultâneas do mesmo evento: só uma vence', async () => {
    const repo = new CacheRegistroDeIdempotenciaRepository(new InMemoryCacheAdapter());
    const resultados = await Promise.all([
      repo.registrarSeNova('pagamento:evt-x', 60),
      repo.registrarSeNova('pagamento:evt-x', 60),
      repo.registrarSeNova('pagamento:evt-x', 60),
    ]);
    expect(resultados.filter(Boolean)).toHaveLength(1);
  });
});
