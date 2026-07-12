import type { DomainEvent } from '@cosmaria/core-domain';
import {
  CorrelacaoCruzadaNaoHabilitadaError,
  DominioDeDado,
  Fator,
  PoliticaDeAgregacao,
  PontoDeSerie,
} from '@cosmaria/ia-domain';
import type { JanelaTemporal, PontoDeSerieRepository } from '../ports/ia.repositories';
import type { VinculoGrowMedRepository } from '../ports/vinculo-grow-med.repository';
import { CalcularCorrelacaoCruzadaUseCase } from './correlacao-cruzada.use-cases';
import { RegistrarVinculoGrowMedService } from './vinculo-grow-med.service';

class VinculosFake implements VinculoGrowMedRepository {
  private readonly set = new Set<string>();
  async registrar(usuarioId: string, produtoId: string): Promise<void> {
    this.set.add(`${usuarioId}:${produtoId}`);
  }
  async remover(usuarioId: string, produtoId: string): Promise<void> {
    this.set.delete(`${usuarioId}:${produtoId}`);
  }
  async temVinculo(usuarioId: string): Promise<boolean> {
    return [...this.set].some((k) => k.startsWith(`${usuarioId}:`));
  }
}

class SerieFake implements PontoDeSerieRepository {
  constructor(private readonly pontos: PontoDeSerie[] = []) {}
  async salvarVarios(pontos: PontoDeSerie[]): Promise<void> {
    this.pontos.push(...pontos);
  }
  async listarPorFator(
    usuarioId: string,
    dominio: DominioDeDado,
    fator: Fator,
    _janela?: JanelaTemporal,
  ): Promise<PontoDeSerie[]> {
    return this.pontos.filter(
      (p) => p.usuarioId === usuarioId && p.dominio === dominio && p.fator === fator,
    );
  }
  async contarPorFator(): Promise<number> {
    return 0;
  }
  async ultimoPorFator(): Promise<PontoDeSerie | null> {
    return null;
  }
}

const ponto = (dominio: DominioDeDado, fator: Fator, valor: number, dia: string): PontoDeSerie =>
  PontoDeSerie.registrar({
    id: `${fator}-${dia}`,
    usuarioId: 'u1',
    dominio,
    fator,
    valor,
    ocorridoEm: new Date(`${dia}T12:00:00.000Z`),
    origemId: `${fator}-${dia}`,
  });

const politica = PoliticaDeAgregacao.padrao();

describe('CalcularCorrelacaoCruzadaUseCase', () => {
  it('sem opt-in (sem vínculo) lança CorrelacaoCruzadaNaoHabilitadaError', async () => {
    const uc = new CalcularCorrelacaoCruzadaUseCase(new SerieFake(), new VinculosFake(), politica);
    await expect(
      uc.executar({ usuarioId: 'u1', fatorGrow: Fator.VPD, fatorMed: Fator.DOR }),
    ).rejects.toBeInstanceOf(CorrelacaoCruzadaNaoHabilitadaError);
  });

  it('com opt-in e dias pareados suficientes, correlaciona Grow×Med', async () => {
    const vinculos = new VinculosFake();
    await vinculos.registrar('u1', 'prod-1');

    // 8 dias com VPD (Grow) e DOR (Med) correlacionados positivamente.
    const pontos: PontoDeSerie[] = [];
    for (let i = 1; i <= 8; i++) {
      const dia = `2026-06-0${i}`;
      pontos.push(ponto(DominioDeDado.GROW, Fator.VPD, 1.0 + i * 0.1, dia));
      pontos.push(ponto(DominioDeDado.MED, Fator.DOR, i, dia));
    }
    const uc = new CalcularCorrelacaoCruzadaUseCase(new SerieFake(pontos), vinculos, politica);

    const r = await uc.executar({ usuarioId: 'u1', fatorGrow: Fator.VPD, fatorMed: Fator.DOR });
    expect(r.suficiente).toBe(true);
    expect(r.correlacao?.tamanhoAmostra).toBe(8);
    expect(r.correlacao?.forca).toBeGreaterThan(0.9);
  });
});

describe('RegistrarVinculoGrowMedService', () => {
  const evento = (nome: string, produtoId: string): DomainEvent =>
    ({ nome, ocorridoEm: new Date(), usuarioId: 'u1', produtoId }) as unknown as DomainEvent;

  it('registra no vínculo e remove no desvínculo (opt-in/opt-out)', async () => {
    const repo = new VinculosFake();
    const service = new RegistrarVinculoGrowMedService(repo);

    await service.processar(evento('ProdutoVinculadoALote', 'p1'));
    expect(await repo.temVinculo('u1')).toBe(true);

    await service.processar(evento('ProdutoDesvinculadoDoLote', 'p1'));
    expect(await repo.temVinculo('u1')).toBe(false);
  });
});
