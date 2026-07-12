import { ContextoDeApp, Escopo, type DomainEvent } from '@cosmaria/core-domain';
import { PublicacaoComunidade } from '@cosmaria/comunidade-domain';
import type {
  FiltroDeBusca,
  FiltroDeFeed,
  PublicacaoComunidadeRepository,
} from '../ports/comunidade.repositories';
import { ProjetarPublicacaoService } from './projetar-publicacao.service';

/** Repositório de projeção falso — indexa por id e pela referência (modulo+conteudoId). */
class RepoFake implements PublicacaoComunidadeRepository {
  readonly porId = new Map<string, PublicacaoComunidade>();

  async salvar(p: PublicacaoComunidade): Promise<void> {
    this.porId.set(p.id, p);
  }
  async buscarPorId(id: string): Promise<PublicacaoComunidade | null> {
    return this.porId.get(id) ?? null;
  }
  async buscarPorReferencia(
    modulo: string,
    conteudoId: string,
  ): Promise<PublicacaoComunidade | null> {
    for (const p of this.porId.values()) {
      if (p.referencia.modulo === modulo && p.referencia.conteudoId === conteudoId) return p;
    }
    return null;
  }
  async listarFeed(_c: ContextoDeApp, _f: FiltroDeFeed): Promise<PublicacaoComunidade[]> {
    return [...this.porId.values()];
  }
  async buscar(_c: ContextoDeApp, _f: FiltroDeBusca): Promise<PublicacaoComunidade[]> {
    return [...this.porId.values()];
  }
  async ajustarCurtidas(id: string, delta: number): Promise<void> {
    this.porId.get(id)?.ajustarCurtidas(delta);
  }
  async ajustarComentarios(id: string, delta: number): Promise<void> {
    this.porId.get(id)?.ajustarComentarios(delta);
  }
  async somarContadoresRecebidos(): Promise<{
    publicacoes: number;
    curtidas: number;
    comentarios: number;
  }> {
    return { publicacoes: this.porId.size, curtidas: 0, comentarios: 0 };
  }
}

let contador = 0;
const idGen = { gerar: () => `pub-${++contador}` };

const growlogPublicado = (over: Partial<Record<string, unknown>> = {}): DomainEvent =>
  ({
    nome: 'GrowlogPublicado',
    ocorridoEm: new Date('2026-07-01T10:00:00Z'),
    perfilPublicoId: 'perfil-autor',
    contexto: 'GROW',
    modulo: 'grow',
    tipoConteudo: 'ciclo',
    conteudoId: 'ciclo-1',
    escopo: 'PUBLICO',
    titulo: 'Cultivo A',
    resumo: null,
    dimensoes: { genetica: 'White Widow' },
    publicadoEm: new Date('2026-07-01T10:00:00Z'),
    ...over,
  }) as unknown as DomainEvent;

describe('ProjetarPublicacaoService', () => {
  beforeEach(() => {
    contador = 0;
  });

  it('projeta um GrowlogPublicado numa PublicacaoComunidade', async () => {
    const repo = new RepoFake();
    await new ProjetarPublicacaoService(repo, idGen).projetar(growlogPublicado());

    const pub = await repo.buscarPorReferencia('grow', 'ciclo-1');
    expect(pub).not.toBeNull();
    expect(pub?.contexto).toBe(ContextoDeApp.GROW);
    expect(pub?.escopo).toBe(Escopo.PUBLICO);
    expect(pub?.titulo).toBe('Cultivo A');
    expect(pub?.dimensoes).toEqual({ genetica: 'White Widow' });
  });

  it('é idempotente: reprojetar o mesmo conteúdo atualiza, não duplica', async () => {
    const repo = new RepoFake();
    const service = new ProjetarPublicacaoService(repo, idGen);
    await service.projetar(growlogPublicado());
    await service.projetar(growlogPublicado({ titulo: 'Cultivo A (editado)', escopo: 'PRIVADO' }));

    expect(repo.porId.size).toBe(1);
    const pub = await repo.buscarPorReferencia('grow', 'ciclo-1');
    expect(pub?.titulo).toBe('Cultivo A (editado)');
    expect(pub?.escopo).toBe(Escopo.PRIVADO);
  });

  it('ignora evento sem os campos de publicação (duck-typing)', async () => {
    const repo = new RepoFake();
    await new ProjetarPublicacaoService(repo, idGen).projetar({
      nome: 'GrowlogPublicado',
      ocorridoEm: new Date(),
    } as DomainEvent);
    expect(repo.porId.size).toBe(0);
  });

  it('ignora contexto/escopo inválidos', async () => {
    const repo = new RepoFake();
    const service = new ProjetarPublicacaoService(repo, idGen);
    await service.projetar(growlogPublicado({ contexto: 'XPTO' }));
    await service.projetar(growlogPublicado({ conteudoId: 'ciclo-2', escopo: 'INVALIDO' }));
    expect(repo.porId.size).toBe(0);
  });
});
