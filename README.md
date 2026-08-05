<div align="center">

# 🧠 agent-skills

**One command to give any AI coding agent battle-tested skills.**

Works with Claude Code, Cursor, Windsurf, and portable `AGENTS.md`.
Zero dependencies. Zero config. Nothing to sign up for.

```bash
npx agent-skills
```

</div>

---

## Why this exists

The hottest thing in AI coding right now is not a bigger model, it is better
instructions. A single well-written skill file can change how an agent behaves
across every task. But everyone is copy-pasting the same rules into a dozen repos
by hand, in a dozen slightly different formats.

`agent-skills` is a curated, opinionated library of those skills plus a tiny
installer that drops them into the right place for whichever agent you use.
Pick your skills once, install them anywhere, in one command.

## Quick start

```bash
# interactive picker (recommended first run)
npx agent-skills

# or go straight for what you want
npx agent-skills add commit-surgeon debug-scientifically
npx agent-skills add --all --target cursor
```

The installer auto-detects your agent from the project (`.claude`, `.cursor`,
`.windsurf`, or `AGENTS.md`) and writes the skills in that tool's native format.

## The skills

| Skill | What it does |
|---|---|
| `commit-surgeon` | Splits messy work into clean, atomic, conventional commits with sharp messages. |
| `debug-scientifically` | Fixes bugs by testing hypotheses instead of guessing. Repro, isolate, confirm. |
| `no-slop` | Kills AI writing tells in comments, docs, PRs, and commits. Reads like a senior engineer. |
| `pr-describer` | Writes PR descriptions a reviewer can approve fast, built from the real diff. |
| `test-first` | Drives changes with a failing test, then the least code to pass it. |
| `security-sweep` | Catches the common, high-impact security mistakes before they ship. |

See them all with `npx agent-skills list`.

## Supported targets

| Target | Installs to | Format |
|---|---|---|
| Claude Code | `.claude/skills/<name>/SKILL.md` | full skill folder |
| Cursor | `.cursor/rules/<name>.mdc` | rule with frontmatter |
| Windsurf | `.windsurf/rules/<name>.md` | markdown rule |
| `AGENTS.md` | `AGENTS.md` | appended section, portable |

Force a target with `--target` and a directory with `--dir`. Overwrite existing
files with `--force`.

## Design principles for the skills

Every skill in here follows the same bar:

- **Behavioral, not encyclopedic.** It changes what the agent *does*, not what it
  knows.
- **Specific and testable.** Concrete rules with clear do and do-not lists, not
  vague vibes.
- **Format-portable.** Written so it reads correctly as a Claude skill, a Cursor
  rule, or an `AGENTS.md` section.

## Add your own

Drop a folder in `skills/<your-skill>/SKILL.md` with this frontmatter:

```markdown
---
name: your-skill
description: One line the agent uses to decide when this applies.
---

# Your Skill

Behavioral instructions here.
```

The installer picks it up automatically. PRs with sharp, battle-tested skills are
welcome.

## How it works

The whole thing is one zero-dependency Node file (`bin/cli.js`) using only
built-ins, so `npx` starts instantly and you can read every line before you run
it. It reads the `skills/` folder, parses the frontmatter, and writes each skill
in your target's native format.

## License

MIT.
