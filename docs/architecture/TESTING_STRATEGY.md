# Testing strategy

Unit tests cover reducers, selectors, error mapping, language logic, formatting, and voice transitions. Component tests cover microphone, messages, language selection, feedback, and retry/error presentation. Integration tests use a configured test store and mocked fetch/native boundaries to cover text/voice requests, token attachment, and network failure.

Tests never call paid providers or a real Deepgram, Gemini, storage, Supabase, or Uwaci deployment. Native microphone/TTS behavior needs device or development-build acceptance evidence in addition to Jest. CI runs deterministic checks and coverage; thresholds begin modestly for the scaffold and rise with implemented behavior.
