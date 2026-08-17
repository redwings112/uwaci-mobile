# State management

Redux Toolkit coordinates session status, preferred conversation language, active conversation metadata, cross-screen voice status, and user preferences. Typed `RootState`, `AppDispatch`, `useAppSelector`, and `useAppDispatch` are mandatory.

RTK Query owns backend state, caching, request lifecycle, invalidation, and Bearer-token attachment. Features inject endpoints into the single `baseApi`; they do not create ad hoc clients. Local text fields, modal visibility, and transient component presentation stay in component state.

The voice slice uses an explicit state union rather than overlapping booleans. It stores the active streamed backend stage and completed measured durations so the thinking route reflects real transcription/reasoning work. Recorder and speech-stream handles remain local to hooks/services; Redux stores only serializable status, URI, duration, stage measurements, and safe error text.
