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

const TELUGU_LATIN_MARKERS = [
  'naku', 'kavali', 'cheppandi', 'ela', 'avasaram', 'enti', 'andi', 'meeru', 'evaru'
];

const BENGALI_LATIN_MARKERS = [
  'amar', 'lagbe', 'kivabe', 'bolun', 'darokar', 'sahajjo', 'apni', 'amake'
];

const MARATHI_LATIN_MARKERS = [
  'mala', 'pahije', 'kasa', 'sang', 'mahit', 'dya', 'aahe'
];

const KANNADA_LATIN_MARKERS = [
  'nanage', 'beku', 'hege', 'heli', 'yojane', 'nimma', 'nanna'
];

const GUJARATI_LATIN_MARKERS = [
  'mane', 'joiye', 'kem', 'chhe', 'maru', 'tamare'
];

const PUNJABI_LATIN_MARKERS = [
  'mainu', 'chahida', 'kiven', 'dasso', 'mera', 'tussi'
];

const MALAYALAM_LATIN_MARKERS = [
  'enikku', 'venam', 'engane', 'sahayam', 'ariyaan', 'ente'
];

const ODIA_LATIN_MARKERS = [
  'mote', 'darkar', 'kemiti', 'kuha', 'mora'
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

  // 2. Latin script analysis (English vs Hinglish vs Tanglish vs regional transliterations)
  const words = trimmed.toLowerCase().split(/[\s,?.!;:()"-]+/).filter(Boolean);
  if (words.length === 0) {
    return { code: 'en', confidence: 0.5, method: 'fallback-english' };
  }

  let hinglishCount = 0;
  let tanglishCount = 0;
  let teluguCount = 0;
  let bengaliCount = 0;
  let marathiCount = 0;
  let kannadaCount = 0;
  let gujaratiCount = 0;
  let punjabiCount = 0;
  let malayalamCount = 0;
  let odiaCount = 0;
  let englishCount = 0;

  for (const word of words) {
    if (HINGLISH_MARKERS.includes(word)) hinglishCount += 1;
    if (TANGLISH_MARKERS.includes(word)) tanglishCount += 1;
    if (TELUGU_LATIN_MARKERS.includes(word)) teluguCount += 1;
    if (BENGALI_LATIN_MARKERS.includes(word)) bengaliCount += 1;
    if (MARATHI_LATIN_MARKERS.includes(word)) marathiCount += 1;
    if (KANNADA_LATIN_MARKERS.includes(word)) kannadaCount += 1;
    if (GUJARATI_LATIN_MARKERS.includes(word)) gujaratiCount += 1;
    if (PUNJABI_LATIN_MARKERS.includes(word)) punjabiCount += 1;
    if (MALAYALAM_LATIN_MARKERS.includes(word)) malayalamCount += 1;
    if (ODIA_LATIN_MARKERS.includes(word)) odiaCount += 1;
    if (ENGLISH_MARKERS.includes(word)) englishCount += 1;
  }

  const scores = [
    { code: 'ta-Latn', count: tanglishCount, method: 'tanglish-lexicon' },
    { code: 'hi-Latn', count: hinglishCount, method: 'hinglish-lexicon' },
    { code: 'te', count: teluguCount, method: 'telugu-latin-lexicon' },
    { code: 'bn', count: bengaliCount, method: 'bengali-latin-lexicon' },
    { code: 'mr', count: marathiCount, method: 'marathi-latin-lexicon' },
    { code: 'kn', count: kannadaCount, method: 'kannada-latin-lexicon' },
    { code: 'gu', count: gujaratiCount, method: 'gujarati-latin-lexicon' },
    { code: 'pa', count: punjabiCount, method: 'punjabi-latin-lexicon' },
    { code: 'ml', count: malayalamCount, method: 'malayalam-latin-lexicon' },
    { code: 'or', count: odiaCount, method: 'odia-latin-lexicon' },
  ];

  scores.sort((a, b) => b.count - a.count);
  const bestRegional = scores[0];

  if (bestRegional.count > 0 && bestRegional.count >= englishCount) {
    const confidence = Math.min(1, Math.round((bestRegional.count / words.length) * 100) / 100 + 0.35);
    return { code: bestRegional.code, confidence, method: bestRegional.method };
  }

  return { code: 'en', confidence: 0.8, method: 'latin-english-default' };
}
