# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing React, Vite, Express, PostgreSQL, and PWA codebase.

## Users

The primary user is a first-time woman in India with limited English, limited digital experience, and possibly unreliable connectivity. She needs to understand one government service without already knowing the scheme name or the steps.

## Product Purpose

Seva Didi helps a woman ask for government help by voice or simple text in her own language, understand the next step, and continue to the official service when internet is available. Success means she can say what she needs, understand what to carry or ask, and leave with a concrete next action.

## Positioning

The product is a calm, voice-first public-service guide that translates an intimidating government process into one human-sized next step. It keeps an offline reviewed layer available and treats live AI as a bounded explanation layer, not an eligibility authority.

## Operating Context

The user may be on an Android phone, in a village or panchayat context, with a shared device, low bandwidth, or no English. She may need to show the screen to a family member, local worker, panchayat office, CSC, or official distributor.

## Capabilities and Constraints

- Supported language modes include Hindi, Bengali, Tamil, Telugu, Marathi, Kannada, Gujarati, Malayalam, Punjabi, Odia, Assamese, Urdu, English, Hinglish, and Tanglish.
- Voice input uses the Web Speech API when available, with typed input as a fallback.
- The reviewed directory works offline after the app shell has been cached.
- Gemini guidance is server-side, time-bounded, rate-limited, constrained to approved resource facts, and optional.
- The current reviewed guided journey is Pradhan Mantri Ujjwala Yojana (PMUY); the app does not submit applications or collect OTPs, PINs, passwords, or bank credentials.
- No login, phone-number collection, or personal-data collection is part of the user journey.

## Brand Commitments

The product name is Seva Didi. The voice is a practical neighbor or local didi: direct, warm, specific, and never startup-like. The visual anchor is a hand-painted Indian bus-shelter or panchayat-office sign, with bold Indic lettering, warm paper, one regional accent color, and stillness.

## Evidence on Hand

- Verified PMUY source content is maintained in `server/scheme.js` and linked to the official PMUY website.
- The reviewed resource directory is maintained in `shared/resources.js`.
- The long-tail catalogue is stored in `data/Schemes.csv` and treated as a discovery index that must be checked against official pages.
- No user-provided document photographs or location-specific brand assets are available; the interface must not fabricate them as official proof.

## Product Principles

1. Say the next thing a woman can actually do.
2. Keep the first screen quiet enough to speak.
3. Prefer one strong action over a dashboard of choices.
4. Make uncertainty visible and hand off to official sources.
5. Keep dignity, privacy, and low-bandwidth use ahead of spectacle.

## Accessibility & Inclusion

The interface must meet WCAG 2.1 AA and the requested GIGW 3.0 / IS-17802 direction, keep touch targets at least 48px, respect user text scaling up to 2x, support reduced motion, retain keyboard focus visibility, and provide a typed path whenever voice is unavailable.
