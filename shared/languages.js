export const LANGUAGE_META = {
  hi: { code: 'HI', label: 'हिंदी', nativeLabel: 'हिंदी', promptName: 'Hindi', speechLocale: 'hi-IN', group: 'regional' },
  bn: { code: 'BN', label: 'বাংলা', nativeLabel: 'বাংলা', promptName: 'Bengali', speechLocale: 'bn-IN', group: 'regional' },
  ta: { code: 'TA', label: 'தமிழ்', nativeLabel: 'தமிழ்', promptName: 'Tamil', speechLocale: 'ta-IN', group: 'regional' },
  te: { code: 'TE', label: 'తెలుగు', nativeLabel: 'తెలుగు', promptName: 'Telugu', speechLocale: 'te-IN', group: 'regional' },
  mr: { code: 'MR', label: 'मराठी', nativeLabel: 'मराठी', promptName: 'Marathi', speechLocale: 'mr-IN', group: 'regional' },
  kn: { code: 'KN', label: 'ಕನ್ನಡ', nativeLabel: 'ಕನ್ನಡ', promptName: 'Kannada', speechLocale: 'kn-IN', group: 'regional' },
  gu: { code: 'GU', label: 'ગુજરાતી', nativeLabel: 'ગુજરાતી', promptName: 'Gujarati', speechLocale: 'gu-IN', group: 'regional' },
  ml: { code: 'ML', label: 'മലയാളം', nativeLabel: 'മലയാളം', promptName: 'Malayalam', speechLocale: 'ml-IN', group: 'regional' },
  pa: { code: 'PA', label: 'ਪੰਜਾਬੀ', nativeLabel: 'ਪੰਜਾਬੀ', promptName: 'Punjabi', speechLocale: 'pa-IN', group: 'regional' },
  or: { code: 'OR', label: 'ଓଡ଼ିଆ', nativeLabel: 'ଓଡ଼ିଆ', promptName: 'Odia', speechLocale: 'or-IN', group: 'regional' },
  as: { code: 'AS', label: 'অসমীয়া', nativeLabel: 'অসমীয়া', promptName: 'Assamese', speechLocale: 'as-IN', group: 'regional' },
  ur: { code: 'UR', label: 'اردو', nativeLabel: 'اردو', promptName: 'Urdu', speechLocale: 'ur-IN', group: 'regional', dir: 'rtl' },
  en: { code: 'EN', label: 'English', nativeLabel: 'English', promptName: 'English', speechLocale: 'en-IN', group: 'regional' },
  'hi-Latn': { code: 'HI-L', label: 'Hinglish', nativeLabel: 'Hinglish', promptName: 'Hinglish (Hindi in Latin script)', speechLocale: 'hi-IN', group: 'code-mixed' },
  'ta-Latn': { code: 'TA-L', label: 'Tanglish', nativeLabel: 'Tanglish', promptName: 'Tanglish (Tamil in Latin script)', speechLocale: 'ta-IN', group: 'code-mixed' },
};

export const LANGUAGE_CODES = Object.keys(LANGUAGE_META);
export const REGIONAL_LANGUAGE_CODES = LANGUAGE_CODES.filter((code) => LANGUAGE_META[code].group === 'regional');
export const CODE_MIXED_LANGUAGE_CODES = LANGUAGE_CODES.filter((code) => LANGUAGE_META[code].group === 'code-mixed');

export function getLanguageMeta(code) {
  return LANGUAGE_META[code] || LANGUAGE_META.en;
}
