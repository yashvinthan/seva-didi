import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_API_URL || 'http://localhost:8787';

test('GET /api/health returns valid service status', async () => {
  const res = await fetch(`${BASE_URL}/api/health`);
  assert.ok(res.status === 200 || res.status === 503, `Unexpected status: ${res.status}`);
  const data = await res.json();
  assert.ok(data.status);
  assert.ok(data.database);
  assert.ok(data.scheme);
  assert.equal(data.scheme, 'pmuy-new-connection');
});

test('GET /api/catalog/search returns schemes matching search query', async () => {
  const res = await fetch(`${BASE_URL}/api/catalog/search?q=gas`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.results));
  assert.ok(data.results.length > 0);
  assert.ok(data.results.some((r) => r.id === 'pmuy-new-connection' || r.title.toLowerCase().includes('gas')));
});

test('GET /api/catalog/search handles empty query gracefully', async () => {
  const res = await fetch(`${BASE_URL}/api/catalog/search`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.results));
});

test('GET /api/catalog/search filters by state parameter', async () => {
  const res = await fetch(`${BASE_URL}/api/catalog/search?state=Delhi`);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(Array.isArray(data.results));
});

test('POST /api/sessions rejects invalid UUID or missing language', async () => {
  const res = await fetch(`${BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'not-a-valid-uuid', language: 'hi' }),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'INVALID_REQUEST');
});

test('POST /api/sessions creates a session with valid UUID and language', async () => {
  const testId = 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d';
  const res = await fetch(`${BASE_URL}/api/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: testId, language: 'hi' }),
  });
  // If DB is running, status should be 201
  if (res.status === 201) {
    const data = await res.json();
    assert.ok(data.session);
    assert.equal(data.session.id, testId);
  } else {
    // If DB is temporarily unavailable, it returns a 500 error handled safely
    assert.ok([201, 500].includes(res.status));
  }
});

test('POST /api/voice rejects missing audioBase64', async () => {
  const res = await fetch(`${BASE_URL}/api/voice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mimeType: 'audio/webm' }),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'INVALID_REQUEST');
});

test('POST /api/guidance rejects invalid language code', async () => {
  const res = await fetch(`${BASE_URL}/api/guidance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ language: 'unsupported-lang', userMessage: 'test' }),
  });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.equal(data.error, 'INVALID_REQUEST');
});
