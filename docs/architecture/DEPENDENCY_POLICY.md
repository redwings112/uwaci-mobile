# Dependency policy

Before adding a package, determine whether Expo or React Native already provides the capability, maintenance health, SDK/native compatibility, development-build impact, runtime/bundle cost, license, and lock-in. Prefer Expo-maintained platform modules and use `npx expo install` for SDK-managed packages.

Every dependency must serve current MVP behavior or a concrete foundation boundary. Avoid duplicate networking, state, styling, or validation libraries. Pin Expo-compatible ranges in the lockfile, review advisories without blindly applying breaking `audit fix --force`, and document native permission/config changes in the PR.
