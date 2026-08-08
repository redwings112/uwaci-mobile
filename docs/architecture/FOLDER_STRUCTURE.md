# Folder structure

- `app/`: Expo Router layouts and thin route adapters.
- `src/app/`: startup, validated public configuration, and provider composition.
- `src/core/api/`: one RTK Query base API, response envelopes, and auth headers.
- `src/core/auth/`, `audio/`, `speech/`, `storage/`, `network/`: platform abstractions.
- `src/core/errors/` and `logging/`: safe error mapping and privacy-aware diagnostics.
- `src/features/`: product-owned modules. A feature may import core/shared, not another feature's internals.
- `src/shared/components/`: accessible components proven reusable across features.
- `src/store/`: reducer composition, middleware, and typed hooks.
- `src/localization/`: UI translations; separate from AI conversation language.
- `src/theme/`: canonical design tokens consumed by NativeWind and exceptional runtime styles.
- `tests/`: behavior-focused unit, component, integration, and fixture assets.
- `docs/architecture/`: decisions and team operating standards.
- `scripts/git/`: advisory local branch validation. Server rules remain authoritative.

Directories are created when they contain useful code or documentation; speculative enterprise folders are not added for appearance.
