# Git workflow

`main` and `dev` are protected. Create work from updated `dev`, use an approved kebab-case task branch, validate locally, push only the task branch, and open a PR to `dev`. Production moves through an approved `dev -> main` release PR. No direct protected pushes, force pushes, protected deletion, or history rewriting.

Husky runs lint-staged on commit and branch/type/test checks before push. These hooks are convenience controls, not security boundaries; GitHub Rulesets and required CI enforce policy. Conventional Commits with scopes make intent and release history readable.
