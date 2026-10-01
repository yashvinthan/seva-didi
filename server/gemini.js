import process from 'node:process';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { buildResourceContext, buildSchemeContext, languageNames } from './scheme.js';
import { getSchemeDatasetResource } from './catalog.js';

const guidanceSchema = z.object({
  answer: z.string().min(1).max(600),
  speakText: z.string().min(1).max(600),
  nextStep: z.string().min(1).max(300),
  sourceNote: z.string().min(1).max(300),
});

let client;

function getClient() {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
  client ||= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return client;
}

export function isGeminiConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function generateGuidance({ language, userMessage, answer, resourceId }) {
  const selectedAnswer = answer === 'no' ? 'The user said there is no LPG connection in the household.' : answer === 'yes' ? 'The user said there is already an LPG connection in the household.' : 'The user has not answered the household LPG question yet.';
  const curatedResourceContext = resourceId ? buildResourceContext(resourceId) : null;
  const datasetResource = !curatedResourceContext && resourceId ? await getSchemeDatasetResource(resourceId) : null;
  const resourceContext = curatedResourceContext || (datasetResource ? JSON.stringify({
    id: datasetResource.id,
    title: datasetResource.title,
    summary: datasetResource.summary,
    whatFor: datasetResource.whatFor,
    nextStep: datasetResource.nextStep,
    officialUrl: datasetResource.officialUrl,
    source: datasetResource.source,
  }, null, 2) : null);
  if (resourceId && !resourceContext) throw new Error('Selected resource was not found');
  const isResourceGuidance = Boolean(resourceContext);
  const prompt = `You are Saheli, a calm public-service guide for a first-time woman user in India.

Return guidance in ${languageNames[language] || languageNames.en}. Use very short, plain sentences. For Hinglish, write Hindi words in Latin script with natural everyday English mixing. For Tanglish, write Tamil words in Latin script with natural everyday English mixing. Do not silently switch a regional-language request to English. Do not use emojis, technical language, or promises of approval. Do not ask for Aadhaar numbers, OTPs, PINs, passwords, bank numbers, or any other sensitive personal data. Do not invent eligibility rules. Explain that Saheli provides guidance and the relevant official website, helpline, or local office completes the real process.

Approved resource facts:
${resourceContext || buildSchemeContext()}

User message: ${userMessage || 'No free-text message.'}
${isResourceGuidance ? 'The user wants to understand the selected resource and the safest next step.' : `Answer to the household question: ${selectedAnswer}`}

Return only JSON with these fields:
- answer: one short explanation for the user
- speakText: the same explanation, natural to read aloud
- nextStep: the safest next action
- sourceNote: mention that the official source in the approved facts should be checked
`;

  const response = await getClient().models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: prompt,
    config: {
      temperature: 0.2,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          answer: { type: 'STRING' },
          speakText: { type: 'STRING' },
          nextStep: { type: 'STRING' },
          sourceNote: { type: 'STRING' },
        },
        required: ['answer', 'speakText', 'nextStep', 'sourceNote'],
      },
    },
  });

  return guidanceSchema.parse(JSON.parse(response.text));
}

export async function transcribeAudioWithGemini({ audioBase64, mimeType = 'audio/webm' }) {
  if (!isGeminiConfigured()) throw new Error('GEMINI_API_KEY is not configured');

  const prompt = `You are Saheli's audio intelligence engine.
Listen carefully to the user's audio query. The speaker is an Indian woman speaking in an Indian regional language, Hindi, Hinglish, or English.
1. Transcribe the exact words spoken into text.
2. Identify the language code from: 'hi', 'bn', 'ta', 'te', 'mr', 'kn', 'gu', 'ml', 'pa', 'or', 'as', 'ur', 'en', 'hi-Latn', 'ta-Latn'.
3. Detect the intended government welfare topic/service:
   - 'pmuy-new-connection' (cooking gas, Ujjwala, cylinder, chulha)
   - 'skill-india' (tailoring, silai, embroidery, handicraft, skill center training)
   - 'pmmvy' (maternity assistance, pregnant, baby, 5000 rupees, mother nutrition)
   - 'safety' (women helpline 181, police, violence, emergency help)
   - 'ration' (free food grain, ration card)
   - 'general' (any other public scheme)

Return strictly JSON with:
- transcript: string
- detectedLanguage: string (language code)
- detectedScheme: string
- shortSummary: string
`;

  const response = await getClient().models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
          { text: prompt },
        ],
      },
    ],
    config: {
      temperature: 0.1,
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          transcript: { type: 'STRING' },
          detectedLanguage: { type: 'STRING' },
          detectedScheme: { type: 'STRING' },
          shortSummary: { type: 'STRING' },
        },
        required: ['transcript', 'detectedLanguage', 'detectedScheme', 'shortSummary'],
      },
    },
  });

  return JSON.parse(response.text);
}

