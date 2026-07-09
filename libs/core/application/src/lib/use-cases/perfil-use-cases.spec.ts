import {
  AcessoNegadoError,
  ContextoDeApp,
  type DomainEvent,
  PerfilNaoEncontradoError,
  PerfilPublico,
  RegistroDeVinculoDePerfis,
  VinculoDePerfisDesabilitadoError,
  VinculoDePerfisInvalidoError,
} from '@cosmaria/core-domain';
import type { EventPublisher } from '../ports/event-publisher.port';
import type { FeatureFlags } from '../ports/feature-flags.port';
import type { IdGenerator } from '../ports/id-generator.port';
import type {
  PerfilPublicoRepository,
  ResultadoInsercaoPerfil,
} from '../ports/perfil-publico.repository';
import type { VinculoDePerfisRepository } from '../ports/vinculo-de-perfis.repository';
import {
  AtualizarPerfilPublicoUseCase,
  ObterOuCriarPerfilPublicoUseCase,
  ObterPerfilPublicoUseCase,
} from './perfil-publico.use-cases';
import {
  AutorizarVinculoDePerfisUseCase,
  ListarVinculosDoUsuarioUseCase,
  ObterPerfisVinculadosPublicamenteUseCase,
  RevogarVinculoDePerfisUseCase,
} from './vinculo-de-perfis.use-cases';

class PerfisFake implements PerfilPublicoRepository {
  readonly porId = new Map<string, PerfilPublico>();
  /** Simula a corrida real: a linha já existe quando a inserção chega ao banco. */
  perfilPreExistente: PerfilPublico | null = null;

  async inserirSeNaoExistir(perfil: PerfilPublico): Promise<ResultadoInsercaoPerfil> {
    if (this.perfilPreExistente) {
      const vencedor = this.perfilPreExistente;
      this.perfilPreExistente = null;
      this.porId.set(vencedor.id, vencedor);
      return { perfil: vencedor, criado: false };
    }
    const existente = await this.buscarPorUsuarioEContexto(perfil.usuarioId, perfil.contexto);
    if (existente) {
      return { perfil: existente, criado: false };
    }
    this.porId.set(perfil.id, perfil);
    return { perfil, criado: true };
  }

  salvar(perfil: PerfilPublico): Promise<void> {
    this.porId.set(perfil.id, perfil);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<PerfilPublico | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  buscarPorUsuarioEContexto(
    usuarioId: string,
    contexto: ContextoDeApp,
  ): Promise<PerfilPublico | null> {
    return Promise.resolve(
      [...this.porId.values()].find((p) => p.usuarioId === usuarioId && p.contexto === contexto) ??
        null,
    );
  }
  buscarPorIds(ids: string[]): Promise<PerfilPublico[]> {
    return Promise.resolve(
      ids.map((id) => this.porId.get(id)).filter((p): p is PerfilPublico => !!p),
    );
  }
  listarPorUsuario(usuarioId: string): Promise<PerfilPublico[]> {
    return Promise.resolve([...this.porId.values()].filter((p) => p.usuarioId === usuarioId));
  }
}

class VinculosFake implements VinculoDePerfisRepository {
  readonly porId = new Map<string, RegistroDeVinculoDePerfis>();

  salvar(vinculo: RegistroDeVinculoDePerfis): Promise<void> {
    this.porId.set(vinculo.id, vinculo);
    return Promise.resolve();
  }
  buscarPorId(id: string): Promise<RegistroDeVinculoDePerfis | null> {
    return Promise.resolve(this.porId.get(id) ?? null);
  }
  buscarVigentePorPerfil(perfilId: string): Promise<RegistroDeVinculoDePerfis | null> {
    return Promise.resolve(
      [...this.porId.values()].find((v) => v.estaVigente() && v.contemPerfil(perfilId)) ?? null,
    );
  }
  listarPorUsuario(usuarioId: string): Promise<RegistroDeVinculoDePerfis[]> {
    return Promise.resolve([...this.porId.values()].filter((v) => v.usuarioId === usuarioId));
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

const idsSequenciais = (): IdGenerator => {
  let n = 0;
  return { gerar: () => `id-${++n}` };
};

const flags = (habilitado: boolean): FeatureFlags => ({
  vinculoDePerfisHabilitado: () => habilitado,
});

describe('ObterOuCriarPerfilPublicoUseCase (doc 06 §9)', () => {
  it('cria o perfil na primeira leitura e publica PerfilPublicoCriado', async () => {
    const perfis = new PerfisFake();
    const eventos = new EventosFake();
    const caso = new ObterOuCriarPerfilPublicoUseCase(perfis, idsSequenciais(), eventos);

    const view = await caso.executar({ usuarioId: 'u-1', contexto: ContextoDeApp.GROW });

    expect(view.perfilId).toBe('id-1');
    expect(view.anonimo).toBe(true);
    expect(eventos.nomes()).toEqual(['PerfilPublicoCriado']);
  });

  it('é idempotente: reentrega não duplica perfil nem republica o evento', async () => {
    const perfis = new PerfisFake();
    const eventos = new EventosFake();
    const caso = new ObterOuCriarPerfilPublicoUseCase(perfis, idsSequenciais(), eventos);

    const primeira = await caso.executar({ usuarioId: 'u-1', contexto: ContextoDeApp.GROW });
    const segunda = await caso.executar({ usuarioId: 'u-1', contexto: ContextoDeApp.GROW });

    expect(segunda.perfilId).toBe(primeira.perfilId);
    expect(perfis.porId.size).toBe(1);
    expect(eventos.publicados).toHaveLength(1);
  });

  it('numa corrida, quem perde o INSERT devolve o perfil vencedor e não republica o evento', async () => {
    const perfis = new PerfisFake();
    const eventos = new EventosFake();
    const caso = new ObterOuCriarPerfilPublicoUseCase(perfis, idsSequenciais(), eventos);

    // A linha "aparece" no banco entre a checagem e a inserção (outra requisição venceu).
    perfis.perfilPreExistente = PerfilPublico.criar({
      id: 'perfil-vencedor',
      usuarioId: 'u-1',
      contexto: ContextoDeApp.GROW,
    });

    const view = await caso.executar({ usuarioId: 'u-1', contexto: ContextoDeApp.GROW });

    expect(view.perfilId).toBe('perfil-vencedor');
    expect(perfis.porId.size).toBe(1);
    expect(eventos.publicados).toHaveLength(0);
  });

  it('a mesma Conta tem perfis independentes por contexto', async () => {
    const perfis = new PerfisFake();
    const caso = new ObterOuCriarPerfilPublicoUseCase(perfis, idsSequenciais(), new EventosFake());

    const grow = await caso.executar({ usuarioId: 'u-1', contexto: ContextoDeApp.GROW });
    const med = await caso.executar({ usuarioId: 'u-1', contexto: ContextoDeApp.MED });

    expect(grow.perfilId).not.toBe(med.perfilId);
    expect(grow.nomeSugerido).not.toBe(med.nomeSugerido);
  });

  it('a projeção de leitura nunca expõe o id da Conta', async () => {
    const caso = new ObterOuCriarPerfilPublicoUseCase(
      new PerfisFake(),
      idsSequenciais(),
      new EventosFake(),
    );
    const view = await caso.executar({ usuarioId: 'u-1', contexto: ContextoDeApp.MED });
    expect(Object.values(view)).not.toContain('u-1');
    expect(view).not.toHaveProperty('usuarioId');
  });
});

describe('AtualizarPerfilPublicoUseCase', () => {
  const preparar = async () => {
    const perfis = new PerfisFake();
    await new ObterOuCriarPerfilPublicoUseCase(
      perfis,
      idsSequenciais(),
      new EventosFake(),
    ).executar({ usuarioId: 'u-1', contexto: ContextoDeApp.GROW });
    return { perfis, caso: new AtualizarPerfilPublicoUseCase(perfis) };
  };

  it('edita o próprio perfil e sai do anonimato', async () => {
    const { caso } = await preparar();
    const view = await caso.executar({
      usuarioId: 'u-1',
      contexto: ContextoDeApp.GROW,
      nomeExibicao: 'Cultivador Alpha',
    });
    expect(view.nomeExibicao).toBe('Cultivador Alpha');
    expect(view.anonimo).toBe(false);
  });

  it('volta ao anonimato limpando os campos com null', async () => {
    const { caso } = await preparar();
    await caso.executar({
      usuarioId: 'u-1',
      contexto: ContextoDeApp.GROW,
      nomeExibicao: 'Alpha',
      biografia: 'oi',
    });
    const view = await caso.executar({
      usuarioId: 'u-1',
      contexto: ContextoDeApp.GROW,
      nomeExibicao: null,
      biografia: null,
    });
    expect(view.anonimo).toBe(true);
  });

  it('falha se o perfil daquele contexto ainda não existe', async () => {
    const { caso } = await preparar();
    await expect(
      caso.executar({ usuarioId: 'u-1', contexto: ContextoDeApp.MED, biografia: 'x' }),
    ).rejects.toThrow(PerfilNaoEncontradoError);
  });
});

describe('ObterPerfilPublicoUseCase', () => {
  it('falha para um perfil inexistente', async () => {
    const caso = new ObterPerfilPublicoUseCase(new PerfisFake());
    await expect(caso.executar('nao-existe')).rejects.toThrow(PerfilNaoEncontradoError);
  });
});

describe('Vínculo de Perfis (doc 06 §7.4 — Versão 2)', () => {
  const cenario = async (habilitado: boolean) => {
    const perfis = new PerfisFake();
    const vinculos = new VinculosFake();
    const eventos = new EventosFake();
    const ids = idsSequenciais();
    const criar = new ObterOuCriarPerfilPublicoUseCase(perfis, ids, new EventosFake());

    const grow = await criar.executar({ usuarioId: 'u-1', contexto: ContextoDeApp.GROW });
    const med = await criar.executar({ usuarioId: 'u-1', contexto: ContextoDeApp.MED });
    const alheio = await criar.executar({ usuarioId: 'u-2', contexto: ContextoDeApp.MED });

    const f = flags(habilitado);
    return {
      perfis,
      vinculos,
      eventos,
      grow,
      med,
      alheio,
      autorizar: new AutorizarVinculoDePerfisUseCase(vinculos, perfis, ids, eventos, f),
      revogar: new RevogarVinculoDePerfisUseCase(vinculos, eventos, f),
      listar: new ListarVinculosDoUsuarioUseCase(vinculos, f),
      vinculados: new ObterPerfisVinculadosPublicamenteUseCase(vinculos, perfis, f),
    };
  };

  describe('feature flag desligada (estado do MVP)', () => {
    it('bloqueia autorizar, revogar e listar', async () => {
      const c = await cenario(false);
      await expect(
        c.autorizar.executar({
          usuarioId: 'u-1',
          perfilIds: [c.grow.perfilId, c.med.perfilId],
          visivelEm: [ContextoDeApp.GROW],
        }),
      ).rejects.toThrow(VinculoDePerfisDesabilitadoError);
      await expect(c.revogar.executar({ usuarioId: 'u-1', vinculoId: 'x' })).rejects.toThrow(
        VinculoDePerfisDesabilitadoError,
      );
      await expect(c.listar.executar('u-1')).rejects.toThrow(VinculoDePerfisDesabilitadoError);
    });

    it('a leitura pública devolve lista vazia, nunca revela vínculo', async () => {
      const c = await cenario(false);
      await expect(c.vinculados.executar(c.grow.perfilId)).resolves.toEqual([]);
    });
  });

  describe('feature flag ligada (Versão 2)', () => {
    it('autoriza o vínculo e publica VinculoDePerfisAutorizado (auditado)', async () => {
      const c = await cenario(true);
      const view = await c.autorizar.executar({
        usuarioId: 'u-1',
        perfilIds: [c.grow.perfilId, c.med.perfilId],
        visivelEm: [ContextoDeApp.GROW, ContextoDeApp.MED],
      });
      expect(view.vigente).toBe(true);
      expect(c.eventos.nomes()).toEqual(['VinculoDePerfisAutorizado']);
    });

    it('recusa vincular perfil de outra Conta', async () => {
      const c = await cenario(true);
      await expect(
        c.autorizar.executar({
          usuarioId: 'u-1',
          perfilIds: [c.grow.perfilId, c.alheio.perfilId],
          visivelEm: [ContextoDeApp.GROW],
        }),
      ).rejects.toThrow(AcessoNegadoError);
    });

    it('recusa revelar o vínculo num contexto onde a Conta não tem perfil vinculado', async () => {
      const c = await cenario(true);
      const perfis = new PerfisFake();
      await perfis.salvar(
        PerfilPublico.criar({ id: 'a', usuarioId: 'u-1', contexto: ContextoDeApp.GROW }),
      );
      await perfis.salvar(
        PerfilPublico.criar({ id: 'b', usuarioId: 'u-1', contexto: ContextoDeApp.GROW }),
      );
      const caso = new AutorizarVinculoDePerfisUseCase(
        c.vinculos,
        perfis,
        idsSequenciais(),
        c.eventos,
        flags(true),
      );
      await expect(
        caso.executar({ usuarioId: 'u-1', perfilIds: ['a', 'b'], visivelEm: [ContextoDeApp.GROW] }),
      ).rejects.toThrow(VinculoDePerfisInvalidoError);
    });

    it('recusa um segundo vínculo vigente para o mesmo perfil', async () => {
      const c = await cenario(true);
      const entrada = {
        usuarioId: 'u-1',
        perfilIds: [c.grow.perfilId, c.med.perfilId],
        visivelEm: [ContextoDeApp.GROW],
      };
      await c.autorizar.executar(entrada);
      await expect(c.autorizar.executar(entrada)).rejects.toThrow(VinculoDePerfisInvalidoError);
    });

    it('revoga e publica VinculoDePerfisRevogado', async () => {
      const c = await cenario(true);
      const view = await c.autorizar.executar({
        usuarioId: 'u-1',
        perfilIds: [c.grow.perfilId, c.med.perfilId],
        visivelEm: [ContextoDeApp.GROW],
      });
      await c.revogar.executar({ usuarioId: 'u-1', vinculoId: view.vinculoId });
      expect(c.eventos.nomes()).toEqual(['VinculoDePerfisAutorizado', 'VinculoDePerfisRevogado']);
    });

    it('só o dono revoga o próprio vínculo', async () => {
      const c = await cenario(true);
      const view = await c.autorizar.executar({
        usuarioId: 'u-1',
        perfilIds: [c.grow.perfilId, c.med.perfilId],
        visivelEm: [ContextoDeApp.GROW],
      });
      await expect(
        c.revogar.executar({ usuarioId: 'u-2', vinculoId: view.vinculoId }),
      ).rejects.toThrow(AcessoNegadoError);
    });

    it('revogar um vínculo inexistente é no-op (não revela existência)', async () => {
      const c = await cenario(true);
      await expect(
        c.revogar.executar({ usuarioId: 'u-1', vinculoId: 'nao-existe' }),
      ).resolves.toBeUndefined();
    });
  });
});

/**
 * Teste de arquitetura exigido pelo doc 06 (Casos de Teste / Riscos):
 * perfis de contextos diferentes da MESMA Conta só podem aparecer juntos numa resposta
 * quando existe `RegistroDeVinculoDePerfis` vigente e visível naquele contexto.
 */
describe('Isolamento entre contextos (teste de arquitetura, doc 06 §13)', () => {
  const montar = async () => {
    const perfis = new PerfisFake();
    const vinculos = new VinculosFake();
    const ids = idsSequenciais();
    const criar = new ObterOuCriarPerfilPublicoUseCase(perfis, ids, new EventosFake());
    const grow = await criar.executar({ usuarioId: 'u-1', contexto: ContextoDeApp.GROW });
    const med = await criar.executar({ usuarioId: 'u-1', contexto: ContextoDeApp.MED });
    const consultar = new ObterPerfisVinculadosPublicamenteUseCase(vinculos, perfis, flags(true));
    return { perfis, vinculos, ids, grow, med, consultar };
  };

  it('sem vínculo, consultar um perfil nunca revela o outro contexto da mesma Conta', async () => {
    const { grow, med, consultar } = await montar();
    await expect(consultar.executar(grow.perfilId)).resolves.toEqual([]);
    await expect(consultar.executar(med.perfilId)).resolves.toEqual([]);
  });

  it('com vínculo vigente, revela apenas nos contextos escolhidos (revelação parcial)', async () => {
    const { perfis, vinculos, ids, grow, med, consultar } = await montar();
    await new AutorizarVinculoDePerfisUseCase(
      vinculos,
      perfis,
      ids,
      new EventosFake(),
      flags(true),
    ).executar({
      usuarioId: 'u-1',
      perfilIds: [grow.perfilId, med.perfilId],
      // Revela no Med que "também cultivo"; NÃO revela o inverso no Grow (doc 06 §18).
      visivelEm: [ContextoDeApp.MED],
    });

    const vistoDoMed = await consultar.executar(med.perfilId);
    expect(vistoDoMed.map((p) => p.perfilId)).toEqual([grow.perfilId]);

    const vistoDoGrow = await consultar.executar(grow.perfilId);
    expect(vistoDoGrow).toEqual([]);
  });

  it('o vínculo desaparece imediatamente após a revogação', async () => {
    const { perfis, vinculos, ids, grow, med, consultar } = await montar();
    const eventos = new EventosFake();
    const view = await new AutorizarVinculoDePerfisUseCase(
      vinculos,
      perfis,
      ids,
      eventos,
      flags(true),
    ).executar({
      usuarioId: 'u-1',
      perfilIds: [grow.perfilId, med.perfilId],
      visivelEm: [ContextoDeApp.GROW, ContextoDeApp.MED],
    });
    expect(await consultar.executar(med.perfilId)).toHaveLength(1);

    await new RevogarVinculoDePerfisUseCase(vinculos, eventos, flags(true)).executar({
      usuarioId: 'u-1',
      vinculoId: view.vinculoId,
    });

    expect(await consultar.executar(med.perfilId)).toEqual([]);
    expect(await consultar.executar(grow.perfilId)).toEqual([]);
  });
});
