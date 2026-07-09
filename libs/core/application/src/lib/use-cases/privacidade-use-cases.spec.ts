import {
  ConfiguracaoDeCompartilhamento,
  ConfiguracaoDeCompartilhamentoAlterada,
  type DomainEvent,
  Escopo,
  VISUALIZADOR_ANONIMO,
} from '@cosmaria/core-domain';
import type { IdGenerator } from '../ports/id-generator.port';
import type { EventPublisher } from '../ports/event-publisher.port';
import type { ConfiguracaoDeCompartilhamentoRepository } from '../ports/configuracao-de-compartilhamento.repository';
import { DefinirCompartilhamentoUseCase } from './definir-compartilhamento.use-case';
import { FiltrarConteudoUseCase } from './filtrar-conteudo.use-case';

// ---- Fakes inline (sem importar infraestrutura, respeitando as fronteiras) ----
class FakeConfigRepo implements ConfiguracaoDeCompartilhamentoRepository {
  private readonly map = new Map<string, ConfiguracaoDeCompartilhamento>();
  private chave(m: string, t: string, c: string): string {
    return `${m}:${t}:${c}`;
  }
  salvar(config: ConfiguracaoDeCompartilhamento): Promise<void> {
    this.map.set(this.chave(config.modulo, config.tipoConteudo, config.conteudoId), config);
    return Promise.resolve();
  }
  buscarPorConteudo(
    m: string,
    t: string,
    c: string,
  ): Promise<ConfiguracaoDeCompartilhamento | null> {
    return Promise.resolve(this.map.get(this.chave(m, t, c)) ?? null);
  }
}
class FakeIdGen implements IdGenerator {
  private n = 0;
  gerar(): string {
    return `id-${++this.n}`;
  }
}
class FakeEventPublisher implements EventPublisher {
  readonly publicados: DomainEvent[] = [];
  publicar(evento: DomainEvent): Promise<void> {
    this.publicados.push(evento);
    return Promise.resolve();
  }
}

describe('DefinirCompartilhamentoUseCase', () => {
  it('cria a config e publica ConfiguracaoDeCompartilhamentoAlterada', async () => {
    const repo = new FakeConfigRepo();
    const eventos = new FakeEventPublisher();
    const uc = new DefinirCompartilhamentoUseCase(repo, new FakeIdGen(), eventos);

    const resumo = await uc.executar({
      autorId: 'a1',
      modulo: 'grow',
      tipoConteudo: 'growlog',
      conteudoId: 'g1',
      dimensoes: [{ codigo: 'fotos', escopo: Escopo.PUBLICO }],
    });

    expect(resumo.dimensoes).toEqual([{ codigo: 'fotos', escopo: Escopo.PUBLICO }]);
    expect(eventos.publicados).toHaveLength(1);
    expect(eventos.publicados[0]).toBeInstanceOf(ConfiguracaoDeCompartilhamentoAlterada);
  });

  it('bloqueia quem não é o autor de editar a privacidade', async () => {
    const repo = new FakeConfigRepo();
    const uc = new DefinirCompartilhamentoUseCase(repo, new FakeIdGen(), new FakeEventPublisher());
    await uc.executar({ autorId: 'a1', modulo: 'grow', tipoConteudo: 'growlog', conteudoId: 'g1' });

    await expect(
      uc.executar({
        autorId: 'invasor',
        modulo: 'grow',
        tipoConteudo: 'growlog',
        conteudoId: 'g1',
      }),
    ).rejects.toThrow();
  });
});

describe('FiltrarConteudoUseCase', () => {
  const autor = { ehAutor: true, ehSeguidor: false, ehAmigo: false, possuiLink: false };

  it('sem configuração, o conteúdo é privado (só o autor vê)', async () => {
    const uc = new FiltrarConteudoUseCase(new FakeConfigRepo());
    const dados = { fotos: 'f' };
    expect(
      await uc.executar({
        modulo: 'grow',
        tipoConteudo: 'growlog',
        conteudoId: 'x',
        contexto: VISUALIZADOR_ANONIMO,
        dados,
      }),
    ).toEqual({});
    expect(
      await uc.executar({
        modulo: 'grow',
        tipoConteudo: 'growlog',
        conteudoId: 'x',
        contexto: autor,
        dados,
      }),
    ).toEqual(dados);
  });

  it('aplica a configuração existente ao filtrar', async () => {
    const repo = new FakeConfigRepo();
    const definir = new DefinirCompartilhamentoUseCase(
      repo,
      new FakeIdGen(),
      new FakeEventPublisher(),
    );
    await definir.executar({
      autorId: 'a1',
      modulo: 'grow',
      tipoConteudo: 'growlog',
      conteudoId: 'g1',
      dimensoes: [{ codigo: 'fotos', escopo: Escopo.PUBLICO }],
    });

    const filtrar = new FiltrarConteudoUseCase(repo);
    const visivel = await filtrar.executar({
      modulo: 'grow',
      tipoConteudo: 'growlog',
      conteudoId: 'g1',
      contexto: VISUALIZADOR_ANONIMO,
      dados: { fotos: 'f', segredo: 's' },
    });
    expect(visivel).toEqual({ fotos: 'f' });
  });
});
