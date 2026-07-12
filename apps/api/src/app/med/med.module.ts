import { Module, type Provider } from '@nestjs/common';
import type { Pool } from 'pg';
import {
  EVENT_PUBLISHER,
  ID_GENERATOR,
  type EventPublisher,
  type IdGenerator,
} from '@cosmaria/core-application';
import { CryptoIdGenerator } from '@cosmaria/core-infrastructure';
import { PREMIUM_PUBLIC_API, type PremiumPublicApi } from '@cosmaria/core-public-api';
import {
  AtualizarProdutoUseCase,
  AtualizarTratamentoUseCase,
  CriarModeloDeTratamentoUseCase,
  CriarProdutoUseCase,
  CriarTratamentoUseCase,
  EFEITO_REPOSITORY,
  type EfeitoRepository,
  EncerrarTratamentoUseCase,
  GerarRelatorioUseCase,
  ListarEfeitosDaDoseUseCase,
  ListarModelosDeTratamentoUseCase,
  ListarProdutosDoTratamentoUseCase,
  ListarSintomasDiariosUseCase,
  ListarTratamentosUseCase,
  ListarUsosDoProdutoUseCase,
  ListarUsosDoTratamentoUseCase,
  MODELO_DE_TRATAMENTO_REPOSITORY,
  type ModeloDeTratamentoRepository,
  ObterEvolucaoUseCase,
  ObterProdutoUseCase,
  ObterSessaoUseCase,
  ObterTratamentoUseCase,
  ObterUsoUseCase,
  type ReposDeEvolucao,
  PRODUTO_REPOSITORY,
  type ProdutoRepository,
  REGISTRO_DE_USO_REPOSITORY,
  RegistrarEfeitoUseCase,
  RegistrarSessaoAntesUseCase,
  RegistrarSessaoDepoisUseCase,
  RegistrarSintomaDiarioUseCase,
  RegistrarUsoUseCase,
  type RegistroDeUsoRepository,
  RemoverModeloDeTratamentoUseCase,
  RemoverProdutoUseCase,
  RemoverTratamentoUseCase,
  SESSAO_REPOSITORY,
  SINTOMA_DIARIO_REPOSITORY,
  type SessaoAntesDepoisRepository,
  type SintomaDiarioRepository,
  TRATAMENTO_REPOSITORY,
  type TratamentoRepository,
} from '@cosmaria/med-application';
import {
  InMemoryEfeitoRepository,
  InMemoryModeloDeTratamentoRepository,
  InMemoryProdutoRepository,
  InMemoryRegistroDeUsoRepository,
  InMemorySessaoAntesDepoisRepository,
  InMemorySintomaDiarioRepository,
  InMemoryTratamentoRepository,
  PostgresEfeitoRepository,
  PostgresModeloDeTratamentoRepository,
  PostgresProdutoRepository,
  PostgresRegistroDeUsoRepository,
  PostgresSessaoAntesDepoisRepository,
  PostgresSintomaDiarioRepository,
  PostgresTratamentoRepository,
} from '@cosmaria/med-infrastructure';
import { PG_POOL } from '../infra/infra.tokens';
import { AuthModule } from '../auth/auth.module';
import { BillingModule } from '../billing/billing.module';
import {
  EfeitoController,
  EvolucaoController,
  ModeloDeTratamentoController,
  ProdutoController,
  RegistroDeUsoController,
  SessaoController,
  SintomaDiarioController,
  TratamentoController,
} from './med.controller';

/**
 * Composition root do COSMARIA Med (doc 03 / doc 14 §10).
 *
 * Não importa, e não pode importar, nenhum módulo do Grow (doc 04 §24, enforçado por lint).
 * A referência opt-in Produto↔Lote é Versão 2 e chegará pela interface pública do Grow.
 *
 * Como no Grow, os repositórios em memória precisam enxergar uns aos outros
 * (`possuiProdutos`/`possuiRegistros` cruzam agregados). O wiring acontece aqui — é o
 * análogo do `EXISTS` que o Postgres faz numa consulta só.
 */
const emMemoria = () => {
  const tratamentos = new InMemoryTratamentoRepository();
  const produtos = new InMemoryProdutoRepository();
  const registros = new InMemoryRegistroDeUsoRepository();
  const sessoes = new InMemorySessaoAntesDepoisRepository();
  const sintomas = new InMemorySintomaDiarioRepository();
  const efeitos = new InMemoryEfeitoRepository();
  const modelos = new InMemoryModeloDeTratamentoRepository();
  tratamentos.conectarProdutos(produtos);
  produtos.conectarRegistros(registros);
  registros.conectarProdutos(produtos);
  sessoes.conectarRegistros(registros);
  efeitos.conectarRegistros(registros);
  return { tratamentos, produtos, registros, sessoes, sintomas, efeitos, modelos };
};

const REPOSITORIOS_EM_MEMORIA = Symbol('RepositoriosMedEmMemoria');

/** Bundle de repositórios que a Evolução Clínica lê (cruza quase todo o histórico do Med). */
const REPOS_EVOLUCAO = Symbol('ReposDeEvolucao');

const providers: Provider[] = [
  { provide: ID_GENERATOR, useClass: CryptoIdGenerator },
  { provide: REPOSITORIOS_EM_MEMORIA, useFactory: emMemoria },
  {
    provide: TRATAMENTO_REPOSITORY,
    useFactory: (pool: Pool | null, memoria: ReturnType<typeof emMemoria>): TratamentoRepository =>
      pool ? new PostgresTratamentoRepository(pool) : memoria.tratamentos,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },
  {
    provide: PRODUTO_REPOSITORY,
    useFactory: (pool: Pool | null, memoria: ReturnType<typeof emMemoria>): ProdutoRepository =>
      pool ? new PostgresProdutoRepository(pool) : memoria.produtos,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },
  {
    provide: REGISTRO_DE_USO_REPOSITORY,
    useFactory: (
      pool: Pool | null,
      memoria: ReturnType<typeof emMemoria>,
    ): RegistroDeUsoRepository =>
      pool ? new PostgresRegistroDeUsoRepository(pool) : memoria.registros,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },

  // Tratamento
  {
    provide: CriarTratamentoUseCase,
    useFactory: (repo: TratamentoRepository, idGen: IdGenerator, eventos: EventPublisher) =>
      new CriarTratamentoUseCase(repo, idGen, eventos),
    inject: [TRATAMENTO_REPOSITORY, ID_GENERATOR, EVENT_PUBLISHER],
  },
  {
    provide: ListarTratamentosUseCase,
    useFactory: (repo: TratamentoRepository) => new ListarTratamentosUseCase(repo),
    inject: [TRATAMENTO_REPOSITORY],
  },
  {
    provide: ObterTratamentoUseCase,
    useFactory: (repo: TratamentoRepository) => new ObterTratamentoUseCase(repo),
    inject: [TRATAMENTO_REPOSITORY],
  },
  {
    provide: AtualizarTratamentoUseCase,
    useFactory: (repo: TratamentoRepository) => new AtualizarTratamentoUseCase(repo),
    inject: [TRATAMENTO_REPOSITORY],
  },
  {
    provide: EncerrarTratamentoUseCase,
    useFactory: (repo: TratamentoRepository, eventos: EventPublisher) =>
      new EncerrarTratamentoUseCase(repo, eventos),
    inject: [TRATAMENTO_REPOSITORY, EVENT_PUBLISHER],
  },
  {
    provide: RemoverTratamentoUseCase,
    useFactory: (repo: TratamentoRepository) => new RemoverTratamentoUseCase(repo),
    inject: [TRATAMENTO_REPOSITORY],
  },

  // Produto
  {
    provide: CriarProdutoUseCase,
    useFactory: (
      produtos: ProdutoRepository,
      tratamentos: TratamentoRepository,
      idGen: IdGenerator,
      eventos: EventPublisher,
    ) => new CriarProdutoUseCase(produtos, tratamentos, idGen, eventos),
    inject: [PRODUTO_REPOSITORY, TRATAMENTO_REPOSITORY, ID_GENERATOR, EVENT_PUBLISHER],
  },
  {
    provide: ListarProdutosDoTratamentoUseCase,
    useFactory: (produtos: ProdutoRepository, tratamentos: TratamentoRepository) =>
      new ListarProdutosDoTratamentoUseCase(produtos, tratamentos),
    inject: [PRODUTO_REPOSITORY, TRATAMENTO_REPOSITORY],
  },
  {
    provide: ObterProdutoUseCase,
    useFactory: (produtos: ProdutoRepository) => new ObterProdutoUseCase(produtos),
    inject: [PRODUTO_REPOSITORY],
  },
  {
    provide: AtualizarProdutoUseCase,
    useFactory: (produtos: ProdutoRepository) => new AtualizarProdutoUseCase(produtos),
    inject: [PRODUTO_REPOSITORY],
  },
  {
    provide: RemoverProdutoUseCase,
    useFactory: (produtos: ProdutoRepository) => new RemoverProdutoUseCase(produtos),
    inject: [PRODUTO_REPOSITORY],
  },

  // Registro de Uso (série de doses)
  {
    provide: RegistrarUsoUseCase,
    useFactory: (
      registros: RegistroDeUsoRepository,
      produtos: ProdutoRepository,
      idGen: IdGenerator,
      eventos: EventPublisher,
    ) => new RegistrarUsoUseCase(registros, produtos, idGen, eventos),
    inject: [REGISTRO_DE_USO_REPOSITORY, PRODUTO_REPOSITORY, ID_GENERATOR, EVENT_PUBLISHER],
  },
  {
    provide: ListarUsosDoProdutoUseCase,
    useFactory: (registros: RegistroDeUsoRepository, produtos: ProdutoRepository) =>
      new ListarUsosDoProdutoUseCase(registros, produtos),
    inject: [REGISTRO_DE_USO_REPOSITORY, PRODUTO_REPOSITORY],
  },
  {
    provide: ListarUsosDoTratamentoUseCase,
    useFactory: (registros: RegistroDeUsoRepository, tratamentos: TratamentoRepository) =>
      new ListarUsosDoTratamentoUseCase(registros, tratamentos),
    inject: [REGISTRO_DE_USO_REPOSITORY, TRATAMENTO_REPOSITORY],
  },
  {
    provide: ObterUsoUseCase,
    useFactory: (registros: RegistroDeUsoRepository) => new ObterUsoUseCase(registros),
    inject: [REGISTRO_DE_USO_REPOSITORY],
  },

  // Sessão Antes/Depois
  {
    provide: SESSAO_REPOSITORY,
    useFactory: (
      pool: Pool | null,
      memoria: ReturnType<typeof emMemoria>,
    ): SessaoAntesDepoisRepository =>
      pool ? new PostgresSessaoAntesDepoisRepository(pool) : memoria.sessoes,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },
  {
    provide: RegistrarSessaoAntesUseCase,
    useFactory: (
      sessoes: SessaoAntesDepoisRepository,
      registros: RegistroDeUsoRepository,
      produtos: ProdutoRepository,
      idGen: IdGenerator,
      eventos: EventPublisher,
    ) => new RegistrarSessaoAntesUseCase(sessoes, registros, produtos, idGen, eventos),
    inject: [
      SESSAO_REPOSITORY,
      REGISTRO_DE_USO_REPOSITORY,
      PRODUTO_REPOSITORY,
      ID_GENERATOR,
      EVENT_PUBLISHER,
    ],
  },
  {
    provide: RegistrarSessaoDepoisUseCase,
    useFactory: (sessoes: SessaoAntesDepoisRepository, eventos: EventPublisher) =>
      new RegistrarSessaoDepoisUseCase(sessoes, eventos),
    inject: [SESSAO_REPOSITORY, EVENT_PUBLISHER],
  },
  {
    provide: ObterSessaoUseCase,
    useFactory: (sessoes: SessaoAntesDepoisRepository) => new ObterSessaoUseCase(sessoes),
    inject: [SESSAO_REPOSITORY],
  },

  // Sintomas diários (linha de base)
  {
    provide: SINTOMA_DIARIO_REPOSITORY,
    useFactory: (
      pool: Pool | null,
      memoria: ReturnType<typeof emMemoria>,
    ): SintomaDiarioRepository =>
      pool ? new PostgresSintomaDiarioRepository(pool) : memoria.sintomas,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },
  {
    provide: RegistrarSintomaDiarioUseCase,
    useFactory: (repo: SintomaDiarioRepository, idGen: IdGenerator, eventos: EventPublisher) =>
      new RegistrarSintomaDiarioUseCase(repo, idGen, eventos),
    inject: [SINTOMA_DIARIO_REPOSITORY, ID_GENERATOR, EVENT_PUBLISHER],
  },
  {
    provide: ListarSintomasDiariosUseCase,
    useFactory: (repo: SintomaDiarioRepository) => new ListarSintomasDiariosUseCase(repo),
    inject: [SINTOMA_DIARIO_REPOSITORY],
  },

  // Efeitos (positivo/adverso por dose)
  {
    provide: EFEITO_REPOSITORY,
    useFactory: (pool: Pool | null, memoria: ReturnType<typeof emMemoria>): EfeitoRepository =>
      pool ? new PostgresEfeitoRepository(pool) : memoria.efeitos,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },
  {
    provide: RegistrarEfeitoUseCase,
    useFactory: (
      efeitos: EfeitoRepository,
      registros: RegistroDeUsoRepository,
      idGen: IdGenerator,
      eventos: EventPublisher,
    ) => new RegistrarEfeitoUseCase(efeitos, registros, idGen, eventos),
    inject: [EFEITO_REPOSITORY, REGISTRO_DE_USO_REPOSITORY, ID_GENERATOR, EVENT_PUBLISHER],
  },
  {
    provide: ListarEfeitosDaDoseUseCase,
    useFactory: (efeitos: EfeitoRepository, registros: RegistroDeUsoRepository) =>
      new ListarEfeitosDaDoseUseCase(efeitos, registros),
    inject: [EFEITO_REPOSITORY, REGISTRO_DE_USO_REPOSITORY],
  },

  // Evolução Clínica / Relatório — motor de agregação de leitura.
  {
    provide: REPOS_EVOLUCAO,
    useFactory: (
      tratamentos: TratamentoRepository,
      produtos: ProdutoRepository,
      registros: RegistroDeUsoRepository,
      sessoes: SessaoAntesDepoisRepository,
      sintomas: SintomaDiarioRepository,
      efeitos: EfeitoRepository,
    ): ReposDeEvolucao => ({ tratamentos, produtos, registros, sessoes, sintomas, efeitos }),
    inject: [
      TRATAMENTO_REPOSITORY,
      PRODUTO_REPOSITORY,
      REGISTRO_DE_USO_REPOSITORY,
      SESSAO_REPOSITORY,
      SINTOMA_DIARIO_REPOSITORY,
      EFEITO_REPOSITORY,
    ],
  },
  {
    provide: ObterEvolucaoUseCase,
    useFactory: (repos: ReposDeEvolucao) => new ObterEvolucaoUseCase(repos),
    inject: [REPOS_EVOLUCAO],
  },
  {
    provide: GerarRelatorioUseCase,
    useFactory: (repos: ReposDeEvolucao, eventos: EventPublisher) =>
      new GerarRelatorioUseCase(repos, eventos),
    inject: [REPOS_EVOLUCAO, EVENT_PUBLISHER],
  },

  // Modelos de Tratamento (Premium)
  {
    provide: MODELO_DE_TRATAMENTO_REPOSITORY,
    useFactory: (
      pool: Pool | null,
      memoria: ReturnType<typeof emMemoria>,
    ): ModeloDeTratamentoRepository =>
      pool ? new PostgresModeloDeTratamentoRepository(pool) : memoria.modelos,
    inject: [PG_POOL, REPOSITORIOS_EM_MEMORIA],
  },
  {
    provide: CriarModeloDeTratamentoUseCase,
    useFactory: (
      repo: ModeloDeTratamentoRepository,
      premium: PremiumPublicApi,
      idGen: IdGenerator,
    ) => new CriarModeloDeTratamentoUseCase(repo, premium, idGen),
    inject: [MODELO_DE_TRATAMENTO_REPOSITORY, PREMIUM_PUBLIC_API, ID_GENERATOR],
  },
  {
    provide: ListarModelosDeTratamentoUseCase,
    useFactory: (repo: ModeloDeTratamentoRepository) => new ListarModelosDeTratamentoUseCase(repo),
    inject: [MODELO_DE_TRATAMENTO_REPOSITORY],
  },
  {
    provide: RemoverModeloDeTratamentoUseCase,
    useFactory: (repo: ModeloDeTratamentoRepository) => new RemoverModeloDeTratamentoUseCase(repo),
    inject: [MODELO_DE_TRATAMENTO_REPOSITORY],
  },
];

/**
 * Importa o BillingModule apenas pela PREMIUM_PUBLIC_API (gate dos Modelos de Tratamento):
 * o Med pergunta "é Premium?" e nunca reimplementa regra de cobrança. Não importa, e não
 * pode importar, nenhum módulo do Grow (doc 04 §24, enforçado por lint).
 */
@Module({
  imports: [AuthModule, BillingModule],
  controllers: [
    // Antes do TratamentoController: `tratamentos/modelos` precisa casar antes de
    // `tratamentos/:tratamentoId`.
    ModeloDeTratamentoController,
    TratamentoController,
    ProdutoController,
    RegistroDeUsoController,
    SessaoController,
    SintomaDiarioController,
    EfeitoController,
    EvolucaoController,
  ],
  providers,
})
export class MedModule {}
