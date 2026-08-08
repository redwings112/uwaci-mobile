# Mobile architecture

Expo provides a managed, Android-first delivery path while preserving iOS support and access to maintained native modules. Expo Router supplies typed, file-based navigation; route modules compose feature screens and do not own business logic.

The source tree is feature-first. A feature owns its UI, hooks, client state, API endpoint injection, domain types, and feature-only helpers. `core` owns platform and application-wide boundaries; `shared` contains only proven reusable UI; `store` composes reducers and RTK Query. Dependency direction is `routes -> features -> core/shared`; core never imports a feature.

Voice and text enter the same backend conversation engine. Voice follows microphone permission -> local temporary URI -> multipart upload -> backend STT/reasoning -> typed response -> optional device TTS -> cleanup. Text skips recording but uses the same conversation state and response model. Deepgram, Gemini, OpenAI, R2, and provider-specific types never cross the backend boundary.

Future Presence, Locator, Knowledge, Guidance, Data Intelligence, and Social modules will be added as sibling feature directories. They reuse identity, navigation, API, errors, and tokens; none are preimplemented for the Core AI MVP.

Performance-sensitive boundaries are explicit: conversations use a virtualized list and stable message IDs; recording timer state stays outside the conversation list; audio is uploaded by URI rather than Base64; duplicate submissions are disabled; recorder/player/TTS resources are released. Memoization is added only after measurement. Privacy-sensitive boundaries follow the same discipline: no production conversation logging, no raw audio logging, and no recording retention after successful processing.
