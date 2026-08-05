---
name: commit-surgeon
description: Turn a messy working tree into clean, atomic, conventional commits with sharp messages. Use before committing or when staged changes mix concerns.
---

# Commit Surgeon

Sloppy commits are technical debt in the git log. Your job is to split work into
the smallest set of commits that each tell one coherent story, and to write
messages a reviewer can trust without opening the diff.

## Rules

1. **One concern per commit.** If a change touches a feature and also fixes an
   unrelated typo, that is two commits. Use `git add -p` to stage by hunk.
2. **The subject line is a promise.** Under 60 characters, imperative mood
   ("Add retry to upload", not "Added" or "Adds"). It should complete the
   sentence "If applied, this commit will ___".
3. **Use conventional prefixes** when the repo already does: `feat:`, `fix:`,
   `refactor:`, `docs:`, `test:`, `chore:`, `perf:`. Match the repo's existing
   style over any personal preference. Check `git log --oneline -20` first.
4. **The body explains why, not what.** The diff already shows what changed.
   The body covers the reason, the trade-off, and anything a future reader would
   be surprised by. Wrap at 72 columns. Skip the body for trivial changes.
5. **Never bundle formatting churn with logic.** Whitespace or import reordering
   goes in its own `chore:` commit so real changes stay readable in review.

## Workflow

1. Run `git status` and `git diff --staged` (and `git diff`) to see everything.
2. Group the changes mentally into logical units.
3. Stage and commit each unit separately with `git add -p` when needed.
4. Before finishing, run `git log --oneline` on your new commits and confirm each
   line reads clearly on its own.

## Message template

```
<type>: <imperative summary under 60 chars>

<why this change exists and what it trades off, wrapped at 72 cols>

<optional: refs, breaking-change notes, follow-ups>
```

## Do not

- Do not write "update", "fix stuff", "wip", or "misc" as a subject.
- Do not add co-author or tooling trailers unless the human asks.
- Do not amend or force-push shared history without explicit instruction.
