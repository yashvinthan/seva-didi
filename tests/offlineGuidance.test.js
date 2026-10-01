import test from 'node:test';
import assert from 'node:assert/strict';
import { getOfflineGuidance, getOfflineDocuments, getOfflineVoicePrompts } from '../src/services/offlineGuidance.js';

test('getOfflineGuidance returns structured guidance for PMUY', () => {
  const guidance = getOfflineGuidance({
    language: 'hi',
    resourceId: 'pmuy-new-connection',
    currentScreen: 'eligibility',
  });

  assert.ok(guidance);
  assert.ok(guidance.title);
  assert.ok(guidance.eligibility);
  assert.ok(Array.isArray(guidance.documents));
  assert.ok(guidance.documents.length >= 4);
  assert.ok(Array.isArray(guidance.steps));
  assert.ok(guidance.steps.length >= 3);
  assert.equal(guidance.source, 'Offline Knowledge Base');
});

test('getOfflineGuidance handles regional languages like Tamil (ta)', () => {
  const guidance = getOfflineGuidance({
    language: 'ta',
    resourceId: 'pmuy-new-connection',
  });

  assert.ok(guidance);
  assert.match(guidance.title, /உஜ்வாலா|PMUY/);
  assert.ok(guidance.steps.length > 0);
});

test('getOfflineGuidance returns customized content for PMMVY scheme', () => {
  const guidance = getOfflineGuidance({
    language: 'hi',
    resourceId: 'pmmvy',
  });

  assert.ok(guidance);
  assert.match(guidance.title, /मातृ वंदना|PMMVY/);
  assert.ok(guidance.documents.some((d) => d.name.includes('MCP') || d.name.includes('मातृ')));
});

test('getOfflineGuidance returns customized content for Skill India scheme', () => {
  const guidance = getOfflineGuidance({
    language: 'en',
    resourceId: 'skill-india',
  });

  assert.ok(guidance);
  assert.match(guidance.title, /Skill|PMKVY/);
  assert.ok(guidance.documents.some((d) => d.name.includes('Aadhaar') || d.name.includes('Marksheet')));
});

test('getOfflineGuidance falls back gracefully for unknown resource', () => {
  const guidance = getOfflineGuidance({
    language: 'hi',
    resourceId: 'unknown-welfare-scheme',
  });

  assert.ok(guidance);
  assert.ok(guidance.title);
  assert.ok(guidance.documents.length > 0);
});

test('getOfflineDocuments returns required checklist for schemes', () => {
  const docsHi = getOfflineDocuments('pmuy-new-connection', 'hi');
  assert.ok(Array.isArray(docsHi));
  assert.ok(docsHi.length >= 4);

  const docsEn = getOfflineDocuments('pmmvy', 'en');
  assert.ok(Array.isArray(docsEn));
  assert.ok(docsEn.some((d) => d.name.toLowerCase().includes('mcp')));
});

test('getOfflineVoicePrompts returns accessible prompts for woman users', () => {
  const promptsHi = getOfflineVoicePrompts('hi');
  assert.ok(Array.isArray(promptsHi));
  assert.ok(promptsHi.length >= 4);
  assert.ok(promptsHi.some((p) => p.text.includes('गैस') || p.text.includes('उज्ज्वला')));

  const promptsEn = getOfflineVoicePrompts('en');
  assert.ok(promptsEn.some((p) => p.text.toLowerCase().includes('gas')));
});
