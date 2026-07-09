import { Papel } from './papel';
import { Permissao } from './permissao';

/**
 * Política de Autorização (RBAC) — doc 04 §11, modelo Híbrido.
 * Fonte ÚNICA da verdade do mapa papel → permissões grossas. É domínio puro:
 * o guard da API e o endpoint `/autorizacao/verificar` consultam este mapa, nunca
 * reimplementam a regra (evita duplicação que poderia divergir).
 *
 * NÃO decide visibilidade de conteúdo específico ("posso ver ESTE dado deste outro
 * usuário?") — isso é o Motor de Privacidade (doc 04 §12), próxima épica.
 */
export class PoliticaDeAutorizacao {
  private static readonly MATRIZ: Readonly<Record<Papel, readonly Permissao[]>> = {
    [Papel.USUARIO]: [],
    [Papel.DEPENDENTE]: [],
    [Papel.MODERADOR]: [Permissao.MODERAR_COMUNIDADE],
    [Papel.ADMIN]: [
      Permissao.GERIR_PLATAFORMA,
      Permissao.LER_TRILHA_AUDITORIA,
      Permissao.MODERAR_COMUNIDADE,
      Permissao.PRESTAR_SUPORTE,
    ],
    [Papel.SUPORTE]: [Permissao.PRESTAR_SUPORTE, Permissao.LER_TRILHA_AUDITORIA],
  };

  /** O conjunto de papéis concede a permissão pedida? */
  static concede(papeis: readonly Papel[], permissao: Permissao): boolean {
    return papeis.some((papel) => (this.MATRIZ[papel] ?? []).includes(permissao));
  }

  /** Todas as permissões efetivas do conjunto de papéis (união, sem duplicatas). */
  static permissoesDe(papeis: readonly Papel[]): Permissao[] {
    const efetivas = new Set<Permissao>();
    for (const papel of papeis) {
      for (const permissao of this.MATRIZ[papel] ?? []) {
        efetivas.add(permissao);
      }
    }
    return [...efetivas];
  }
}
