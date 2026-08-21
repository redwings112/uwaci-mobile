# Free plan and usage experience

The backend is the sole authority for UWACI Credits. Mobile reads the authenticated
`GET /api/v1/usage/me` response through the usage RTK Query feature and displays only:

- plan code/display name;
- UTC period start/reset timestamps;
- allocated, used, reserved, and remaining credits;
- server-calculated percentage and `active`, `approaching_limit`, `exhausted`, or
  `configuration_required` status.

The client never receives or calculates provider names, models, prices, tokens, audio duration,
character units, or cost-to-credit conversion. It has no admin, billing, payment, or upgrade flow.

`Usage` cache data is invalidated after text queries, voice queries, and successful server natural
speech generation. A denied request maps the backend's stable code to localized text:

- `USAGE_LIMIT_EXCEEDED`: do not retry automatically; keep conversations and navigation usable.
- `RATE_LIMITED`: allow a later user retry.
- `USAGE_METERING_UNAVAILABLE`: show a temporary safe error and allow a later user retry.

The direct natural-speech fetch sends one generated `Idempotency-Key` per synthesis request. A
denial never enters a retry loop or crashes conversation UI. If a compatible device voice exists,
playback falls back locally while the quota/rate message remains visible. Cancellation and generated
audio cleanup keep their existing behavior.

English and French own full translations. Lingala and Swahili intentionally retain the repository's
documented English fallback until translations are human reviewed. Usage progress exposes an
accessibility value and important states are communicated in text, not color alone.
