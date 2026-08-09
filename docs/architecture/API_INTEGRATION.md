# API integration

All requests target `${EXPO_PUBLIC_API_BASE_URL}/api/v1`. RTK Query's base API adds `Accept` and an available `Authorization: Bearer <token>` header. Feature endpoints cover health, conversations, text queries, multipart voice queries, and feedback.

Success envelopes contain `success`, typed `data`, and request metadata. Failure envelopes are narrowed from `unknown` and mapped to user-safe `AppError` values. Raw JSON, HTTP diagnostics, provider messages, and stack traces are never shown to users.

Voice upload uses a file URI in `multipart/form-data` with `audio`, `preferred_language`, and an optional `conversation_id`; recordings are not converted to Base64.

The Core AI contract is now canonical. Text queries send `content`, `preferred_language`, and an optional `conversation_id`. Both text and voice return the same `conversation_id`, `user_message`, `assistant_message`, and `language` shape; voice also returns `transcription` metadata. The client retains the server conversation ID so voice and text follow-ups share context. Low-confidence voice responses are represented as `STT_LOW_CONFIDENCE` errors with a safe transcript and confidence value that support retry-by-voice or edit-as-text recovery.

The configured request timeout is 30 seconds. Voice uploads use the recorder's `audio/mp4` MIME type and the backend enforces its configured byte limit. Automatic mutation retries are intentionally disabled because queries create messages; the user must explicitly retry. Supabase anonymous sessions provide the bearer token, and feedback accepts only the documented categorical values.

The app never calls AI, STT, storage, or model providers directly. Only a client-safe Supabase URL/key may initialize auth; service-role credentials remain backend-only.
