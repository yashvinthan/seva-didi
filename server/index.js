import 'dotenv/config';
import path from 'node:path';
import process from 'node:process';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { z } from 'zod';
import { closePool, createSession, getPool, migrate, updateSession } from './db.js';
import { generateGuidance, isGeminiConfigured, transcribeAudioWithGemini } from './gemini.js';
import { pmuyKnowledge } from './scheme.js';
import { getSchemeDatasetResource, getSchemeDatasetStatus, searchSchemeDataset } from './catalog.js';
import { LANGUAGE_CODES } from '../shared/languages.js';
import { RESOURCE_CATALOG } from '../shared/resources.js';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const app = express();
const port = Number(process.env.PORT || 8787);
const isProduction = process.env.NODE_ENV === 'production';
const allowedOrigin = process.env.APP_ORIGIN || 'http://localhost:5173';

app.disable('x-powered-by');
if (isProduction) app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: allowedOrigin, methods: ['GET', 'POST', 'PUT'], credentials: false }));
app.use(express.json({ limit: '5mb' }));
app.use(pinoHttp({ logger }));

const guidanceLimiter = rateLimit({ windowMs: 60_000, limit: 30, standardHeaders: true, legacyHeaders: false });
const languageSchema = z.enum(LANGUAGE_CODES);
const sessionSchema = z.object({ id: z.string().uuid(), language: languageSchema });
const progressSchema = z.object({
  language: languageSchema.optional(),
  currentScreen: z.enum(['home', 'eligibility', 'documents', 'visit', 'done']).optional(),
  selectedAnswer: z.enum(['yes', 'no']).nullable().optional(),
});
const guidanceRequestSchema = z.object({
  language: languageSchema,
  userMessage: z.string().trim().max(600).optional().default(''),
  answer: z.enum(['yes', 'no']).optional(),
  resourceId: z.string().trim().max(80).optional(),
});
const catalogSearchSchema = z.object({
  q: z.string().trim().max(160).optional().default(''),
  state: z.string().trim().max(80).optional().default(''),
  limit: z.coerce.number().int().min(1).max(30).optional().default(12),
});

app.get('/api/health', async (_req, res) => {
  let database = 'unavailable';
  try {
    await getPool().query('SELECT 1');
    database = 'ready';
  } catch (error) {
    logger.warn({ err: error }, 'Database health check failed');
  }
  const ready = database === 'ready' && isGeminiConfigured();
  res.status(ready ? 200 : 503).json({ status: ready ? 'ok' : 'degraded', database, gemini: isGeminiConfigured() ? 'configured' : 'missing', scheme: pmuyKnowledge.id });
});

app.post('/api/sessions', async (req, res, next) => {
  try {
    const payload = sessionSchema.parse(req.body);
    const session = await createSession(payload);
    res.status(201).json({ session });
  } catch (error) {
    next(error);
  }
});

app.put('/api/sessions/:id/progress', async (req, res, next) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const payload = progressSchema.parse(req.body);
    const session = await updateSession(id, payload);
    if (!session) return res.status(404).json({ error: 'SESSION_NOT_FOUND', message: 'This session has expired. Please start again.' });
    return res.json({ session });
  } catch (error) {
    return next(error);
  }
});

app.get('/api/catalog/search', async (req, res, next) => {
  try {
    const query = catalogSearchSchema.parse(req.query);
    const results = await searchSchemeDataset({ query: query.q, state: query.state, limit: query.limit });
    return res.json({ results, source: getSchemeDatasetStatus() });
  } catch (error) {
    return next(error);
  }
});

app.post('/api/guidance', guidanceLimiter, async (req, res, next) => {
  try {
    const payload = guidanceRequestSchema.parse(req.body);
    if (!isGeminiConfigured()) return res.status(503).json({ error: 'AI_NOT_CONFIGURED', message: 'Guidance is temporarily unavailable. Please try again later.' });
    const guidance = await generateGuidance(payload);
    const resource = RESOURCE_CATALOG.find((item) => item.id === payload.resourceId);
    const datasetResource = !resource && payload.resourceId ? await getSchemeDatasetResource(payload.resourceId) : null;
    const source = resource
      ? { label: resource.title, url: resource.officialUrl, lastReviewed: '2026-10-01' }
      : datasetResource
        ? { label: datasetResource.title, url: datasetResource.officialUrl, lastReviewed: datasetResource.source.scrapedAt || 'Dataset catalogue' }
        : { label: pmuyKnowledge.sourceLabel, url: pmuyKnowledge.sourceUrl, lastReviewed: pmuyKnowledge.lastReviewed };
    return res.json({ guidance, source });
  } catch (error) {
    return next(error);
  }
});

const voiceRequestSchema = z.object({
  audioBase64: z.string().min(1, 'Audio data is required'),
  mimeType: z.string().optional().default('audio/webm'),
});

app.post('/api/voice', guidanceLimiter, async (req, res, next) => {
  try {
    const payload = voiceRequestSchema.parse(req.body);
    if (!isGeminiConfigured()) {
      return res.status(503).json({
        ok: false,
        error: 'AI_NOT_CONFIGURED',
        message: 'Online audio AI is not configured. Local voice and text mode active.',
      });
    }

    const result = await transcribeAudioWithGemini(payload);
    return res.json({ ok: true, ...result });
  } catch (error) {
    return next(error);
  }
});

if (isProduction) {
  const distPath = path.resolve(process.cwd(), 'dist');
  app.use(express.static(distPath, { maxAge: '1d', index: false }));
  app.get('/{*splat}', (_req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.use((error, req, res, _next) => {
  if (error instanceof z.ZodError) return res.status(400).json({ error: 'INVALID_REQUEST', message: 'Please check the information and try again.' });
  logger.error({ err: error, path: req.path }, 'Request failed');
  return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' });
});

let server;
async function start() {
  await migrate();
  server = app.listen(port, () => logger.info({ port, environment: process.env.NODE_ENV || 'development' }, 'Saheli API listening'));
}

start().catch((error) => {
  logger.fatal({ err: error }, 'Unable to start Saheli API');
  process.exitCode = 1;
});

async function shutdown(signal) {
  logger.info({ signal }, 'Shutting down');
  if (server) await new Promise((resolve) => server.close(resolve));
  await closePool();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
