import { ContextoDeApp, Escopo } from '@cosmaria/core-domain';
import type {
  ComentarioRepository,
  ContagemDiaria,
  CurtidaRepository,
  FiltroDeBusca,
  FiltroDeFeed,
  PublicacaoComunidadeRepository,
  RegistroDeForkRepository,
  SeguimentoRepository,
  VisualizacaoDePerfilRepository,
} from '@cosmaria/comunidade-application';
import {
  Comentario,
  Curtida,
  PublicacaoComunidade,
  RegistroDeFork,
  Seguimento,
} from '@cosmaria/comunidade-domain';

/**
 * Repositório em memória da projeção da Comunidade — usado em unit/e2e e como fallback
 * quando não há Postgres. A visibilidade do feed (PUBLICO de todos + SEGUIDORES de quem o
 * visualizador segue + tudo do próprio perfil) espelha o Motor de Privacidade.
 */
export class InMemoryPublicacaoComunidadeRepository implements PublicacaoComunidadeRepository {
  private readonly porId = new Map<string, PublicacaoComunidade>();

  async salvar(publicacao: PublicacaoComunidade): Promise<void> {
    this.porId.set(publicacao.id, publicacao);
  }

  async buscarPorId(id: string): Promise<PublicacaoComunidade | null> {
    return this.porId.get(id) ?? null;
  }

  async buscarPorReferencia(
    modulo: string,
    conteudoId: string,
  ): Promise<PublicacaoComunidade | null> {
    for (const p of this.porId.values()) {
      if (p.referencia.modulo === modulo && p.referencia.conteudoId === conteudoId) {
        return p;
      }
    }
    return null;
  }

  async listarFeed(contexto: ContextoDeApp, filtro: FiltroDeFeed): Promise<PublicacaoComunidade[]> {
    return this.visiveis(contexto, filtro.perfilDoVisualizador, filtro.seguindoPerfilIds)
      .filter((p) => !filtro.publicadasAntesDe || p.publicadoEm < filtro.publicadasAntesDe)
      .sort((a, b) => b.publicadoEm.getTime() - a.publicadoEm.getTime())
      .slice(0, filtro.limite);
  }

  async buscar(contexto: ContextoDeApp, filtro: FiltroDeBusca): Promise<PublicacaoComunidade[]> {
    const alvo = filtro.valor.toLowerCase();
    return this.visiveis(contexto, filtro.perfilDoVisualizador, filtro.seguindoPerfilIds)
      .filter((p) => {
        const valor = p.dimensoes[filtro.chave];
        return valor !== undefined && valor.toLowerCase().includes(alvo);
      })
      .sort((a, b) => b.publicadoEm.getTime() - a.publicadoEm.getTime())
      .slice(0, filtro.limite);
  }

  async ajustarCurtidas(publicacaoId: string, delta: number): Promise<void> {
    this.porId.get(publicacaoId)?.ajustarCurtidas(delta);
  }

  async ajustarComentarios(publicacaoId: string, delta: number): Promise<void> {
    this.porId.get(publicacaoId)?.ajustarComentarios(delta);
  }

  async somarContadoresRecebidos(perfilPublicoId: string): Promise<{
    publicacoes: number;
    curtidas: number;
    comentarios: number;
  }> {
    const doPerfil = [...this.porId.values()].filter((p) => p.publicadoPor(perfilPublicoId));
    return {
      publicacoes: doPerfil.length,
      curtidas: doPerfil.reduce((s, p) => s + p.curtidas, 0),
      comentarios: doPerfil.reduce((s, p) => s + p.comentarios, 0),
    };
  }

  private visiveis(
    contexto: ContextoDeApp,
    perfilDoVisualizador: string,
    seguindoPerfilIds: string[],
  ): PublicacaoComunidade[] {
    const seguindo = new Set(seguindoPerfilIds);
    return [...this.porId.values()].filter(
      (p) =>
        p.contexto === contexto &&
        (p.escopo === Escopo.PUBLICO ||
          p.publicadoPor(perfilDoVisualizador) ||
          (p.escopo === Escopo.SEGUIDORES && seguindo.has(p.perfilPublicoId))),
    );
  }
}

export class InMemorySeguimentoRepository implements SeguimentoRepository {
  private readonly porId = new Map<string, Seguimento>();

  private chave(seguidor: string, seguido: string): string {
    return `${seguidor}->${seguido}`;
  }

  async salvar(s: Seguimento): Promise<void> {
    this.porId.set(this.chave(s.seguidorPerfilId, s.seguidoPerfilId), s);
  }

  async remover(seguidorPerfilId: string, seguidoPerfilId: string): Promise<void> {
    this.porId.delete(this.chave(seguidorPerfilId, seguidoPerfilId));
  }

  async existe(seguidorPerfilId: string, seguidoPerfilId: string): Promise<boolean> {
    return this.porId.has(this.chave(seguidorPerfilId, seguidoPerfilId));
  }

  async listarSeguidosIds(seguidorPerfilId: string): Promise<string[]> {
    return [...this.porId.values()]
      .filter((s) => s.seguidorPerfilId === seguidorPerfilId)
      .map((s) => s.seguidoPerfilId);
  }

  async contarSeguidores(perfilId: string): Promise<number> {
    return [...this.porId.values()].filter((s) => s.seguidoPerfilId === perfilId).length;
  }

  async contarSeguindo(perfilId: string): Promise<number> {
    return [...this.porId.values()].filter((s) => s.seguidorPerfilId === perfilId).length;
  }
}

export class InMemoryCurtidaRepository implements CurtidaRepository {
  private readonly porChave = new Map<string, Curtida>();

  private chave(perfilId: string, publicacaoId: string): string {
    return `${perfilId}@${publicacaoId}`;
  }

  async salvar(c: Curtida): Promise<void> {
    this.porChave.set(this.chave(c.perfilId, c.publicacaoId), c);
  }

  async remover(perfilId: string, publicacaoId: string): Promise<void> {
    this.porChave.delete(this.chave(perfilId, publicacaoId));
  }

  async existe(perfilId: string, publicacaoId: string): Promise<boolean> {
    return this.porChave.has(this.chave(perfilId, publicacaoId));
  }
}

export class InMemoryComentarioRepository implements ComentarioRepository {
  private readonly porId = new Map<string, Comentario>();

  async salvar(c: Comentario): Promise<void> {
    this.porId.set(c.id, c);
  }

  async listarPorPublicacao(publicacaoId: string, limite: number): Promise<Comentario[]> {
    return [...this.porId.values()]
      .filter((c) => c.publicacaoId === publicacaoId)
      .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime())
      .slice(0, limite);
  }
}

export class InMemoryRegistroDeForkRepository implements RegistroDeForkRepository {
  private readonly porId = new Map<string, RegistroDeFork>();

  async salvar(r: RegistroDeFork): Promise<void> {
    this.porId.set(r.id, r);
  }

  async existe(forkerPerfilId: string, publicacaoOrigemId: string): Promise<boolean> {
    return [...this.porId.values()].some(
      (r) => r.forkerPerfilId === forkerPerfilId && r.publicacaoOrigemId === publicacaoOrigemId,
    );
  }

  async contarForksRecebidos(autorOriginalPerfilId: string): Promise<number> {
    return [...this.porId.values()].filter((r) => r.autorOriginalPerfilId === autorOriginalPerfilId)
      .length;
  }
}

export class InMemoryVisualizacaoDePerfilRepository implements VisualizacaoDePerfilRepository {
  private readonly porPerfil = new Map<string, Map<string, number>>();

  async incrementar(perfilId: string, dia: string): Promise<void> {
    const dias = this.porPerfil.get(perfilId) ?? new Map<string, number>();
    dias.set(dia, (dias.get(dia) ?? 0) + 1);
    this.porPerfil.set(perfilId, dias);
  }

  async total(perfilId: string): Promise<number> {
    const dias = this.porPerfil.get(perfilId);
    if (!dias) return 0;
    return [...dias.values()].reduce((s, n) => s + n, 0);
  }

  async porDia(perfilId: string, desdeDia: string): Promise<ContagemDiaria[]> {
    const dias = this.porPerfil.get(perfilId);
    if (!dias) return [];
    return [...dias.entries()]
      .filter(([dia]) => dia >= desdeDia)
      .map(([dia, total]) => ({ dia, total }))
      .sort((a, b) => (a.dia < b.dia ? 1 : -1));
  }
}
