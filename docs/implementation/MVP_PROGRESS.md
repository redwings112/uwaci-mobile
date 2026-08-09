# Core AI MVP progress

Updated: 2026-08-09

## Implemented

- Expo Router application shell with strict TypeScript, Redux Toolkit/RTK Query, NativeWind, SecureStore, localization, and accessible shared components.
- Secure Supabase anonymous-session bootstrap and bearer-token attachment. No AI, speech-to-text, storage, or service-role secret is present in the client.
- First-run onboarding for privacy expectations, conversation language, and explicit microphone permission, with a text-only path.
- Voice and text queries in one server-backed conversation, optimistic text reconciliation, recording lifecycle cleanup, and deterministic request states.
- Low-confidence transcription recovery, safe offline/network states, backend error mapping, categorical answer feedback, and persisted preferences.
- Separate English/French interface language and English/French/Lingala/Swahili conversation language. Lingala and Swahili remain visibly experimental.
- Optional device text-to-speech with an explicit stop state and text-only fallback when the requested device voice is unavailable.

## Validation

- Focused TypeScript, ESLint, Prettier, and Jest checks pass on Node 20.19.6.
- Full static, unit/integration, Expo dependency, and Android export checks are recorded in the final implementation handoff after the branch-wide run.

## Remaining verification

- Real Android hardware/emulator validation for microphone capture, permission denial/recovery, anonymous Supabase auth, audio upload, and installed TTS voices.
- Pixel-level comparison needs a Figma frame/node link; the supplied URL identifies only the file. The current UI follows the repository's Warm Intelligence tokens and design guidance.
- Lingala and Swahili copy requires review by fluent translators, and provider quality needs representative speech fixtures.
