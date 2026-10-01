import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectLanguage } from '../shared/detectLanguage.js';

describe('Language Auto-Detection Engine', () => {
  it('detects Hindi in Devanagari script', () => {
    const result = detectLanguage('मुझे नया गैस कनेक्शन चाहिए');
    assert.equal(result.code, 'hi');
    assert.ok(result.confidence > 0.8);
  });

  it('detects Marathi via lexical markers in Devanagari script', () => {
    const result = detectLanguage('मला गॅस कनेक्शन पाहिजे आहे');
    assert.equal(result.code, 'mr');
    assert.ok(result.confidence > 0.8);
  });

  it('detects Bengali script', () => {
    const result = detectLanguage('আমার নতুন গ্যাস সিলিন্ডার দরকার');
    assert.equal(result.code, 'bn');
    assert.ok(result.confidence > 0.8);
  });

  it('detects Tamil script', () => {
    const result = detectLanguage('எனக்கு எரிவாயு இணைப்பு வேண்டும்');
    assert.equal(result.code, 'ta');
    assert.ok(result.confidence > 0.8);
  });

  it('detects Telugu script', () => {
    const result = detectLanguage('నాకు గ్యాస్ కనెక్షన్ కావాలి');
    assert.equal(result.code, 'te');
    assert.ok(result.confidence > 0.8);
  });

  it('detects Kannada script', () => {
    const result = detectLanguage('ನನಗೆ ಗ್ಯಾಸ್ ಸಂಪರ್ಕ ಬೇಕು');
    assert.equal(result.code, 'kn');
    assert.ok(result.confidence > 0.8);
  });

  it('detects Gujarati script', () => {
    const result = detectLanguage('મને ગેસ કનેક્શન જોઈએ છે');
    assert.equal(result.code, 'gu');
    assert.ok(result.confidence > 0.8);
  });

  it('detects Malayalam script', () => {
    const result = detectLanguage('എനിക്ക് ഗ്യാസ് കണക്ഷൻ വേണം');
    assert.equal(result.code, 'ml');
    assert.ok(result.confidence > 0.8);
  });

  it('detects Punjabi in Gurmukhi script', () => {
    const result = detectLanguage('ਮੈਨੂੰ ਗੈਸ ਕਨੈਕਸ਼ਨ ਚਾਹੀਦਾ ਹੈ');
    assert.equal(result.code, 'pa');
    assert.ok(result.confidence > 0.8);
  });

  it('detects Odia script', () => {
    const result = detectLanguage('ମୋତେ ଗ୍ୟାସ ସଂଯୋଗ ଦରକାର');
    assert.equal(result.code, 'or');
    assert.ok(result.confidence > 0.8);
  });

  it('detects Urdu in Arabic script', () => {
    const result = detectLanguage('مجھے نیا گیس کنکشن چاہیے');
    assert.equal(result.code, 'ur');
    assert.ok(result.confidence > 0.8);
  });

  it('detects Hinglish in Latin script', () => {
    const result = detectLanguage('mujhe gas connection chahiye didi');
    assert.equal(result.code, 'hi-Latn');
    assert.ok(result.confidence > 0.5);
  });

  it('detects Tanglish in Latin script', () => {
    const result = detectLanguage('enakku gas connection venum didi');
    assert.equal(result.code, 'ta-Latn');
    assert.ok(result.confidence > 0.5);
  });

  it('detects English in Latin script', () => {
    const result = detectLanguage('How can I apply for a cooking gas scheme?');
    assert.equal(result.code, 'en');
    assert.ok(result.confidence > 0.5);
  });

  it('handles empty or blank input gracefully', () => {
    assert.equal(detectLanguage('').code, 'hi');
    assert.equal(detectLanguage('   ').code, 'hi');
    assert.equal(detectLanguage(null).code, 'hi');
  });
});
