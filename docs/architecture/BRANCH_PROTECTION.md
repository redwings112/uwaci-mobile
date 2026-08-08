# GitHub branch protection

Repository files cannot enforce server-side protection. An administrator must configure GitHub Rulesets manually.

For both `main` and `dev`: require a pull request, at least one approval, dismissal of stale approvals, resolved conversations, required status checks, linear history if compatible with team policy, restricted direct pushes, blocked force pushes, and blocked deletion. Require `CI / validate`, `Branch policy / policy`, and `Expo project check / expo` after their exact check names appear on the repository.

For `main`, additionally allow normal merges only from `dev` and limit bypass to a documented emergency administrator group. For `dev`, accept approved task-branch prefixes. After real teams exist, activate CODEOWNERS and require architecture-owner review for routes, app providers, core, store, shared UI, theme, workflows, Git scripts, and architecture docs.
