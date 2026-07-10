import { NivelDeComplexidade, nivelAlcanca } from './nivel-de-complexidade';

export interface PreferenciaDeComplexidadeProps {
  id: string;
  usuarioId: string;
  nivel: NivelDeComplexidade;
  /**
   * Campos avançados liberados **individualmente**, sem subir de nível.
   * É o que o doc 02 §5.0 chama de "habilitação progressiva": o usuário pode passar a
   * registrar EC sem ter que encarar todos os parâmetros de especialista de uma vez.
   */
  camposHabilitados: Set<string>;
  atualizadoEm: Date;
}

/**
 * PreferênciaDeComplexidade (doc 08 §12.1 — Arquétipo D; entidade ÚNICA do Core,
 * nunca duplicada por app — doc 02 §6).
 *
 * Grow e Med consultam a mesma preferência: um usuário que já é especialista no cultivo
 * não deveria voltar a ver o formulário de iniciante no acompanhamento terapêutico.
 */
export class PreferenciaDeComplexidade {
  private constructor(private readonly props: PreferenciaDeComplexidadeProps) {}

  static reconstituir(props: PreferenciaDeComplexidadeProps): PreferenciaDeComplexidade {
    return new PreferenciaDeComplexidade(props);
  }

  /** Toda Conta nova começa no essencial — nunca assustada com parâmetros técnicos. */
  static padrao(params: {
    id: string;
    usuarioId: string;
    atualizadoEm?: Date;
  }): PreferenciaDeComplexidade {
    return new PreferenciaDeComplexidade({
      id: params.id,
      usuarioId: params.usuarioId,
      nivel: NivelDeComplexidade.ESSENCIAL,
      camposHabilitados: new Set(),
      atualizadoEm: params.atualizadoEm ?? new Date(),
    });
  }

  get id(): string {
    return this.props.id;
  }
  get usuarioId(): string {
    return this.props.usuarioId;
  }
  get nivel(): NivelDeComplexidade {
    return this.props.nivel;
  }
  get atualizadoEm(): Date {
    return this.props.atualizadoEm;
  }

  camposHabilitados(): string[] {
    return [...this.props.camposHabilitados].sort();
  }

  /** Modo Especialista: tudo visível, sem precisar habilitar campo por campo. */
  ehModoEspecialista(): boolean {
    return this.props.nivel === NivelDeComplexidade.ESPECIALISTA;
  }

  /**
   * O campo aparece para este usuário?
   * Basta o nível alcançar o do campo **ou** o campo ter sido liberado individualmente.
   */
  campoVisivel(codigo: string, nivelDoCampo: NivelDeComplexidade): boolean {
    return nivelAlcanca(this.props.nivel, nivelDoCampo) || this.props.camposHabilitados.has(codigo);
  }

  definirNivel(nivel: NivelDeComplexidade, agora: Date = new Date()): void {
    this.props.nivel = nivel;
    this.props.atualizadoEm = agora;
  }

  /** Libera um campo avançado sem mexer no nível (habilitação progressiva). */
  habilitarCampo(codigo: string, agora: Date = new Date()): void {
    this.props.camposHabilitados.add(codigo);
    this.props.atualizadoEm = agora;
  }

  /**
   * Recolhe um campo liberado individualmente. Não esconde o que o **nível** já mostra:
   * quem é especialista continua vendo tudo — para reduzir o que vê, baixa o nível.
   */
  desabilitarCampo(codigo: string, agora: Date = new Date()): void {
    this.props.camposHabilitados.delete(codigo);
    this.props.atualizadoEm = agora;
  }
}
