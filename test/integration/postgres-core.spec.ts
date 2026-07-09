import { randomUUID } from 'node:crypto';
import type { Pool } from 'pg';
import type { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import {
  PostgresSessaoRepository,
  PostgresUsuarioRepository,
  criarPgPool,
} from '@cosmaria/core-infrastructure';
import { Email, SessaoDeAutenticacao, Usuario } from '@cosmaria/core-domain';
import { aplicarMigrations, iniciarPostgres } from './support/containers';

/**
 * Integração REAL dos repositórios do Core contra um PostgreSQL efêmero
 * (Testcontainers) com as migrations versionadas aplicadas. Valida o roundtrip
 * de persistência que os testes in-memory não conseguem provar (SQL, schema
 * `core`, FK, upsert de revogação).
 */
describe('Repositórios Postgres do Core (integração)', () => {
  let container: StartedPostgreSqlContainer;
  let pool: Pool;
  let usuarios: PostgresUsuarioRepository;
  let sessoes: PostgresSessaoRepository;

  beforeAll(async () => {
    container = await iniciarPostgres();
    await aplicarMigrations(container.getConnectionUri());
    pool = criarPgPool(container.getConnectionUri());
    usuarios = new PostgresUsuarioRepository(pool);
    sessoes = new PostgresSessaoRepository(pool);
  }, 180_000);

  afterAll(async () => {
    await pool?.end();
    await container?.stop();
  });

  it('a migration criou o schema e as tabelas do Core', async () => {
    const { rows } = await pool.query<{ tabela: string }>(
      `SELECT table_name AS tabela FROM information_schema.tables
       WHERE table_schema = 'core' ORDER BY table_name`,
    );
    const tabelas = rows.map((r) => r.tabela);
    expect(tabelas).toEqual(expect.arrayContaining(['usuario', 'sessao_de_autenticacao']));
  });

  it('persiste e recupera um Usuário por e-mail e por id', async () => {
    const email = Email.criar(`u-${randomUUID()}@cosmaria.app`);
    const usuario = Usuario.criar({ id: randomUUID(), email, senhaHash: 'hash-fake' });

    await usuarios.salvar(usuario);

    expect(await usuarios.existeComEmail(email)).toBe(true);

    const porEmail = await usuarios.buscarPorEmail(email);
    expect(porEmail?.id).toBe(usuario.id);
    expect(porEmail?.email.toString()).toBe(email.toString());

    const porId = await usuarios.buscarPorId(usuario.id);
    expect(porId?.email.equals(email)).toBe(true);
  });

  it('retorna null para e-mail inexistente', async () => {
    const inexistente = Email.criar(`ninguem-${randomUUID()}@cosmaria.app`);
    expect(await usuarios.buscarPorEmail(inexistente)).toBeNull();
    expect(await usuarios.existeComEmail(inexistente)).toBe(false);
  });

  it('persiste uma Sessão e aplica a revogação via upsert (rotação de refresh)', async () => {
    const email = Email.criar(`s-${randomUUID()}@cosmaria.app`);
    const usuario = Usuario.criar({ id: randomUUID(), email, senhaHash: 'hash-fake' });
    await usuarios.salvar(usuario);

    const sessao = SessaoDeAutenticacao.criar({
      id: randomUUID(),
      usuarioId: usuario.id,
      refreshTokenHash: 'refresh-hash',
      expiraEm: new Date(Date.now() + 60_000),
    });
    await sessoes.salvar(sessao);

    const persistida = await sessoes.buscarPorId(sessao.id);
    expect(persistida?.estaValida()).toBe(true);

    sessao.revogar();
    await sessoes.salvar(sessao); // mesmo id → upsert atualiza revogada_em

    const revogada = await sessoes.buscarPorId(sessao.id);
    expect(revogada?.revogadaEm).not.toBeNull();
    expect(revogada?.estaValida()).toBe(false);
  });
});
