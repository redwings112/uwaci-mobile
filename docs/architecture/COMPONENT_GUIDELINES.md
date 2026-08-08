# Component guidelines

Use NativeWind utilities for layout and presentation, backed by the theme palette and scale. Shared components must solve a repeated cross-feature need and expose accessible defaults. Feature-specific controls such as the microphone and feedback sheet stay with their feature.

Prefer small typed props, composition, explicit loading/error/disabled states, and native semantics. Keep data fetching and platform APIs in hooks/services. Use `FlatList` for growing conversations, stable IDs for keys, and memoization only after measured need. Avoid `any`, oversized component files, random visual constants, and speculative variants.
