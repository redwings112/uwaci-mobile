# Uwaci Mobile

Uwaci is a voice-first, text-capable AI assistant designed for multilingual and underserved communities. This Expo application is the Android-first mobile foundation for the 14-day Core AI prototype and future Uwaci products. AI reasoning and provider integrations remain exclusively in the FastAPI backend.

## MVP scope

The app lets a user choose a preferred conversation language, ask a question by voice or text, review the transcription, read or hear the response, continue a conversation, and submit lightweight feedback. English and French are stable MVP languages; Lingala and Swahili are explicitly experimental pending human translation and device voice support.

## Architecture and stack

- Expo SDK 57, React Native, TypeScript, and Expo Router
- NativeWind with centralized theme tokens
- Redux Toolkit for coordinated client state and RTK Query for backend state
- `expo-audio` for recordings and `expo-speech` for on-device TTS
- Supabase Auth foundation with client-safe configuration and secure session storage
- i18next, react-i18next, Expo Localization, Zod, NetInfo
- Jest, React Native Testing Library, ESLint, Prettier, Husky, and lint-staged

Route files under `app/` stay thin. Product behavior lives under `src/features/`; cross-cutting platform capabilities live under `src/core/`; genuinely reusable UI lives under `src/shared/`. See [architecture documentation](docs/architecture/ARCHITECTURE.md).
The server-authoritative Free plan and usage experience is documented in
[Free plan and usage](docs/architecture/USAGE_CREDITS.md).

## Prerequisites

- Node `20.19.4+`, `22.13+`, or `24.3+` (matching React Native 0.86 requirements)
- npm 10+
- Android Studio/emulator or a physical Android device
- Expo Go for compatible development, or an EAS development build for native validation

## Environment setup

PowerShell:

```powershell
Copy-Item .env.example .env
```

Set only client-safe values:

```dotenv
EXPO_PUBLIC_APP_ENV=development
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

On an Android emulator, a backend running on the host is typically reached at `http://10.0.2.2:8000`. Every `EXPO_PUBLIC_*` value is bundled into the app and must be treated as public. Never add AI provider keys, service-role keys, signing credentials, or storage secrets.

## Install and run

```powershell
npm ci
npm run start
```

Press `a` in the Expo terminal, or run:

```powershell
npm run android
```

iOS remains supported architecturally:

```powershell
npm run ios
```

## Quality commands

```powershell
npm run typecheck
npm run lint
npm run format:check
npm run test
npm run test:coverage
npx expo install --check
npm run validate
```

## Builds

No credentials are stored in this repository. After linking a legitimate EAS project:

```powershell
npx eas-cli build --platform android --profile development
npx eas-cli build --platform android --profile preview
```

The preview profile produces an internally distributed Android APK. Production builds require approved store credentials and release governance; this scaffold does not publish or submit anything.

## Project map

```text
app/                    Expo Router routes
src/application/        bootstrap, config, and providers
src/core/               API, auth, audio, speech, storage, network, errors
src/features/           feature-owned UI, state, hooks, APIs, and types
src/shared/             genuinely reusable primitives
src/store/              typed Redux store
src/localization/       UI localization resources
src/theme/              design tokens
tests/                  unit, component, and integration tests
docs/architecture/      engineering decisions and operating guidance
```

## Git workflow

Protected branches are `main` and `dev`. Work starts from `dev` on an approved kebab-case branch such as `feature/voice-recorder` or `chore/mobile-foundation`, then opens a PR back to `dev`. Never push directly to `main` or `dev`; never force-push protected branches. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

The client calls only the Uwaci backend. It does not call Deepgram, Gemini, OpenAI, R2, or another provider directly. Report vulnerabilities privately as described in [SECURITY.md](SECURITY.md), and never attach sensitive conversations or audio to public issues.
