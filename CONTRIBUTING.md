# Contributing to Uwaci Mobile

## Protected branches

Never run `git push origin main` or `git push origin dev`. Do not force-push, rewrite protected history, delete protected branches, or bypass review.

Normal work starts from `dev`:

```powershell
git checkout dev
git pull origin dev
git checkout -b feature/<task-name>
```

Use one approved prefix: `feature/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/`, `perf/`, or `ci/`. The name after `/` must be kebab-case.

After implementation and validation:

```powershell
git add .
git commit -m "feat(voice): add recording flow"
git push -u origin feature/<task-name>
```

Open `feature/<task-name> -> dev`. Production uses an approved `dev -> main` release PR only.

## Commit and review quality

Use Conventional Commits with a meaningful scope, for example `fix(audio): handle microphone denial`, `test(voice): cover recording transitions`, or `docs(architecture): document upload cleanup`. Keep route files thin and feature behavior inside its feature boundary. Include tests, accessibility behavior, API impact, permission impact, screenshots/video when visual behavior changes, and documentation when contracts change.

AI tools may assist with boilerplate, tests, documentation, refactoring, debugging, accessibility review, and state modeling. Engineers remain accountable: verify current Expo APIs, justify dependencies, review generated code, and never merge code you cannot explain.
