import { ConsentimentoRegistro } from '../consentimento/consentimento-registro.entity';
import { TipoConsentimento } from '../consentimento/tipo-consentimento';
import { TrilhaDeAuditoria } from '../auditoria/trilha-de-auditoria.entity';
import { SolicitacaoDeExportacao, StatusExportacao } from './solicitacao-de-exportacao.entity';

describe('ConsentimentoRegistro', () => {
  const base = {
    id: 'c1',
    usuarioId: 'u1',
    tipo: TipoConsentimento.TERMOS_DE_USO,
    versaoTexto: 'v1',
  };

  it('nasce vigente e a revogação preserva o histórico (não sobrescreve)', () => {
    const c = ConsentimentoRegistro.conceder(base);
    expect(c.estaVigente()).toBe(true);
    expect(c.revogadoEm).toBeNull();

    c.revogar();
    expect(c.estaVigente()).toBe(false);
    expect(c.revogadoEm).not.toBeNull();

    const dataRevogacao = c.revogadoEm;
    c.revogar(new Date(Date.now() + 10_000)); // idempotente: não muda a primeira data
    expect(c.revogadoEm).toBe(dataRevogacao);
  });
});

describe('TrilhaDeAuditoria', () => {
  it('registra uma entrada com autor e detalhe', () => {
    const entrada = TrilhaDeAuditoria.registrar({
      id: 't1',
      entidadeAfetada: 'ConsentimentoRegistro',
      acao: 'CONCEDIDO',
      autorId: 'u1',
      detalhe: { tipo: 'TERMOS_DE_USO' },
    });
    expect(entrada.entidadeAfetada).toBe('ConsentimentoRegistro');
    expect(entrada.acao).toBe('CONCEDIDO');
    expect(entrada.autorId).toBe('u1');
    expect(entrada.detalhe).toEqual({ tipo: 'TERMOS_DE_USO' });
  });

  it('aceita autor nulo (ação do sistema) e detalhe vazio', () => {
    const entrada = TrilhaDeAuditoria.registrar({ id: 't2', entidadeAfetada: 'X', acao: 'Y' });
    expect(entrada.autorId).toBeNull();
    expect(entrada.detalhe).toEqual({});
  });
});

describe('SolicitacaoDeExportacao', () => {
  it('nasce PENDENTE e transita para PRONTA com link', () => {
    const s = SolicitacaoDeExportacao.criar({ id: 's1', usuarioId: 'u1' });
    expect(s.status).toBe(StatusExportacao.PENDENTE);
    expect(s.urlDownload).toBeNull();

    s.marcarPronta('https://download/x.zip');
    expect(s.status).toBe(StatusExportacao.PRONTA);
    expect(s.urlDownload).toBe('https://download/x.zip');
    expect(s.concluidoEm).not.toBeNull();
  });
});
