// Seed inicial idempotente do COSMARIA (Sprint de Infraestrutura, 2026-07-09).
// Roda DEPOIS das migrations. Idempotente: pode rodar N vezes sem duplicar dados
// (ON CONFLICT DO NOTHING). Cria um usuário de desenvolvimento para validar o
// fluxo real de auth contra o banco. Catálogos de referência (fases de vida,
// tipos de efeito etc.) entram aqui conforme os módulos de domínio forem criados.
import 'dotenv/config';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('[seed] DATABASE_URL não definida (defina no ambiente ou em .env).');
  process.exit(1);
}

const devEmail = process.env.SEED_DEV_EMAIL ?? 'dev@cosmaria.app';
const devSenha = process.env.SEED_DEV_SENHA ?? 'cosmaria-dev-123';

const pool = new pg.Pool({ connectionString: databaseUrl });

try {
  const senhaHash = await bcrypt.hash(devSenha, 12);
  const { rowCount } = await pool.query(
    `INSERT INTO core.usuario (id, email, senha_hash, status)
     VALUES ($1, $2, $3, 'ATIVO')
     ON CONFLICT (email) DO NOTHING`,
    [randomUUID(), devEmail, senhaHash],
  );
  console.log(
    rowCount > 0
      ? `[seed] usuário de dev criado: ${devEmail}`
      : `[seed] usuário de dev já existia: ${devEmail} (idempotente)`,
  );
  process.exit(0);
} catch (err) {
  console.error('[seed] falhou:', err.message || err.code || String(err));
  process.exit(1);
} finally {
  await pool.end();
}
