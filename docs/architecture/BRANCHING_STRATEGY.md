# Branching strategy

Long-lived branches are `main` for production and `dev` for integrated, releasable development. Short-lived branches use `feature/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/`, `perf/`, or `ci/` plus kebab-case. Delete merged task branches through the normal repository process, never protected branches.

Ordinary PRs target `dev`. Urgent fixes still require review and should merge to `dev` before an approved release PR; any organization-specific hotfix exception must be documented in the Ruleset and release process rather than improvised locally.
