# API integration

All requests target `${EXPO_PUBLIC_API_BASE_URL}/api/v1`. RTK Query's base API adds `Accept` and an available `Authorization: Bearer <token>` header. Feature endpoints cover health, conversations, text queries, multipart voice queries, and feedback.

Success envelopes contain `success`, typed `data`, and request metadata. Failure envelopes are narrowed from `unknown` and mapped to user-safe `AppError` values. Raw JSON, HTTP diagnostics, provider messages, and stack traces are never shown to users.

Voice upload uses a file URI in `multipart/form-data` with `audio`, `preferred_language`, and an optional `conversation_id`; recordings are not converted to Base64. The backend contract still needs canonical request/response schemas, timeout limits, accepted MIME types and sizes, low-confidence semantics, anonymous-auth policy, and idempotency/retry guidance.

The app never calls AI, STT, storage, or model providers directly. Only a client-safe Supabase URL/key may initialize auth; service-role credentials remain backend-only.
