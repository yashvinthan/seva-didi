// Fast, offline-capable language auto-detection for 15 Indian language modes
// Uses script-range Unicode analysis with lexical disambiguation.

export const SCRIPT_RANGES = [
  { script: 'devanagari', regex: /[\u0900-\u097F]/g, defaultCode: 'hi' },
  { script: 'bengali', regex: /[\u0980-\u09FF]/g, defaultCode: 'bn' },
  { script: 'tamil', regex: /[\u0B80-\u0BFF]/g, defaultCode: 'ta' },
  { script: 'telugu', regex: /[\u0C00-\u0C7F]/g, defaultCode: 'te' },
  { script: 'kannada', regex: /[\u0C80-\u0CFF]/g, defaultCode: 'kn' },
  { script: 'gujarati', regex: /[\u0A80-\u0AFF]/g, defaultCode: 'gu' },
  { script: 'malayalam', regex: /[\u0D00-\u0D7F]/g, defaultCode: 'ml' },
  { script: 'gurmukhi', regex: /[\u0A00-\u0A7F]/g, defaultCode: 'pa' },
  { script: 'odia', regex: /[\u0B00-\u0B7F]/g, defaultCode: 'or' },
  { script: 'arabic', regex: /[\u0600-\u06FF]/g, defaultCode: 'ur' },
];

const MARATHI_MARKERS = [
  'आहे', 'नाही', 'काय', 'कसे', 'मला', 'तुम्ही', 'पाहिजे', 'योजना', 'कागदपत्रे',
  'करा', 'पायऱ्या', 'हवे', 'मिळेल', 'सांगा', 'होय', 'नको'
];

const ASSAMESE_MARKERS = [
  'ৰ', 'ৱ', 'লাগে', 'কওক', 'আপোনাক', 'আছে', 'হ’ব', 'মই', 'কি', 'কৰিব', 'যোজনা'
];

// Uniquely Hindi/Hinglish phonetic words (excluding neutral English words like gas/scheme)
const HINGLISH_MARKERS = [
  'mujhe', 'mera', 'meri', 'mere', 'kya', 'chahiye', 'kaise', 'paise', 'yojana',
  'sarkari', 'kare', 'karen', 'nahi', 'hai', 'hain', 'milega', 'bataiye', 'namaste',
  'madad', 'silai', 'shiksha', 'bachha', 'mahila', 'ghar', 'kaagaz', 'bhi',
  'bhai', 'pata', 'bataye', 'batao', 'karo', 'dekhna', 'lene', 'wala', 'wali'
];

// Uniquely Tamil/Tanglish phonetic words
const TANGLISH_MARKERS = [
  'venum', 'enna', 'epdi', 'kaasu', 'kedaikkuma', 'illai', 'solla', 'romba',
  'pannunga', 'paththi', 'thittam', 'kudunga', 'inga', 'enakku', 'oru', 'aama',
  'vaanga', 'ponga', 'theriyum', 'illana', 'ungalukku', 'kelunga'
];

const ENGLISH_MARKERS = [
  'how', 'what', 'apply', 'help', 'please', 'where', 'can', 'for', 'cooking',
  'scheme', 'service', 'documents', 'eligible', 'benefit', 'women', 'need', 'want',
  'procedure', 'free', 'stove', 'ration', 'details', 'application'
];

/**
 * Automatically detects language code from raw text input or speech transcript.
 * @param {string} text - User input string
 * @returns {{ code: string, confidence: number, method: string }}
 */
export function detectLanguage(text) {
  if (!text || typeof text !== 'string') {
    return { code: 'hi', confidence: 0, method: 'default' };
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return { code: 'hi', confidence: 0, method: 'default' };
  }

  // 1. Check Indic scripts
  const scriptScores = SCRIPT_RANGES.map((entry) => {
    const matches = trimmed.match(entry.regex);
    return {
      script: entry.script,
      defaultCode: entry.defaultCode,
      count: matches ? matches.length : 0,
    };
  }).filter((entry) => entry.count > 0);

  if (scriptScores.length > 0) {
    // Pick dominant script
    scriptScores.sort((a, b) => b.count - a.count);
    const dominant = scriptScores[0];
    const totalChars = trimmed.replace(/\s+/g, '').length;
    const confidence = Math.min(1, Math.round((dominant.count / Math.max(1, totalChars)) * 100) / 100);

    // Disambiguate Devanagari (Hindi vs Marathi)
    if (dominant.script === 'devanagari') {
      const lower = trimmed.toLowerCase();
      const isMarathi = MARATHI_MARKERS.some((word) => lower.includes(word));
      return {
        code: isMarathi ? 'mr' : 'hi',
        confidence,
        method: isMarathi ? 'devanagari-marathi-lexicon' : 'devanagari-script',
      };
    }

    // Disambiguate Bengali script (Bengali vs Assamese)
    if (dominant.script === 'bengali') {
      const hasAssameseChars = ASSAMESE_MARKERS.some((marker) => trimmed.includes(marker));
      return {
        code: hasAssameseChars ? 'as' : 'bn',
        confidence,
        method: hasAssameseChars ? 'bengali-assamese-lexicon' : 'bengali-script',
      };
    }

    return {
      code: dominant.defaultCode,
      confidence,
      method: `${dominant.script}-script`,
    };
  }

  // 2. Latin script analysis (English vs Hinglish vs Tanglish)
  const words = trimmed.toLowerCase().split(/[\s,?.!;:()"-]+/).filter(Boolean);
  if (words.length === 0) {
    return { code: 'en', confidence: 0.5, method: 'fallback-english' };
  }

  let hinglishCount = 0;
  let tanglishCount = 0;
  let englishCount = 0;

  for (const word of words) {
    if (HINGLISH_MARKERS.includes(word)) hinglishCount += 1;
    if (TANGLISH_MARKERS.includes(word)) tanglishCount += 1;
    if (ENGLISH_MARKERS.includes(word)) englishCount += 1;
  }

  if (tanglishCount > 0 && tanglishCount >= hinglishCount) {
    const confidence = Math.min(1, Math.round((tanglishCount / words.length) * 100) / 100 + 0.3);
    return { code: 'ta-Latn', confidence, method: 'tanglish-lexicon' };
  }

  if (hinglishCount > 0 && hinglishCount > englishCount) {
    const confidence = Math.min(1, Math.round((hinglishCount / words.length) * 100) / 100 + 0.3);
    return { code: 'hi-Latn', confidence, method: 'hinglish-lexicon' };
  }

  return { code: 'en', confidence: 0.8, method: 'latin-english-default' };
}
