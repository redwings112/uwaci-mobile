# UWACI Mobile agent guide

## Boundaries

- Keep Expo Router routes thin. Product behavior lives in `src/features`, platform boundaries in `src/core`, reusable primitives in `src/shared`, and server state in the single RTK Query API.
- Use NativeWind/Tailwind and existing theme tokens for UI. Keep voice-first interaction obvious, accessible, calm, and consistent with the documented Warm Intelligence direction.
- Voice and text must use one backend conversation engine. The app calls only the UWACI FastAPI API; never call Deepgram, Gemini/OpenAI, R2, or another AI provider directly.
- `EXPO_PUBLIC_*` values are public. Never add provider, service-role, signing, or storage secrets. Tokens use SecureStore and are attached only at the centralized API boundary.
- Keep UI locale separate from conversation language. Preserve mixed-language text; English/French are supported and Lingala/Swahili remain explicitly experimental until human review.

## Commands and conventions

- Use a supported Node version from `package.json`; prefer Expo-managed package versions and `npx expo install` for native modules.
- Quality: `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, and `npm run validate:expo`. Run broader checks at feature milestones, not after every component.
- Use strict TypeScript, typed Redux hooks, explicit state unions, RTK Query for backend state, `expo-audio` behind the recorder abstraction, and `expo-speech` behind the speech service.
- UI uses accessible roles/labels, 48-point controls, a large voice target, text alternatives, non-color-only states, and actionable safe errors. Native microphone/TTS behavior still requires Android device evidence.

## Git and Definition of Done

- Work on one approved task branch from `dev`; use Conventional Commits. Make focused local commits for logical milestones.
- Never push, open a PR, merge protected branches, trigger EAS cloud builds, force-push, rewrite history, reset/clean destructively, or commit secrets. Preserve unrelated work.
- Done means the backend contract is matched at the API boundary, voice/text follow-ups share context, local audio is cleaned up, recovery/accessibility behavior is present, relevant tests pass, release config is valid, and external device/provider gaps are recorded in `docs/implementation/MVP_PROGRESS.md`.
