# Audio architecture

Microphone permission is requested only after the user taps the microphone. Denial produces a recoverable explanation. `expo-audio` owns the native recorder through one feature hook; screens do not manipulate native audio objects.

The recorder transitions through permission, recording, processing, upload, backend processing, response, optional device speech, and idle/error states. Stop returns a temporary local URI. The voice API uploads the URI as multipart data. Successful processing triggers best-effort deletion; cancellation and unmount also release recording resources. Raw audio paths and data are never logged.

Recordings are capped by product configuration, duplicate submissions are blocked, and uploads are not retried indefinitely. Interruption, missing URI, unsupported format, timeout, offline, and low-confidence results lead to actionable retry states. Background recording is intentionally disabled because the MVP does not require it.

Device TTS is isolated behind `speechService`. English and French locales are preferred; Lingala and Swahili are used only when the device supplies a compatible voice, with a text-only fallback.
