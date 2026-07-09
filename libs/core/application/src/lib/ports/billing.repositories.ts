import type {
  AssinaturaPremium,
  CupomOuPromocao,
  CicloDeCobranca,
  LimiteDePlano,
  PeriodoGratuitoConfiguracao,
  Plano,
  PrecoRegional,
} from '@cosmaria/core-domain';

/** Repositório da entidade crítica AssinaturaPremium (1—1 com a Conta). */
export interface AssinaturaRepository {
  salvar(assinatura: AssinaturaPremium): Promise<void>;
  buscarPorUsuario(usuarioId: string): Promise<AssinaturaPremium | null>;
}

export const ASSINATURA_REPOSITORY = Symbol('AssinaturaRepository');

/** Configuração de limites por plano (doc 07 §9 — nunca constante de código). */
export interface LimiteDePlanoRepository {
  buscar(plano: Plano, chave: string): Promise<LimiteDePlano | null>;
  listarPorPlano(plano: Plano): Promise<LimiteDePlano[]>;
}

export const LIMITE_DE_PLANO_REPOSITORY = Symbol('LimiteDePlanoRepository');

export interface CupomRepository {
  buscarPorCodigo(codigo: string): Promise<CupomOuPromocao | null>;
  salvar(cupom: CupomOuPromocao): Promise<void>;
}

export const CUPOM_REPOSITORY = Symbol('CupomRepository');

/** Catálogo de cobrança: trial e preço regional (ambos Arquétipo D, Configuração). */
export interface CatalogoDeCobrancaRepository {
  buscarPeriodoGratuito(plano: Plano): Promise<PeriodoGratuitoConfiguracao | null>;
  buscarPrecoRegional(
    pais: string,
    plano: Plano,
    ciclo: CicloDeCobranca,
  ): Promise<PrecoRegional | null>;
}

export const CATALOGO_DE_COBRANCA_REPOSITORY = Symbol('CatalogoDeCobrancaRepository');
