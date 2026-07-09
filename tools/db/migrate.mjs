// Executor de migrations do COSMARIA (Sprint de Infraestrutura, 2026-07-09).
// Decisão validada: node-pg-migrate via COMANDO DEDICADO, nunca no boot da app
// (evita corrida entre instâncias no Cloud Run — doc 09, stateless).
//
// Uso:  node tools/db/migrate.mjs up      (aplica todas as pendentes)
//       node tools/db/migrate.mjs down    (reverte a última)
//
// `dotenv/config` carrega o .env LOCAL se existir, mas NUNCA sobrescreve uma
// variável já presente no ambiente — então o serviço `migrate` do compose e os
// Testcontainers passam sua própria DATABASE_URL sem conflito.
import 'dotenv/config';
import runner from 'node-pg-migrate';

const direction = process.argv[2] === 'down' ? 'down' : 'up';
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('[migrate] DATABASE_URL não definida (defina no ambiente ou em .env).');
  process.exit(1);
}

try {
  const applied = await runner({
    databaseUrl,
    dir: 'migrations',
    direction,
    migrationsTable: 'pgmigrations',
    count: direction === 'down' ? 1 : Infinity,
  });
  if (applied.length === 0) {
    console.log(`[migrate] nenhuma migration ${direction} pendente.`);
  } else {
    console.log(`[migrate] ${direction} aplicada(s): ${applied.map((m) => m.name).join(', ')}`);
  }
  process.exit(0);
} catch (err) {
  console.error('[migrate] falhou:', err.message);
  process.exit(1);
}
