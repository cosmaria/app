import {
  type Alerta,
  avaliarAlerta,
  DominioDeDado,
  DominioDeDadoInvalidoError,
  ehDominioDeDadoValido,
  REGRAS_PADRAO,
} from '@cosmaria/ia-domain';
import { PontoDeSerieRepository } from '../ports/ia.repositories';

/**
 * `GET /v1/ia/alertas` (doc 05 §6.3) — modelo de leitura, determinístico.
 *
 * Avalia o valor mais recente de cada fator monitorado do domínio contra as faixas de
 * referência. Não depende de correlação — é a checagem "fora de faixa" (doc 05 §6.3). Para
 * o Med, as mensagens são neutras e remetem ao médico (doc 03 §16).
 */
export class AvaliarAlertasUseCase {
  constructor(private readonly repo: PontoDeSerieRepository) {}

  async executar(input: { usuarioId: string; dominio: string }): Promise<Alerta[]> {
    if (!ehDominioDeDadoValido(input.dominio)) {
      throw new DominioDeDadoInvalidoError();
    }
    const dominio = input.dominio as DominioDeDado;
    const regras = REGRAS_PADRAO.filter((r) => r.dominio === dominio);

    const alertas: Alerta[] = [];
    for (const regra of regras) {
      const ultimo = await this.repo.ultimoPorFator(input.usuarioId, dominio, regra.fator);
      const alerta = avaliarAlerta(regra, ultimo);
      if (alerta) {
        alertas.push(alerta);
      }
    }
    return alertas;
  }
}
