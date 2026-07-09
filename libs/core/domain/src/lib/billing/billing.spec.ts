import {
  AssinaturaJaAtivaError,
  AssinaturaNaoPremiumError,
  CupomInvalidoError,
} from '../errors/billing.errors';
import { AssinaturaPremium } from './assinatura-premium.entity';
import { CupomOuPromocao, TipoDeDesconto } from './cupom-ou-promocao.entity';
import { LimiteDePlano } from './limite-de-plano.entity';
import { CicloDeCobranca, Plano } from './plano';
import { StatusAssinatura } from './status-assinatura';

const AGORA = new Date('2026-07-09T12:00:00Z');
const emDias = (dias: number): Date => new Date(AGORA.getTime() + dias * 86_400_000);

const gratuita = (): AssinaturaPremium =>
  AssinaturaPremium.criarGratuita({ id: 'a-1', usuarioId: 'u-1', criadoEm: AGORA });

const upgrade = { ciclo: CicloDeCobranca.MENSAL, moeda: 'BRL' };

describe('AssinaturaPremium (doc 07, doc 08 §12.6)', () => {
  it('toda Conta nasce no plano gratuito, ativo e sem Premium', () => {
    const a = gratuita();
    expect(a.plano).toBe(Plano.GRATUITO);
    expect(a.status).toBe(StatusAssinatura.ATIVA);
    expect(a.ehPremiumAtivo(AGORA)).toBe(false);
    expect(a.planoEfetivo(AGORA)).toBe(Plano.GRATUITO);
  });

  it('nenhum valor monetário mora na assinatura (preço é PrecoRegional)', () => {
    expect(gratuita()).not.toHaveProperty('valorCentavos');
  });

  describe('upgrade', () => {
    it('iniciar upgrade NÃO concede Premium — aguarda o gateway confirmar', () => {
      const a = gratuita();
      a.iniciarUpgrade(upgrade, AGORA);
      expect(a.status).toBe(StatusAssinatura.PENDENTE_PAGAMENTO);
      expect(a.plano).toBe(Plano.PREMIUM);
      expect(a.ehPremiumAtivo(AGORA)).toBe(false);
      expect(a.planoEfetivo(AGORA)).toBe(Plano.GRATUITO);
    });

    it('confirmar pagamento ativa o Premium até o fim do período', () => {
      const a = gratuita();
      a.iniciarUpgrade(upgrade, AGORA);
      a.confirmarPagamento(emDias(30), AGORA);
      expect(a.status).toBe(StatusAssinatura.ATIVA);
      expect(a.ehPremiumAtivo(AGORA)).toBe(true);
      expect(a.iniciadaEm).toEqual(AGORA);
    });

    it('recusa upgrade de quem já tem Premium ativo', () => {
      const a = gratuita();
      a.iniciarUpgrade(upgrade, AGORA);
      a.confirmarPagamento(emDias(30), AGORA);
      expect(() => a.iniciarUpgrade(upgrade, AGORA)).toThrow(AssinaturaJaAtivaError);
    });

    it('permite retentar o upgrade enquanto o pagamento não confirmou', () => {
      const a = gratuita();
      a.iniciarUpgrade(upgrade, AGORA);
      expect(() =>
        a.iniciarUpgrade({ ciclo: CicloDeCobranca.ANUAL, moeda: 'BRL' }, AGORA),
      ).not.toThrow();
      expect(a.cicloDeCobranca).toBe(CicloDeCobranca.ANUAL);
    });
  });

  describe('trial', () => {
    it('concede Premium sem cobrança até o término', () => {
      const a = gratuita();
      a.iniciarTrial({ ...upgrade, terminaEm: emDias(7) }, AGORA);
      expect(a.status).toBe(StatusAssinatura.TRIAL);
      expect(a.ehPremiumAtivo(AGORA)).toBe(true);
    });

    it('expira sozinho quando o período termina', () => {
      const a = gratuita();
      a.iniciarTrial({ ...upgrade, terminaEm: emDias(7) }, AGORA);
      expect(a.ehPremiumAtivo(emDias(8))).toBe(false);
      expect(a.planoEfetivo(emDias(8))).toBe(Plano.GRATUITO);
    });
  });

  describe('cancelamento gentil (doc 07 §9)', () => {
    it('mantém o Premium até o fim do período já pago', () => {
      const a = gratuita();
      a.iniciarUpgrade(upgrade, AGORA);
      a.confirmarPagamento(emDias(30), AGORA);
      a.cancelar(emDias(1));

      expect(a.status).toBe(StatusAssinatura.CANCELADA);
      expect(a.ehPremiumAtivo(emDias(2))).toBe(true);
      expect(a.ehPremiumAtivo(emDias(31))).toBe(false);
    });

    it('após o período, o plano efetivo volta ao gratuito', () => {
      const a = gratuita();
      a.iniciarUpgrade(upgrade, AGORA);
      a.confirmarPagamento(emDias(30), AGORA);
      a.cancelar(emDias(1));
      expect(a.planoEfetivo(emDias(31))).toBe(Plano.GRATUITO);
    });

    it('recusa cancelar quem nunca assinou', () => {
      expect(() => gratuita().cancelar(AGORA)).toThrow(AssinaturaNaoPremiumError);
    });
  });

  describe('falha de pagamento', () => {
    it('suspende o Premium sem apagar nada', () => {
      const a = gratuita();
      a.iniciarUpgrade(upgrade, AGORA);
      a.confirmarPagamento(emDias(30), AGORA);
      a.registrarFalhaDePagamento(emDias(31));

      expect(a.status).toBe(StatusAssinatura.INADIMPLENTE);
      expect(a.ehPremiumAtivo(emDias(31))).toBe(false);
    });

    it('um novo pagamento reativa a assinatura', () => {
      const a = gratuita();
      a.iniciarUpgrade(upgrade, AGORA);
      a.registrarFalhaDePagamento(AGORA);
      a.confirmarPagamento(emDias(30), emDias(1));
      expect(a.ehPremiumAtivo(emDias(1))).toBe(true);
    });
  });

  it('só aplica cupom em assinatura Premium', () => {
    expect(() => gratuita().aplicarCupom('c-1', AGORA)).toThrow(AssinaturaNaoPremiumError);
  });
});

describe('LimiteDePlano (doc 07 §9 — configuração, nunca constante)', () => {
  const limite = (valor: number | null) =>
    LimiteDePlano.definir({
      id: 'l-1',
      chave: 'grow.ambientes_simultaneos',
      plano: Plano.GRATUITO,
      valor,
    });

  it('permite criar enquanto o uso atual é menor que o limite', () => {
    expect(limite(2).permiteMaisUm(0)).toBe(true);
    expect(limite(2).permiteMaisUm(1)).toBe(true);
    expect(limite(2).permiteMaisUm(2)).toBe(false);
    expect(limite(2).permiteMaisUm(5)).toBe(false);
  });

  it('valor nulo significa ilimitado', () => {
    expect(limite(null).ehIlimitado()).toBe(true);
    expect(limite(null).permiteMaisUm(9999)).toBe(true);
  });

  it('limite zero bloqueia qualquer criação', () => {
    expect(limite(0).permiteMaisUm(0)).toBe(false);
  });
});

describe('CupomOuPromocao', () => {
  const cupom = (over: Partial<Parameters<typeof CupomOuPromocao.criar>[0]> = {}) =>
    CupomOuPromocao.criar({
      id: 'c-1',
      codigo: ' bem-vindo ',
      tipoDeDesconto: TipoDeDesconto.PERCENTUAL,
      valor: 20,
      validoDe: AGORA,
      ...over,
    });

  it('normaliza o código para caixa alta, sem espaços', () => {
    expect(cupom().codigo).toBe('BEM-VINDO');
  });

  it('é válido dentro da janela e inválido fora dela', () => {
    const c = cupom({ validoAte: emDias(5) });
    expect(c.estaValido(emDias(1))).toBe(true);
    expect(c.estaValido(emDias(6))).toBe(false);
    expect(c.estaValido(new Date(AGORA.getTime() - 1000))).toBe(false);
  });

  it('esgota ao atingir o teto de usos', () => {
    const c = cupom({ usosMaximos: 1 });
    c.registrarUso(AGORA);
    expect(c.estaValido(AGORA)).toBe(false);
    expect(() => c.registrarUso(AGORA)).toThrow(CupomInvalidoError);
  });

  it('sem teto, nunca esgota', () => {
    const c = cupom();
    c.registrarUso(AGORA);
    c.registrarUso(AGORA);
    expect(c.estaValido(AGORA)).toBe(true);
    expect(c.usosRealizados).toBe(2);
  });
});
