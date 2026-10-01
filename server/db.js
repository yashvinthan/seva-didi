import process from 'node:process';
import pg from 'pg';
import { LANGUAGE_CODES } from '../shared/languages.js';

const { Pool } = pg;
let pool;

export function getPool() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  pool ||= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.DB_POOL_MAX || 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined,
  });
  return pool;
}

export async function migrate() {
  const client = await getPool().connect();
  const supportedLanguages = LANGUAGE_CODES.map((code) => `'${code}'`).join(', ');
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY,
        language TEXT NOT NULL CHECK (language IN (${supportedLanguages})),
        current_screen TEXT NOT NULL DEFAULT 'home',
        selected_answer TEXT CHECK (selected_answer IN ('yes', 'no')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
      );
      ALTER TABLE sessions DROP CONSTRAINT IF EXISTS sessions_language_check;
      ALTER TABLE sessions ADD CONSTRAINT sessions_language_check CHECK (language IN (${supportedLanguages}));
      CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions (expires_at);
    `);
  } finally {
    client.release();
  }
}

export async function createSession({ id, language }) {
  const result = await getPool().query(
    `INSERT INTO sessions (id, language) VALUES ($1, $2)
     ON CONFLICT (id) DO UPDATE SET language = EXCLUDED.language, updated_at = NOW(), expires_at = NOW() + INTERVAL '24 hours'
     RETURNING id, language, current_screen, selected_answer, expires_at`,
    [id, language],
  );
  return result.rows[0];
}

export async function updateSession(id, updates) {
  const result = await getPool().query(
    `UPDATE sessions
     SET language = COALESCE($2, language),
         current_screen = COALESCE($3, current_screen),
         selected_answer = COALESCE($4, selected_answer),
         updated_at = NOW(),
         expires_at = NOW() + INTERVAL '24 hours'
     WHERE id = $1 AND expires_at > NOW()
     RETURNING id, language, current_screen, selected_answer, expires_at`,
    [id, updates.language || null, updates.currentScreen || null, updates.selectedAnswer || null],
  );
  return result.rows[0] || null;
}

export async function closePool() {
  if (pool) await pool.end();
}
