import process from 'node:process';
import { LANGUAGE_META } from '../shared/languages.js';
import { RESOURCE_CATALOG } from '../shared/resources.js';

export const pmuySourceUrl = process.env.PMUY_SOURCE_URL || 'https://www.pmuy.gov.in/ujjwala2.html';

export const pmuyKnowledge = {
  id: 'pmuy-new-connection',
  name: 'Pradhan Mantri Ujjwala Yojana',
  sourceUrl: pmuySourceUrl,
  sourceLabel: 'Official PMUY website',
  lastReviewed: '2026-10-01',
  eligibility: [
    'The applicant is a woman who is at least 18 years old.',
    'There is no LPG connection from any Oil Marketing Company in the same household.',
    'The adult woman belongs to a poor household and can submit the required deprivation declaration.',
  ],
  documents: [
    'KYC application form',
    'Aadhaar proof of the applicant',
    'Proof of address when the current address differs from Aadhaar',
    'Ration card or another government document showing family composition',
    'Aadhaar proof for adult family members listed in the family document',
    'Bank account details, such as a passbook copy or cancelled cheque',
    'Deprivation declaration',
  ],
  nextStep: 'Applicants may approach a distributor of their choice or use the online application route on the official PMUY website.',
  helplines: ['1906 LPG Emergency Helpline', '14428 Toll Free Helpline', '14438 Ujjwala Helpline'],
};

export const languageNames = Object.fromEntries(Object.entries(LANGUAGE_META).map(([code, meta]) => [code, meta.promptName]));

export function buildSchemeContext() {
  return JSON.stringify(pmuyKnowledge, null, 2);
}

export function buildResourceContext(resourceId) {
  const resource = RESOURCE_CATALOG.find((item) => item.id === resourceId);
  if (!resource) return null;
  return JSON.stringify({
    id: resource.id,
    title: resource.title,
    summary: resource.summary,
    whatFor: resource.whatFor,
    nextStep: resource.nextStep,
    officialUrl: resource.officialUrl,
    phone: resource.phone || null,
  }, null, 2);
}
