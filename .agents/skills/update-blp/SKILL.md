---
name: update-blp
description: Update a project derived from the BLP boilerplate by fetching and merging upstream/main, preserving protected project files, resolving conflicts safely, then reinstalling dependencies and validating the result.
---

# Update BLP

Use this skill when the user asks to sync the current project with the latest Boilerplate (BLP) changes.

## Read First

Before changing anything, read at least these files:

1. `AGENTS.md`
2. `.gitattributes`
3. `.github/SETUP_NEW_PROJECT.md`

Also read `package.json` if dependency or tooling changes are expected.

## Preconditions

Check the repository setup first:

```bash
git status --short
git remote -v
git branch --show-current
git config --get merge.theirs.driver
```

Expected state:

- `upstream` exists and points to the boilerplate repository
- `merge.theirs.driver` is `true`
- the current branch is the project branch to update

If `upstream` is missing, inspect the local Git setup and the boilerplate docs before adding anything. If the correct upstream URL cannot be inferred safely, stop and ask the user.

If the working tree already contains unrelated user changes, do not reset or stash silently. Explain the situation and ask before proceeding if the merge would be risky.

## Update Workflow

1. Fetch upstream changes:

```bash
git fetch upstream
```

2. Inspect what is about to land:

```bash
git log --oneline HEAD..upstream/main
git diff --stat HEAD..upstream/main
```

3. Merge the boilerplate into the current branch:

```bash
git merge upstream/main
```

4. Resolve conflicts carefully:

- Protected project files should stay on the project version because `.gitattributes` uses `merge=theirs`
- `package.json` may require a manual merge: keep both valid dependency sets when both sides added packages
- Recreate lockfile consistency with `bun install` instead of hand-editing `bun.lock`
- If a conflict is unclear or changes project behavior in a non-obvious way, stop and summarize the blocker instead of guessing

5. Run post-merge commands:

```bash
bun install
```

Run Prisma generation when Prisma schema or Prisma dependencies changed:

```bash
bun prisma generate
```

6. Validate the repository:

```bash
bun lint
```

Run `bun build` as an additional safety check when the merge touched framework, routing, auth, database, or build configuration files.

## Output Checklist

When the update is done, report:

- which upstream commits were merged
- whether conflicts occurred and how they were resolved
- whether `package.json` or Prisma required follow-up steps
- which validation commands were run and whether they passed
- any remaining manual checks for the user

## Guardrails

- Never use destructive Git commands such as `git reset --hard`
- Never revert user changes that were already present in the worktree unless the user explicitly asks
- Never modify `src/components/ui/`
- Keep project-specific fixes under `src/project/` when follow-up adaptation is needed
- Prefer official Git documentation if merge-driver behavior or conflict handling is unclear
