# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React 19, Vite 8, Express 5 (ES Modules), PostgreSQL 16, Google Gemini 2.5 Flash (`@google/genai`), and offline PWA service worker.

## Users

The primary user is a first-time woman in India with limited or no English literacy, limited digital experience, and intermittent connectivity. She needs to access and understand essential government welfare programs (such as PM Ujjwala Yojana for clean fuel, PMMVY for maternity benefit, and Skill India for livelihood training) without knowing technical scheme names, multi-step portals, or bureaucratic terminology.

## Product Purpose

Saheli (सहेली - "Trusted Female Companion") empowers a woman to ask for government scheme guidance by voice or simple text in her own regional language, automatically identifies her dialect, verifies her eligibility in 3 simple visual steps, prepares her required documents, and guides her on what to say when approaching a local official or distributor—functioning smoothly online or 100% offline.

## Positioning

Saheli is a calm, voice-first public service companion that translates intimidating government bureaucracy into one human-sized next step. Unlike generic chatbots or complex portals, Saheli guarantees 100% offline availability of essential welfare knowledge, uses Google Gemini 2.5 Flash for grounded schema-enforced explanations, and adheres to a strict zero-knowledge privacy policy (never collecting Aadhaar, OTPs, or biometric secrets).

## Operating Context

The user is typically on a low-cost Android phone, in a village or peri-urban context, often on a shared family device, with 2G/3G connectivity or intermittent power. She may need to show the screen to a family member, ASHA worker, Anganwadi didi, Panchayat office, Common Service Centre (CSC), or LPG gas distributor.

## Capabilities and Constraints

- **Language Support**: 15 language modes: Hindi, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati, Malayalam, Punjabi, Odia, Assamese, Urdu, English, Hinglish, and Tanglish.
- **Instant Script Auto-Detection**: Real-time Unicode script analysis for all 10 Indic scripts + lexical disambiguation for Hinglish/Tanglish and Marathi.
- **4-Layer Voice Pipeline**: Client-side Web Speech API -> MediaRecorder audio capture fallback -> Backend Google Gemini 2.5 Flash multimodal audio transcription -> 1-touch simulated spoken prompts drawer.
- **Text-to-Speech (TTS)**: Regional Indian accents for audio readout of every step, document, and instruction.
- **Dual-Engine AI**: Online Google Gemini 2.5 Flash for grounded guidance; offline heuristic guidance engine and PWA service worker for complete offline functionality.
- **Directory & Long-tail Search**: 28 curated high-priority women's welfare and safety services + server-side search across 4,690 Indian government schemes from verified datasets.
- **Privacy & Security Boundaries**: Zero PII collected. No Aadhaar numbers, bank passwords, or OTPs. No fake government submissions; official handoff to `.gov.in` sites when online.

## Brand Commitments

The product name is Saheli (सहेली). The voice is that of an empathetic, practical elder sister or local "Didi": direct, warm, respectful, specific, and unpretentious. The visual anchor draws inspiration from hand-painted Indian panchayat boards and bus shelters: confident native Indic typography, warm tactile paper surfaces, distinct regional color accents, and intentional stillness without overstimulating modern tech clutter.

## Evidence on Hand

- Verified PMUY clean cooking gas knowledge base and official links in `server/scheme.js`.
- Curated high-priority women's welfare directory in `shared/resources.js`.
- 4,690-row verified Indian government scheme dataset in `data/Schemes.csv`.
- Unit and integration test suite with 30 passing tests (`tests/api.test.js`, `tests/detectLanguage.test.js`, `tests/offlineGuidance.test.js`).
- Complete absence of fabricated claims or fake government approval endorsements.

## Product Principles

1. Say the single next thing a woman can actually do right now.
2. Keep the first screen quiet and spacious enough to invite voice interaction.
3. Prefer one unambiguous action over a complex dashboard of choices.
4. Keep dignity, privacy, and low-bandwidth/offline reliability ahead of visual spectacle.
5. Make uncertainty visible and hand off safely to official government authorities.

## Accessibility & Inclusion

The interface strictly adheres to WCAG 2.1 AA and GIGW 3.0 / IS-17802 guidelines: high-contrast color tokens, touch targets ≥ 48px, text scaling up to 200%, reduced motion support, clear focus outlines for keyboard navigation, ARIA live regions for speech playback, and an automatic typed/touch fallback whenever voice is unavailable.
