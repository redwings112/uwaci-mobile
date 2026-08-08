# State management

Redux Toolkit coordinates session status, preferred conversation language, active conversation metadata, cross-screen voice status, and user preferences. Typed `RootState`, `AppDispatch`, `useAppSelector`, and `useAppDispatch` are mandatory.

RTK Query owns backend state, caching, request lifecycle, invalidation, and Bearer-token attachment. Features inject endpoints into the single `baseApi`; they do not create ad hoc clients. Local text fields, modal visibility, and transient component presentation stay in component state.

The voice slice uses an explicit state union rather than overlapping booleans. The UI may simplify backend processing to a single busy phase when the endpoint does not stream stage updates. Recorder handles remain local to the recording hook; Redux stores only serializable status, URI, duration, and safe error text.
