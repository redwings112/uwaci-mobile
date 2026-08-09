# Core AI MVP progress

Updated: 2026-08-09

## Implementation matrix

| Status      | Area                                   | Main modules                                              | Commit(s)                       | Verification / external work                                                          |
| ----------- | -------------------------------------- | --------------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------- |
| DONE        | Expo/NativeWind application foundation | `app`, `src/app`, `src/shared`, `src/theme`               | `78a8ba2`, `0218a2b`            | Expo SDK 57 dependency/config checks, format, lint, and strict TypeScript pass.       |
| DONE        | Backend API and anonymous auth         | `conversation/api`, `voice/api`, `core/auth`, `core/api`  | `d5f29af`, `2a36a21`            | Contract mapping and auth-header integration tests pass; no provider secret is used.  |
| DONE        | Onboarding and microphone setup        | `features/onboarding`, `app/onboarding.tsx`               | `a5c6d86`                       | Static checks pass; denial/recovery still needs a real Android device.                |
| DONE        | Mixed voice/text conversation          | `features/conversation`, `features/voice`, `core/network` | `d356fcc`                       | Context reconciliation, offline, error, and low-confidence recovery tests pass.       |
| DONE        | Device-native spoken responses         | `core/speech`, `MicrophoneButton`, `ConversationScreen`   | `42afa2d`                       | Locale selection and unavailable-voice fallback tests pass.                           |
| DONE        | UI/conversation language preferences   | `features/language`, `features/settings`, `localization`  | `6239187`                       | English/French UI is separate from four-language conversation state.                  |
| DONE        | Agent, Git, and MVP handoff guidance   | `AGENTS.md`, `.gitattributes`, `docs/implementation`      | `8ef992f`, `81c7458`, `02a8b0c` | Full format check and branch-policy tests pass.                                       |
| PARTIAL     | Installable Android artifact           | `app.json`, `eas.json`                                    | `78a8ba2`                       | Config/dependencies pass; the one local Android export attempt timed out after 3 min. |
| BLOCKED     | Pixel-level Figma comparison           | UI screen family                                          | -                               | Supplied URL has no frame/node ID; current UI follows repository design guidance.     |
| NOT STARTED | Live device/provider end-to-end QA     | Android app plus configured backend                       | -                               | Requires Android hardware/emulator and development backend credentials.               |

## Validation

- Prettier, ESLint, strict TypeScript, 18 Jest suites (`28 passed`), and three branch-policy tests pass on Node 20.19.6.
- Expo public config renders correctly and `expo install --check` reports that dependencies are up to date.
- The Android export sanity command produced no output or artifact before its three-minute timeout; no EAS/cloud build was attempted.

## Remaining verification

- Real Android hardware/emulator validation for microphone capture, permission denial/recovery, anonymous Supabase auth, audio upload, and installed TTS voices.
- Pixel-level comparison needs a Figma frame/node link; the supplied URL identifies only the file. The current UI follows the repository's Warm Intelligence tokens and design guidance.
- Lingala and Swahili copy requires review by fluent translators, and provider quality needs representative speech fixtures.
