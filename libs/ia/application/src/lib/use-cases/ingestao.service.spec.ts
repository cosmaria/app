import type { IdGenerator, RegistroDeIdempotenciaRepository } from '@cosmaria/core-application';
import type { DomainEvent } from '@cosmaria/core-domain';
import { DominioDeDado, Fator, type PontoDeSerie } from '@cosmaria/ia-domain';
import type { PontoDeSerieRepository } from '../ports/ia.repositories';
import { IngerirEventoService } from './ingestao.service';

class IdSequencial implements IdGenerator {
  private n = 0;
  gerar(): string {
    return `ponto-${++this.n}`;
  }
}

/** Fake local do repositório (evita depender de ia-infrastructure — ciclo de projeto). */
class FakePontoDeSerieRepository implements PontoDeSerieRepository {
  private readonly pontos: PontoDeSerie[] = [];
  async salvarVarios(pontos: PontoDeSerie[]): Promise<void> {
    this.pontos.push(...pontos);
  }
  async listarPorFator(): Promise<PontoDeSerie[]> {
    return [];
  }
  async contarPorFator(usuarioId: string, dominio: DominioDeDado, fator: Fator): Promise<number> {
    return this.pontos.filter(
      (p) => p.usuarioId === usuarioId && p.dominio === dominio && p.fator === fator,
    ).length;
  }
  async ultimoPorFator(): Promise<PontoDeSerie | null> {
    return null;
  }
}

/** Idempotência em memória — 1ª chave é nova, repetição é rejeitada. */
class MemIdempotencia implements RegistroDeIdempotenciaRepository {
  private vistas = new Set<string>();
  async registrarSeNova(chave: string): Promise<boolean> {
    if (this.vistas.has(chave)) return false;
    this.vistas.add(chave);
    return true;
  }
}

const doseRegistrada = (id: string | undefined): DomainEvent =>
  ({
    id,
    nome: 'DoseRegistrada',
    ocorridoEm: new Date('2026-07-12T00:00:00.000Z'),
    usuarioId: 'u1',
    registroDeUsoId: 'r1',
    usadoEm: new Date('2026-07-12T09:00:00.000Z'),
    quantidade: 10,
  }) as DomainEvent;

describe('IngerirEventoService — idempotência', () => {
  const contar = (repo: FakePontoDeSerieRepository) =>
    repo.contarPorFator('u1', DominioDeDado.MED, Fator.DOSE);

  it('reentrega do mesmo evento (mesmo id) não duplica pontos de série', async () => {
    const repo = new FakePontoDeSerieRepository();
    const svc = new IngerirEventoService(repo, new IdSequencial(), new MemIdempotencia());
    const evento = doseRegistrada('ev-42');

    await svc.ingerir(evento);
    await svc.ingerir(evento); // reentrega (outbox at-least-once)

    expect(await contar(repo)).toBe(1);
  });

  it('caminho síncrono (sem id) segue ingerindo — dedup não se aplica', async () => {
    const repo = new FakePontoDeSerieRepository();
    const svc = new IngerirEventoService(repo, new IdSequencial(), new MemIdempotencia());

    await svc.ingerir(doseRegistrada(undefined));
    await svc.ingerir(doseRegistrada(undefined));

    expect(await contar(repo)).toBe(2);
  });

  it('sem repositório de idempotência, ingere normalmente (compat com testes legados)', async () => {
    const repo = new FakePontoDeSerieRepository();
    const svc = new IngerirEventoService(repo, new IdSequencial());

    await svc.ingerir(doseRegistrada('ev-1'));

    expect(await contar(repo)).toBe(1);
  });
});
