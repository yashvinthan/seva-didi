export async function getGeminiGuidance({ answer, language, userMessage = '', resourceId }) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);
  let response;
  try {
    response = await fetch('/api/guidance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answer, language, userMessage, resourceId }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || 'Guidance is temporarily unavailable.');
    error.code = payload.error || 'GUIDANCE_UNAVAILABLE';
    throw error;
  }
  return payload.guidance;
}
