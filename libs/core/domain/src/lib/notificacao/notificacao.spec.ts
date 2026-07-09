import { CanalDeNotificacao, CategoriaDeNotificacao } from './categoria-e-canal';
import { Notificacao, StatusNotificacao } from './notificacao.entity';
import { PoliticaDeDespacho } from './politica-de-despacho';
import { PreferenciaDeNotificacao } from './preferencia-de-notificacao.entity';

const hora = (h: number, m = 0): number => h * 60 + m;

const preferencia = (): PreferenciaDeNotificacao =>
  PreferenciaDeNotificacao.padrao({ id: 'p-1', usuarioId: 'u-1' });

describe('PreferenciaDeNotificacao (doc 04 §15)', () => {
  it('IN_APP nunca sai dos canais, mesmo se o usuário só habilitar push', () => {
    const p = preferencia();
    p.definirCanais(CategoriaDeNotificacao.TAREFA, [CanalDeNotificacao.PUSH]);
    expect(p.canaisDe(CategoriaDeNotificacao.TAREFA)).toContain(CanalDeNotificacao.IN_APP);
  });

  it('categoria sem preferência usa o padrão conservador', () => {
    const p = preferencia();
    // Cobrança e social não invadem o usuário por padrão (doc 07, tom nunca agressivo).
    expect(p.canaisDe(CategoriaDeNotificacao.BILLING)).toEqual([CanalDeNotificacao.IN_APP]);
    expect(p.canaisDe(CategoriaDeNotificacao.SOCIAL)).toEqual([CanalDeNotificacao.IN_APP]);
    // Tarefa e alerta são acionáveis: saem por push.
    expect(p.canaisDe(CategoriaDeNotificacao.TAREFA)).toContain(CanalDeNotificacao.PUSH);
  });

  it('desabilitar todos os canais externos deixa só a Central', () => {
    const p = preferencia();
    p.definirCanais(CategoriaDeNotificacao.TAREFA, []);
    expect(p.canaisDe(CategoriaDeNotificacao.TAREFA)).toEqual([CanalDeNotificacao.IN_APP]);
  });

  describe('horário de silêncio', () => {
    it('sem configuração, nunca silencia', () => {
      expect(preferencia().estaEmSilencio(hora(3))).toBe(false);
    });

    it('intervalo dentro do mesmo dia', () => {
      const p = preferencia();
      p.definirHorarioDeSilencio(hora(13), hora(14));
      expect(p.estaEmSilencio(hora(12, 59))).toBe(false);
      expect(p.estaEmSilencio(hora(13))).toBe(true);
      expect(p.estaEmSilencio(hora(13, 59))).toBe(true);
      expect(p.estaEmSilencio(hora(14))).toBe(false);
    });

    it('intervalo que vira o dia (22:00 → 07:00)', () => {
      const p = preferencia();
      p.definirHorarioDeSilencio(hora(22), hora(7));
      expect(p.estaEmSilencio(hora(23))).toBe(true);
      expect(p.estaEmSilencio(hora(3))).toBe(true);
      expect(p.estaEmSilencio(hora(6, 59))).toBe(true);
      expect(p.estaEmSilencio(hora(7))).toBe(false);
      expect(p.estaEmSilencio(hora(12))).toBe(false);
    });

    it('início igual ao fim não silencia nada (evita silenciar o dia inteiro)', () => {
      const p = preferencia();
      p.definirHorarioDeSilencio(hora(9), hora(9));
      expect(p.estaEmSilencio(hora(9))).toBe(false);
    });

    it('recusa minutos fora do intervalo de um dia', () => {
      expect(() => preferencia().definirHorarioDeSilencio(-1, 60)).toThrow(RangeError);
      expect(() => preferencia().definirHorarioDeSilencio(0, 1440)).toThrow(RangeError);
    });
  });
});

describe('Notificacao (registrada mesmo quando silenciada — doc 04 §15)', () => {
  const criar = (): Notificacao =>
    Notificacao.criar({
      id: 'n-1',
      usuarioId: 'u-1',
      categoria: CategoriaDeNotificacao.TAREFA,
      titulo: 'Regar a planta OG Kush',
      corpo: 'Ambiente Estufa 1 precisa de rega hoje.',
      tituloDiscreto: 'COSMARIA',
      corpoDiscreto: 'Você tem uma tarefa pendente.',
    });

  it('o Modo Discreto nunca deixa vazar nome sensível (doc 01 §15)', () => {
    const n = criar();
    expect(n.conteudo(false).titulo).toContain('OG Kush');
    expect(n.conteudo(true).titulo).not.toContain('OG Kush');
    expect(n.conteudo(true).corpo).not.toContain('Estufa');
  });

  it('sem versão discreta explícita, o fallback é neutro — nunca o conteúdo completo', () => {
    const n = Notificacao.criar({
      id: 'n-2',
      usuarioId: 'u-1',
      categoria: CategoriaDeNotificacao.ALERTA_IA,
      titulo: 'Tratamento de dor crônica',
      corpo: 'Sua dose de CBD está atrasada.',
    });
    expect(n.conteudo(true).titulo).not.toContain('dor');
    expect(n.conteudo(true).corpo).not.toContain('CBD');
  });

  it('silenciar registra sem enviar; nenhuma informação é perdida', () => {
    const n = criar();
    n.marcarSilenciada();
    expect(n.status).toBe(StatusNotificacao.SILENCIADA);
    expect(n.canaisDespachados).toEqual([]);
    expect(n.corpo).toBe('Ambiente Estufa 1 precisa de rega hoje.');
  });

  it('marcar como lida é idempotente', () => {
    const n = criar();
    const primeira = new Date('2026-07-09T10:00:00Z');
    n.marcarLida(primeira);
    n.marcarLida(new Date('2026-07-09T11:00:00Z'));
    expect(n.lidaEm).toEqual(primeira);
    expect(n.ehLida()).toBe(true);
  });
});

describe('PoliticaDeDespacho (doc 04 §15)', () => {
  const decidir = (over: Partial<Parameters<typeof PoliticaDeDespacho.decidir>[0]> = {}) =>
    PoliticaDeDespacho.decidir({
      preferencia: preferencia(),
      categoria: CategoriaDeNotificacao.TAREFA,
      minutosDoDia: hora(12),
      repetida: false,
      ...over,
    });

  it('despacha pelos canais externos habilitados', () => {
    const decisao = decidir();
    expect(decisao.silenciada).toBe(false);
    expect(decisao.canaisExternos).toEqual([CanalDeNotificacao.PUSH]);
  });

  it('nunca devolve IN_APP como canal externo — a Central não é despacho', () => {
    expect(decidir().canaisExternos).not.toContain(CanalDeNotificacao.IN_APP);
  });

  it('silencia por preferência quando não há canal externo habilitado', () => {
    const decisao = decidir({ categoria: CategoriaDeNotificacao.BILLING });
    expect(decisao.silenciada).toBe(true);
    expect(decisao.motivo).toBe('PREFERENCIA');
  });

  it('silencia dentro do horário de silêncio', () => {
    const p = preferencia();
    p.definirHorarioDeSilencio(hora(22), hora(7));
    const decisao = decidir({ preferencia: p, minutosDoDia: hora(3) });
    expect(decisao.silenciada).toBe(true);
    expect(decisao.motivo).toBe('HORARIO_DE_SILENCIO');
  });

  it('anti-spam tem precedência sobre qualquer preferência', () => {
    const decisao = decidir({ repetida: true });
    expect(decisao.silenciada).toBe(true);
    expect(decisao.motivo).toBe('REPETIDA');
  });
});
