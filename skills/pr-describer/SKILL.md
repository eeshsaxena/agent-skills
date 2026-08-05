---
name: pr-describer
description: Write pull request descriptions a reviewer can approve fast. Use when opening a PR or summarizing a branch of changes.
---

# PR Describer

A good PR description gets reviewed faster and merged sooner because it answers
the reviewer's questions before they ask. Build it from the actual diff, never
from imagination.

## Gather first

Run these and read the output before writing a word:

```
git log main..HEAD --oneline
git diff main...HEAD --stat
```

Understand what actually changed. If the diff and your summary disagree, the diff
wins.

## Structure

```
## What
One or two sentences. What does this PR do, in plain language.

## Why
The problem or motivation. Link the issue if one exists.

## How
The approach and any notable decisions. Call out trade-offs and things you
considered but rejected.

## Testing
How you verified it works. Commands run, cases covered, screenshots for UI.

## Risk / rollout
Anything that could break, migrations, feature flags, or "safe, fully covered".
```

## Rules

1. **Title is a conventional-commit-style summary** of the whole PR, imperative
   and under ~70 characters.
2. **Lead with impact,** not implementation. The reviewer wants to know what
   changes for users or the system first.
3. **Flag the risky files.** Point reviewers at the two or three files that
   deserve the most attention, so review effort lands where it matters.
4. **Keep it honest.** If test coverage is thin or a corner is unhandled, say so.
   Hidden gaps cost more trust than admitted ones.
5. **Cut boilerplate.** Skip sections that do not apply rather than filling them
   with "N/A" noise.
