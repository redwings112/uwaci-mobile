# Naming conventions

- Components and exported types: `PascalCase`.
- Hooks: `useCamelCase`; functions and variables: `camelCase`.
- Files: component names in `PascalCase.tsx`; hooks and modules in `camelCase.ts`; routes follow Expo Router syntax.
- Backend payload fields retain the agreed snake_case contract at the API boundary; application-facing models use intentional domain names.
- Boolean names describe a positive condition. State-machine statuses use lowercase snake_case string unions.
- Branches use an approved prefix plus kebab-case. Commits use Conventional Commits with a scope.

Names should express product concepts, not current vendors. Use `voiceApi`, not a speech-provider brand.
