# Security policy

Report suspected vulnerabilities privately to the project security contact configured by the UWACI organization. Do not open a public issue containing tokens, personal conversations, recordings, infrastructure details, or reproduction credentials.

The mobile bundle may contain only public configuration. `EXPO_PUBLIC_*` is discoverable by any app user. Provider secrets, Supabase service-role credentials, R2 credentials, signing keys, certificates, and service-account files belong in managed backend or CI secret stores and are ignored by Git.

The client sends voice and text only to the Uwaci backend over HTTPS in preview/production. Ordinary recordings are temporary, are deleted after successful processing where practical, are never silently saved for training, and must not be logged. Authentication tokens use secure device storage and are attached as Bearer tokens only at the centralized API boundary.
