import fs from 'node:fs/promises';
import path from 'node:path';

const DATASET_ID = 'smartduketech/indian-government-schemes-2025';
const DATASET_LICENSE = 'CC BY 4.0';
const datasetPath = process.env.SCHEMES_DATA_PATH || path.resolve(process.cwd(), 'data', 'Schemes.csv');
let rowsPromise;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ',') {
      row.push(field);
      field = '';
    } else if (character === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (character !== '\r') {
      field += character;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const headers = rows.shift()?.map((header) => header.trim()) || [];
  return rows.filter((values) => values.length === headers.length).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index]])));
}

function cleanText(value, fallback = '') {
  return String(value || fallback)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\*\*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function boundedText(value, fallback, maxLength) {
  const text = cleanText(value, fallback);
  return text.length > maxLength ? `${text.slice(0, maxLength - 1).trim()}…` : text;
}

function safeHttpUrl(value) {
  const url = cleanText(value);
  return /^https?:\/\//i.test(url) ? url : '';
}

async function loadRows() {
  try {
    const csv = await fs.readFile(datasetPath, 'utf8');
    return parseCsv(csv);
  } catch {
    return [];
  }
}

function getRows() {
  rowsPromise ||= loadRows();
  return rowsPromise;
}

function scoreRow(row, queryTokens) {
  const name = cleanText(row.name).toLocaleLowerCase();
  const searchText = [row.slug, row.name, row.description, row.ministry, row.department, row.state, row.category, row.beneficiary_type, row.eligibility_gender].map((value) => cleanText(value)).join(' ').toLocaleLowerCase();
  return queryTokens.reduce((score, token) => {
    if (name === token) return score + 100;
    if (name.includes(token)) return score + 30;
    if (searchText.includes(token)) return score + 8;
    return score;
  }, 0) + (String(row.eligibility_gender).toLocaleLowerCase().includes('female') ? 4 : 0);
}

function toResult(row, score) {
  const slug = cleanText(row.slug);
  const sourceUrl = safeHttpUrl(row.official_url) || safeHttpUrl(row.apply_url) || `https://www.myscheme.gov.in/schemes/${encodeURIComponent(slug)}`;
  return {
    id: `dataset:${slug}`,
    title: boundedText(row.name, slug, 180),
    summary: boundedText(row.description, 'Government scheme information from the national scheme catalogue.', 420),
    whatFor: boundedText(row.beneficiary_type, 'Eligible citizens; check the official eligibility details.', 260),
    nextStep: boundedText(row.application_process, 'Open the official scheme page and verify the current eligibility and application process.', 560),
    officialUrl: sourceUrl,
    applyUrl: safeHttpUrl(row.apply_url),
    state: boundedText(row.state || row.eligibility_state, 'Central', 120),
    ministry: boundedText(row.ministry || row.department, 'Government of India', 180),
    category: 'dataset',
    score,
    source: { dataset: DATASET_ID, license: DATASET_LICENSE, url: 'https://huggingface.co/datasets/smartduketech/indian-government-schemes-2025', scrapedAt: cleanText(row.scraped_at) },
  };
}

export async function searchSchemeDataset({ query = '', state = '', limit = 12 } = {}) {
  const rows = await getRows();
  const normalizedQuery = cleanText(query).toLocaleLowerCase();
  const queryTokens = normalizedQuery.split(/\s+/).filter((token) => token.length > 1);
  const normalizedState = cleanText(state).toLocaleLowerCase();
  if (!rows.length || (!queryTokens.length && !normalizedState)) return [];

  return rows
    .filter((row) => !normalizedState || [row.state, row.eligibility_state].some((value) => cleanText(value).toLocaleLowerCase().includes(normalizedState)))
    .map((row) => ({ row, score: scoreRow(row, queryTokens) }))
    .filter(({ score }) => queryTokens.length ? score > 0 : true)
    .sort((left, right) => right.score - left.score)
    .slice(0, Math.min(Math.max(Number(limit) || 12, 1), 30))
    .map(({ row, score }) => toResult(row, score));
}

export async function getSchemeDatasetResource(resourceId) {
  if (!String(resourceId || '').startsWith('dataset:')) return null;
  const slug = String(resourceId).slice('dataset:'.length);
  const rows = await getRows();
  const row = rows.find((candidate) => cleanText(candidate.slug) === slug);
  return row ? toResult(row, 0) : null;
}

export function getSchemeDatasetStatus() {
  return { dataset: DATASET_ID, license: DATASET_LICENSE, file: path.basename(datasetPath), url: 'https://huggingface.co/datasets/smartduketech/indian-government-schemes-2025' };
}
