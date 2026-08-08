# Error handling

Unknown network/backend values are narrowed centrally and converted to `AppError`. Known codes map to plain, actionable messages. Timeout, rate-limit, and network failures may offer retry; invalid/missing recordings require a new capture; authentication errors request session recovery. Raw provider errors, stacks, request JSON, and debug pages never reach the UI.

Components use alert semantics for failures and preserve the user's conversation where safe. Logging includes only minimal codes and request IDs in development. Production logging excludes raw transcripts, recordings, tokens, and full sensitive conversations.
