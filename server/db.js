import process from 'node:process';
import pg from 'pg';
import { LANGUAGE_CODES } from '../shared/languages.js';

const { Pool } = pg;
let pool;
const memorySessions = new Map();

export function getPool() {
  if (!process.env.DATABASE_URL) return null;
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
  const p = getPool();
  if (!p) {
    console.info('[db] DATABASE_URL not set; running with in-memory session store.');
    return;
  }
  try {
    const client = await p.connect();
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
  } catch (err) {
    console.warn('[db] Postgres connection failed; falling back to in-memory sessions:', err.message);
  }
}

export async function createSession({ id, language }) {
  const p = getPool();
  if (!p) {
    const session = {
      id,
      language,
      current_screen: 'home',
      selected_answer: null,
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    memorySessions.set(id, session);
    return session;
  }
  try {
    const result = await p.query(
      `INSERT INTO sessions (id, language) VALUES ($1, $2)
       ON CONFLICT (id) DO UPDATE SET language = EXCLUDED.language, updated_at = NOW(), expires_at = NOW() + INTERVAL '24 hours'
       RETURNING id, language, current_screen, selected_answer, expires_at`,
      [id, language],
    );
    return result.rows[0];
  } catch {
    const session = {
      id,
      language,
      current_screen: 'home',
      selected_answer: null,
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    memorySessions.set(id, session);
    return session;
  }
}

export async function updateSession(id, updates) {
  const p = getPool();
  if (!p) {
    const existing = memorySessions.get(id) || { id, language: 'hi', current_screen: 'home', selected_answer: null };
    const updated = {
      ...existing,
      language: updates.language || existing.language,
      current_screen: updates.currentScreen || existing.current_screen,
      selected_answer: updates.selectedAnswer !== undefined ? updates.selectedAnswer : existing.selected_answer,
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    memorySessions.set(id, updated);
    return updated;
  }
  try {
    const result = await p.query(
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
  } catch {
    const existing = memorySessions.get(id) || { id, language: 'hi', current_screen: 'home', selected_answer: null };
    const updated = {
      ...existing,
      language: updates.language || existing.language,
      current_screen: updates.currentScreen || existing.current_screen,
      selected_answer: updates.selectedAnswer !== undefined ? updates.selectedAnswer : existing.selected_answer,
      expires_at: new Date(Date.now() + 86400000).toISOString(),
    };
    memorySessions.set(id, updated);
    return updated;
  }
}

export async function closePool() {
  if (pool) await pool.end();
}
