async function fetchWithTimeout(input, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function getHealth() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return { ok: false, status: 'offline', database: 'offline', gemini: 'offline' };
  const response = await fetchWithTimeout('/api/health');
  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok, ...payload };
}

export async function openSession(id, language) {
  const response = await fetchWithTimeout('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, language }),
  });
  if (!response.ok) throw new Error('Session could not be created');
  return response.json();
}

export async function saveProgress(id, progress) {
  const response = await fetchWithTimeout(`/api/sessions/${id}/progress`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(progress),
  });
  if (!response.ok) throw new Error('Progress could not be saved');
  return response.json();
}

export async function searchSchemeCatalog(query, { state = '', limit = 12 } = {}) {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  if (state) params.set('state', state);
  const response = await fetchWithTimeout(`/api/catalog/search?${params.toString()}`, {}, 7000);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Scheme search could not be completed');
  return payload;
}

export async function transcribeVoiceWithApi(audioBlob, mimeType = 'audio/webm') {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { ok: false, error: 'OFFLINE' };
  }

  const arrayBuffer = await audioBlob.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const audioBase64 = btoa(binary);

  const response = await fetchWithTimeout('/api/voice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ audioBase64, mimeType }),
  }, 12000);

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { ok: false, error: payload.error || 'API_ERROR', message: payload.message };
  }
  return payload;
}

