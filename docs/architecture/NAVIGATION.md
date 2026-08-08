# Navigation

Expo Router owns navigation. The root layout installs application providers; `(app)` holds the immediate home, conversation, and settings routes; `(auth)` reserves only the boundary required by a future explicit auth UX. The home route makes voice and text available immediately. Conversation IDs are route parameters; start-recording and initial-text values are short-lived navigation inputs.

Route files import and render feature screens, validate route parameters, and configure navigation only. They must not contain network requests, recorder logic, reducers, or domain transformations. New MVP routes require evidence that a separate screen is simpler than an inline flow.
