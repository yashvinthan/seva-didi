# Seva Didi visual system

This document records the replacement visual world for the core app flow.

## World

Seva Didi is a hand-painted bus-shelter and panchayat-office pamphlet brought to life on a phone. It uses confident Indic lettering, warm paper, a single region-led accent, strong rules, and intentional stillness. It does not use gradients, glass, generic feature cards, or dashboard chrome.

## Tokens

- Paper: `#FAF8F5`
- Warm paper: `#F0EDE8`
- Ink: `#2C2C2C`
- Accent for Hindi: `#C0392B`
- Tamil accent: `#1A5276`
- Bengali accent: `#148F77`
- Marathi / Gujarati accent: `#B7950B`
- Telugu / Kannada accent: `#7D3C98`
- Display: Tiro Devanagari Hindi, with Catamaran for Tamil and Mukta for Marathi/body families.
- Body: Mukta or the script-specific Noto Sans family.

## Composition

- The active user surface is a single 420px reading column.
- Major sections are separated by whitespace and a 2px accent rule.
- Structural containers have square corners; buttons use 4px corners; the microphone alone is circular/irregular.
- The welcome screen is intentionally quiet: one large breathing microphone, one greeting, one language escape hatch.
- The language screen gives native scripts most of the visual weight.
- Guided answers are full-width warm-paper rows; the final action has the largest pause above it.

## Interaction

The microphone is the authored moment: a slow breathing scale that stops under reduced-motion preferences. Page changes are immediate, button presses move down 2px, and all other motion is restrained. Official handoffs are guarded when offline.

## Content boundary

The visual world does not alter verified government facts. The current journey remains PMUY, with the official source handoff and existing document guidance. The user brief’s unverified ₹300 / 14480 ration combination is not represented as a factual claim.
