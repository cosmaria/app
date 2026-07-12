import type { IdGenerator } from '@cosmaria/core-application';
import type { DomainEvent } from '@cosmaria/core-domain';
import { DominioDeDado, Fator, PontoDeSerie } from '@cosmaria/ia-domain';
import { PontoDeSerieRepository } from '../ports/ia.repositories';

/**
 * Adaptador de Ingestão de Eventos (doc 05 §6) — o primeiro consumidor da IA no barramento.
 *
 * Traduz eventos de domínio de Grow/Med em `PontoDeSerie` normalizados na série própria da
 * IA. **Não importa as classes de evento de Grow/Med** (proibido por lint, doc 04 §24):
 * assina por NOME e lê o payload por contrato (duck-typing do shared kernel). Cada novo
 * fator/fonte (wearables, exames — doc 05 §16) entra aqui, sem tocar no Motor de Correlação.
 *
 * Os contratos abaixo espelham o payload publicado por Grow/Med (Catálogo de Domínio) — são
 * a fronteira anticorrupção da IA, não uma dependência de código.
 */

interface EventoComUsuario extends DomainEvent {
  usuarioId: string;
}
interface EvRegistroAmbiental extends EventoComUsuario {
  registroId: string;
  vpdKpa: number | null;
  dli: number | null;
}
interface EvSintomaDiario extends EventoComUsuario {
  registroId: string;
  humor: number | null;
  ansiedade: number | null;
  dor: number | null;
  sono: number | null;
  apetite: number | null;
}
interface EvDose extends EventoComUsuario {
  registroDeUsoId: string;
  usadoEm: Date;
  quantidade: number;
}
interface EvSessaoDepois extends EventoComUsuario {
  sessaoId: string;
  variacao: number | null;
}
interface EvEfeito extends EventoComUsuario {
  efeitoId: string;
  intensidade: number | null;
}

export class IngerirEventoService {
  /** Nomes de evento ingeridos — o composition root registra as assinaturas a partir daqui. */
  static readonly EVENTOS_INGERIDOS = [
    'RegistroAmbientalCriado',
    'SintomaDiarioRegistrado',
    'DoseRegistrada',
    'SessaoDepoisRegistrada',
    'EfeitoRegistrado',
  ];

  constructor(
    private readonly repo: PontoDeSerieRepository,
    private readonly idGen: IdGenerator,
  ) {}

  async ingerir(evento: DomainEvent): Promise<void> {
    const pontos = this.mapear(evento);
    if (pontos.length > 0) {
      await this.repo.salvarVarios(pontos);
    }
  }

  private ponto(
    usuarioId: string,
    dominio: DominioDeDado,
    fator: Fator,
    valor: number,
    ocorridoEm: Date,
    origemId: string,
  ): PontoDeSerie {
    return PontoDeSerie.registrar({
      id: this.idGen.gerar(),
      usuarioId,
      dominio,
      fator,
      valor,
      ocorridoEm,
      origemId,
    });
  }

  private mapear(evento: DomainEvent): PontoDeSerie[] {
    switch (evento.nome) {
      case 'RegistroAmbientalCriado': {
        const e = evento as EvRegistroAmbiental;
        const pontos: PontoDeSerie[] = [];
        if (e.vpdKpa !== null) {
          pontos.push(
            this.ponto(
              e.usuarioId,
              DominioDeDado.GROW,
              Fator.VPD,
              e.vpdKpa,
              e.ocorridoEm,
              e.registroId,
            ),
          );
        }
        if (e.dli !== null) {
          pontos.push(
            this.ponto(
              e.usuarioId,
              DominioDeDado.GROW,
              Fator.DLI,
              e.dli,
              e.ocorridoEm,
              e.registroId,
            ),
          );
        }
        return pontos;
      }
      case 'SintomaDiarioRegistrado': {
        const e = evento as EvSintomaDiario;
        const dims: [Fator, number | null][] = [
          [Fator.HUMOR, e.humor],
          [Fator.ANSIEDADE, e.ansiedade],
          [Fator.DOR, e.dor],
          [Fator.SONO, e.sono],
          [Fator.APETITE, e.apetite],
        ];
        return dims
          .filter(([, v]) => v !== null)
          .map(([fator, v]) =>
            this.ponto(
              e.usuarioId,
              DominioDeDado.MED,
              fator,
              v as number,
              e.ocorridoEm,
              e.registroId,
            ),
          );
      }
      case 'DoseRegistrada': {
        const e = evento as EvDose;
        return [
          this.ponto(
            e.usuarioId,
            DominioDeDado.MED,
            Fator.DOSE,
            e.quantidade,
            e.usadoEm,
            e.registroDeUsoId,
          ),
        ];
      }
      case 'SessaoDepoisRegistrada': {
        const e = evento as EvSessaoDepois;
        return e.variacao === null
          ? []
          : [
              this.ponto(
                e.usuarioId,
                DominioDeDado.MED,
                Fator.SESSAO_VARIACAO,
                e.variacao,
                e.ocorridoEm,
                e.sessaoId,
              ),
            ];
      }
      case 'EfeitoRegistrado': {
        const e = evento as EvEfeito;
        return e.intensidade === null
          ? []
          : [
              this.ponto(
                e.usuarioId,
                DominioDeDado.MED,
                Fator.EFEITO_INTENSIDADE,
                e.intensidade,
                e.ocorridoEm,
                e.efeitoId,
              ),
            ];
      }
      default:
        return [];
    }
  }
}
