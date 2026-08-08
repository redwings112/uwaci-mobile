# Mobile security architecture

Public configuration is validated at startup, but validation does not make values secret. Only API base URL and Supabase public client configuration are allowed. Secrets and provider selection remain in FastAPI/deployment environments.

Tokens use secure device storage, are attached only by the centralized API layer, and must be cleared when malformed or signed out. Production uses HTTPS. Logs exclude tokens, audio, private transcripts, and provider payloads. Temporary audio is deleted after successful use; future retention or training requires explicit consent.

Threat review should cover lost devices, rooted devices, token expiry/refresh, replay or duplicate submissions, oversized audio, TLS failure, malicious backend content, dependency compromise, and accidental secret commits. SecureStore reduces exposure but cannot make a compromised device trustworthy.
