import {
  AcessoNegadoError,
  AssinaturaPremium,
  ChavesDeLimite,
  CicloDeCobranca,
  type DomainEvent,
  LimiteDePlano,
  type Midia,
  MidiaAcimaDoLimiteError,
  MidiaNaoEncontradaError,
  Plano,
  TipoDeMidia,
  TipoDeMidiaNaoSuportadoError,
  tipoDeMidiaDoMime,
} from '@cosmaria/core-domain';
import type { EventPublisher } from '../ports/event-publisher.port';
import type { IdGenerator } from '../ports/id-generator.port';
import type { ArmazenamentoDeObjetos } from '../ports/armazenamento-de-objetos.port';
import type { MidiaRepository } from '../ports/midia.repository';
import type { AssinaturaRepository, LimiteDePlanoRepository } from '../ports/billing.repositories';
import { ResolverAssinaturaService } from './assinatura.use-cases';
import { VerificarLimiteUseCase } from './limites.use-cases';
import {
  ListarMidiaDaEntidadeUseCase,
  ObterUrlDeMidiaUseCase,
  RegistrarMidiaUseCase,
  RemoverMidiaUseCase,
} from './midia.use-cases';

class MidiasFake implements MidiaRepository {
  readonly porId = new Map<string, Midia>();
  salvar(m: Midia): Promise<void> {
    this.porId.set(m.id, m);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<Midia | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  listarPorEntidade(modulo: string, tipoEntidade: string, entidadeId: string): Promise<Midia[]> {
    return Promise.resolve(
      [...this.porId.values()].filter(
        (m) =>
          m.modulo === modulo && m.tipoEntidade === tipoEntidade && m.entidadeId === entidadeId,
      ),
    );
  }
  remover(id: string): Promise<void> {
    this.porId.delete(id);
    return Promise.resolve();
  }
}

class ArmazenamentoFake implements ArmazenamentoDeObjetos {
  readonly objetos = new Map<string, Buffer>();
  salvar(chave: string, conteudo: Buffer): Promise<void> {
    this.objetos.set(chave, conteudo);
    return Promise.resolve();
  }
  gerarUrlAssinada(chave: string, ttl: number): Promise<string> {
    return Promise.resolve(`assinada://${chave}?ttl=${ttl}`);
  }
  remover(chave: string): Promise<void> {
    this.objetos.delete(chave);
    return Promise.resolve();
  }
}

class AssinaturasFake implements AssinaturaRepository {
  readonly porUsuario = new Map<string, AssinaturaPremium>();
  salvar(a: AssinaturaPremium): Promise<void> {
    this.porUsuario.set(a.usuarioId, a);
    return Promise.resolve();
  }
  buscarPorUsuario(usuarioId: string): Promise<AssinaturaPremium | null> {
    return Promise.resolve(this.porUsuario.get(usuarioId) ?? null);
  }
}

class LimitesFake implements LimiteDePlanoRepository {
  private readonly limites = [
    LimiteDePlano.definir({
      id: 'l-1',
      chave: ChavesDeLimite.MIDIA_TAMANHO_MAXIMO_BYTES,
      plano: Plano.GRATUITO,
      valor: 10,
    }),
    LimiteDePlano.definir({
      id: 'l-2',
      chave: ChavesDeLimite.MIDIA_TAMANHO_MAXIMO_BYTES,
      plano: Plano.PREMIUM,
      valor: null,
    }),
  ];
  buscar(plano: Plano, chave: string): Promise<LimiteDePlano | null> {
    return Promise.resolve(
      this.limites.find((l) => l.plano === plano && l.chave === chave) ?? null,
    );
  }
  listarPorPlano(plano: Plano): Promise<LimiteDePlano[]> {
    return Promise.resolve(this.limites.filter((l) => l.plano === plano));
  }
}

class EventosFake implements EventPublisher {
  readonly publicados: DomainEvent[] = [];
  publicar(evento: DomainEvent): Promise<void> {
    this.publicados.push(evento);
    return Promise.resolve();
  }
  nomes(): string[] {
    return this.publicados.map((e) => e.nome);
  }
}

const ids = (): IdGenerator => {
  let n = 0;
  return { gerar: () => `midia-${++n}` };
};

const montar = () => {
  const midias = new MidiasFake();
  const armazenamento = new ArmazenamentoFake();
  const assinaturas = new AssinaturasFake();
  const eventos = new EventosFake();
  const resolver = new ResolverAssinaturaService(assinaturas, ids());
  const verificarLimite = new VerificarLimiteUseCase(resolver, new LimitesFake(), eventos);

  return {
    midias,
    armazenamento,
    assinaturas,
    eventos,
    registrar: new RegistrarMidiaUseCase(midias, armazenamento, verificarLimite, ids()),
    obterUrl: new ObterUrlDeMidiaUseCase(midias, armazenamento),
    listar: new ListarMidiaDaEntidadeUseCase(midias),
    remover: new RemoverMidiaUseCase(midias, armazenamento),
  };
};

const foto = (over: Record<string, unknown> = {}) => ({
  usuarioId: 'u-1',
  modulo: 'grow',
  tipoEntidade: 'planta',
  entidadeId: 'planta-1',
  nomeArquivo: 'foto.jpg',
  tipoConteudo: 'image/jpeg',
  conteudo: Buffer.from('12345'),
  ...over,
});

describe('tipoDeMidiaDoMime (lista fechada, falha fechada)', () => {
  it('aceita os tipos previstos', () => {
    expect(tipoDeMidiaDoMime('image/jpeg')).toBe(TipoDeMidia.IMAGEM);
    expect(tipoDeMidiaDoMime('IMAGE/PNG')).toBe(TipoDeMidia.IMAGEM);
    expect(tipoDeMidiaDoMime('application/pdf')).toBe(TipoDeMidia.DOCUMENTO);
  });

  it('recusa qualquer coisa fora da lista', () => {
    expect(tipoDeMidiaDoMime('image/svg+xml')).toBeNull();
    expect(tipoDeMidiaDoMime('text/html')).toBeNull();
    expect(tipoDeMidiaDoMime('application/x-msdownload')).toBeNull();
  });
});

describe('RegistrarMidiaUseCase (doc 08 §12.1 — capacidade do Core)', () => {
  it('grava o objeto e a linha, sem expor a chave de armazenamento', async () => {
    const c = montar();
    const view = await c.registrar.executar(foto());

    expect(view.midiaId).toBe('midia-1');
    expect(view.tipo).toBe(TipoDeMidia.IMAGEM);
    expect(view).not.toHaveProperty('chaveDeArmazenamento');
    expect(c.armazenamento.objetos.size).toBe(1);
    expect(c.midias.porId.size).toBe(1);
  });

  it('a chave é particionada por usuário — não é adivinhável entre Contas', async () => {
    const c = montar();
    await c.registrar.executar(foto());
    expect([...c.armazenamento.objetos.keys()][0]).toBe('u-1/midia-1');
  });

  it('Grow e Med anexam pela MESMA porta', async () => {
    const c = montar();
    await c.registrar.executar(foto());
    const exame = await c.registrar.executar(
      foto({
        modulo: 'med',
        tipoEntidade: 'tratamento',
        entidadeId: 'trat-1',
        nomeArquivo: 'exame.pdf',
        tipoConteudo: 'application/pdf',
      }),
    );
    expect(exame.tipo).toBe(TipoDeMidia.DOCUMENTO);
    expect(c.midias.porId.size).toBe(2);
  });

  it('recusa MIME fora da lista antes de gravar qualquer byte', async () => {
    const c = montar();
    await expect(c.registrar.executar(foto({ tipoConteudo: 'image/svg+xml' }))).rejects.toThrow(
      TipoDeMidiaNaoSuportadoError,
    );
    expect(c.armazenamento.objetos.size).toBe(0);
  });

  it('barra arquivo acima do limite do gratuito e publica LimitePremiumAtingido', async () => {
    const c = montar();
    await expect(c.registrar.executar(foto({ conteudo: Buffer.alloc(11) }))).rejects.toThrow(
      MidiaAcimaDoLimiteError,
    );

    expect(c.eventos.nomes()).toEqual(['LimitePremiumAtingido']);
    expect(c.armazenamento.objetos.size).toBe(0);
  });

  it('Premium não tem limite de tamanho', async () => {
    const c = montar();
    const assinatura = AssinaturaPremium.criarGratuita({ id: 'a-1', usuarioId: 'u-1' });
    assinatura.iniciarUpgrade({ ciclo: CicloDeCobranca.MENSAL, moeda: 'BRL' });
    assinatura.confirmarPagamento(new Date(Date.now() + 86_400_000));
    await c.assinaturas.salvar(assinatura);

    const view = await c.registrar.executar(foto({ conteudo: Buffer.alloc(1_000) }));
    expect(view.tamanhoBytes).toBe(1_000);
    expect(c.eventos.nomes()).toEqual([]);
  });
});

describe('ObterUrlDeMidiaUseCase', () => {
  it('devolve URL temporária para o dono', async () => {
    const c = montar();
    const { midiaId } = await c.registrar.executar(foto());
    const url = await c.obterUrl.executar({ usuarioId: 'u-1', midiaId });
    expect(url.url).toContain('u-1/midia-1');
    expect(url.expiraEmSegundos).toBeGreaterThan(0);
  });

  it('mídia de outro usuário responde igual a inexistente', async () => {
    const c = montar();
    const { midiaId } = await c.registrar.executar(foto());
    await expect(c.obterUrl.executar({ usuarioId: 'intruso', midiaId })).rejects.toThrow(
      MidiaNaoEncontradaError,
    );
    await expect(c.obterUrl.executar({ usuarioId: 'u-1', midiaId: 'nao-existe' })).rejects.toThrow(
      MidiaNaoEncontradaError,
    );
  });
});

describe('ListarMidiaDaEntidadeUseCase', () => {
  it('lista as mídias de uma entidade, filtrando por posse', async () => {
    const c = montar();
    await c.registrar.executar(foto());
    await c.registrar.executar(foto({ usuarioId: 'u-2' }));

    const doDono = await c.listar.executar({
      usuarioId: 'u-1',
      modulo: 'grow',
      tipoEntidade: 'planta',
      entidadeId: 'planta-1',
    });
    expect(doDono).toHaveLength(1);
    expect(doDono[0].midiaId).toBe('midia-1');
  });
});

describe('RemoverMidiaUseCase', () => {
  it('remove a linha e o objeto', async () => {
    const c = montar();
    const { midiaId } = await c.registrar.executar(foto());
    await c.remover.executar({ usuarioId: 'u-1', midiaId });

    expect(c.midias.porId.size).toBe(0);
    expect(c.armazenamento.objetos.size).toBe(0);
  });

  it('só o dono remove', async () => {
    const c = montar();
    const { midiaId } = await c.registrar.executar(foto());
    await expect(c.remover.executar({ usuarioId: 'intruso', midiaId })).rejects.toThrow(
      AcessoNegadoError,
    );
    expect(c.midias.porId.size).toBe(1);
  });

  it('remover algo inexistente é no-op', async () => {
    const c = montar();
    await expect(
      c.remover.executar({ usuarioId: 'u-1', midiaId: 'nao-existe' }),
    ).resolves.toBeUndefined();
  });
});
