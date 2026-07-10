import type { CampoDeComplexidade, ComplexidadeView } from '@cosmaria/core-application';

/**
 * Reexportado como parte do CONTRATO: quem consome `filtrarCampos` precisa declarar o
 * nível de cada campo. Sem isto, Grow e Med importariam o interior do Core só para
 * nomear um nível.
 */
export { NivelDeComplexidade } from '@cosmaria/core-domain';
export type { CampoDeComplexidade } from '@cosmaria/core-application';

/**
 * Interface pública da Complexidade Progressiva (doc 02 §5.0/§6 / doc 14 §10).
 *
 * O Módulo de Complexidade Progressiva é **transversal**: Grow e Med declaram o nível de
 * cada campo e perguntam aqui o que exibir. Nenhum dos dois reimplementa o corte por
 * nível, e nenhum dos dois guarda a própria preferência — ela é única por Conta
 * (doc 02 §6: "não duplicada por app").
 */
export interface ComplexidadePublicApi {
  /** Nível vigente do usuário, criando a preferência padrão (essencial) na 1ª leitura. */
  obterPreferencia(usuarioId: string): Promise<ComplexidadeView>;

  /** Dos campos declarados, quais este usuário deve ver agora. */
  filtrarCampos(usuarioId: string, campos: CampoDeComplexidade[]): Promise<string[]>;
}

/** Token de injeção da interface pública de complexidade. */
export const COMPLEXIDADE_PUBLIC_API = Symbol('ComplexidadePublicApi');
