# Code review guidelines

Review behavior, architecture boundaries, API contracts, strict types, accessibility, privacy, cleanup, tests, and operational impact—not only syntax. Require evidence for user-facing flows and question new dependencies, permissions, provider coupling, duplicated state, retry behavior, or logs containing sensitive data.

Shared foundation changes should receive mobile architecture ownership review after real CODEOWNERS teams are configured. AI-assisted code receives the same review bar; authors must explain it and verify current APIs. Resolve conversations before merge and do not approve your own high-risk change as the sole reviewer.
