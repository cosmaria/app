import type { DomainEvent } from '@cosmaria/core-domain';
import type { VinculoGrowMedRepository } from '../ports/vinculo-grow-med.repository';

/**
 * Contrato duck-typed dos eventos de vínculo do Med. A IA NÃO importa as classes de evento
 * do Med (proibido por lint, doc 04 §24): lê o payload por esta interface local — a mesma
 * fronteira anticorrupção do Adaptador de Ingestão.
 */
interface EventoDeVinculoRecebido extends DomainEvent {
  usuarioId: string;
  produtoId: string;
}

function ehEventoDeVinculo(evento: DomainEvent): evento is EventoDeVinculoRecebido {
  const e = evento as Partial<EventoDeVinculoRecebido>;
  return typeof e.usuarioId === 'string' && typeof e.produtoId === 'string';
}

/**
 * Consumidor do opt-in Grow↔Med (doc 05 §8, doc 00). No boot, a IA assina
 * `ProdutoVinculadoALote`/`ProdutoDesvinculadoDoLote` e mantém o registro de consentimento —
 * é o gatilho que libera a correlação cruzada, sem a IA jamais tocar no schema do Med.
 */
export class RegistrarVinculoGrowMedService {
  static readonly EVENTO_VINCULADO = 'ProdutoVinculadoALote';
  static readonly EVENTO_DESVINCULADO = 'ProdutoDesvinculadoDoLote';
  static readonly EVENTOS = [
    RegistrarVinculoGrowMedService.EVENTO_VINCULADO,
    RegistrarVinculoGrowMedService.EVENTO_DESVINCULADO,
  ];

  constructor(private readonly repo: VinculoGrowMedRepository) {}

  async processar(evento: DomainEvent): Promise<void> {
    if (!ehEventoDeVinculo(evento)) {
      return;
    }
    if (evento.nome === RegistrarVinculoGrowMedService.EVENTO_VINCULADO) {
      await this.repo.registrar(evento.usuarioId, evento.produtoId);
    } else if (evento.nome === RegistrarVinculoGrowMedService.EVENTO_DESVINCULADO) {
      await this.repo.remover(evento.usuarioId, evento.produtoId);
    }
  }
}
