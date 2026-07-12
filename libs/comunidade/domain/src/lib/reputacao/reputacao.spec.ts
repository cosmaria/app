import { ContextoDeApp } from '@cosmaria/core-domain';
import { calcularReputacao, PESOS_REPUTACAO } from './reputacao';

describe('calcularReputacao', () => {
  it('pontua com os pesos do MVP (fork pesa mais que curtida)', () => {
    const r = calcularReputacao('perfil-1', ContextoDeApp.GROW, {
      seguidores: 3,
      publicacoes: 2,
      curtidasRecebidas: 10,
      comentariosRecebidos: 4,
      forksRecebidos: 2,
    });
    const esperado =
      3 * PESOS_REPUTACAO.seguidor +
      10 * PESOS_REPUTACAO.curtida +
      4 * PESOS_REPUTACAO.comentario +
      2 * PESOS_REPUTACAO.fork;
    expect(r.pontuacao).toBe(esperado);
    expect(r.perfilId).toBe('perfil-1');
    expect(r.contexto).toBe(ContextoDeApp.GROW);
  });

  it('perfil sem sinais tem pontuação zero', () => {
    const r = calcularReputacao('perfil-2', ContextoDeApp.MED, {
      seguidores: 0,
      publicacoes: 0,
      curtidasRecebidas: 0,
      comentariosRecebidos: 0,
      forksRecebidos: 0,
    });
    expect(r.pontuacao).toBe(0);
  });
});
