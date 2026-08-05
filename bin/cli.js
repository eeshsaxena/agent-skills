#!/usr/bin/env node
/*
 * agent-skills: install battle-tested skills into any AI coding agent.
 * Zero dependencies. Uses only Node built-ins so `npx` stays instant.
 *
 * Usage:
 *   agent-skills                     interactive picker
 *   agent-skills list                list available skills
 *   agent-skills add <name...>       install specific skills
 *   agent-skills add --all           install every skill
 *
 * Flags:
 *   --target <claude|cursor|windsurf|agents>   where to install (default: auto-detect)
 *   --dir <path>                               project root (default: current dir)
 *   --force                                    overwrite existing files
 *   --help, --version
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = path.join(__dirname, "..", "skills");
const VERSION = "0.1.0";

const c = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  orange: "\x1b[38;5;208m", green: "\x1b[32m", cyan: "\x1b[36m",
  red: "\x1b[31m", yellow: "\x1b[33m", gray: "\x1b[90m",
};
const supportsColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint = (color, s) => (supportsColor ? color + s + c.reset : s);

/* ------------------------------ skill loading ------------------------------ */

function loadSkills() {
  if (!fs.existsSync(SKILLS_DIR)) return [];
  return fs
    .readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const dir = path.join(SKILLS_DIR, d.name);
      const skillFile = path.join(dir, "SKILL.md");
      let name = d.name;
      let description = "";
      let body = "";
      if (fs.existsSync(skillFile)) {
        const raw = fs.readFileSync(skillFile, "utf8");
        const meta = parseFrontmatter(raw);
        name = meta.data.name || d.name;
        description = meta.data.description || "";
        body = meta.body;
      }
      return { slug: d.name, dir, name, description, body };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

// Minimal frontmatter parser. No YAML dependency: we only need name + description.
function parseFrontmatter(raw) {
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw.trim() };
  const data = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (kv) data[kv[1].trim()] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return { data, body: m[2].trim() };
}

/* ------------------------------ target detection --------------------------- */

function detectTarget(dir) {
  if (fs.existsSync(path.join(dir, ".claude"))) return "claude";
  if (fs.existsSync(path.join(dir, ".cursor"))) return "cursor";
  if (fs.existsSync(path.join(dir, ".windsurf"))) return "windsurf";
  if (fs.existsSync(path.join(dir, "AGENTS.md"))) return "agents";
  return "claude"; // sensible default; the most common skill format
}

const TARGET_LABEL = {
  claude: "Claude Code (.claude/skills/)",
  cursor: "Cursor (.cursor/rules/)",
  windsurf: "Windsurf (.windsurf/rules/)",
  agents: "AGENTS.md (portable)",
};

/* ------------------------------ install writers ---------------------------- */

function installSkill(skill, target, dir, force) {
  switch (target) {
    case "claude":
      return writeClaude(skill, dir, force);
    case "cursor":
      return writeRule(skill, dir, force, ".cursor/rules", ".mdc", true);
    case "windsurf":
      return writeRule(skill, dir, force, ".windsurf/rules", ".md", false);
    case "agents":
      return writeAgentsMd(skill, dir, force);
    default:
      throw new Error("Unknown target: " + target);
  }
}

function writeClaude(skill, dir, force) {
  const dest = path.join(dir, ".claude", "skills", skill.slug);
  const destFile = path.join(dest, "SKILL.md");
  if (fs.existsSync(destFile) && !force) return { status: "skip", path: rel(dir, destFile) };
  fs.mkdirSync(dest, { recursive: true });
  // Copy the whole skill folder so bundled reference files come along.
  copyDir(skill.dir, dest);
  return { status: "ok", path: rel(dir, destFile) };
}

// The SKILL.md body already carries a nice "# Title". Reuse it so we do not
// stack a slug heading on top of it.
function splitTitle(skill) {
  const m = skill.body.match(/^#\s+(.+?)\s*\n([\s\S]*)$/);
  if (m) return { title: m[1].trim(), rest: m[2].trim() };
  return { title: skill.name, rest: skill.body };
}

function writeRule(skill, dir, force, subdir, ext, mdcFrontmatter) {
  const dest = path.join(dir, subdir);
  const destFile = path.join(dest, skill.slug + ext);
  if (fs.existsSync(destFile) && !force) return { status: "skip", path: rel(dir, destFile) };
  fs.mkdirSync(dest, { recursive: true });
  const { title, rest } = splitTitle(skill);
  let content;
  if (mdcFrontmatter) {
    content =
      "---\n" +
      `description: ${skill.description}\n` +
      "alwaysApply: false\n" +
      "---\n\n" +
      `# ${title}\n\n` +
      rest +
      "\n";
  } else {
    content = `# ${title}\n\n> ${skill.description}\n\n` + rest + "\n";
  }
  fs.writeFileSync(destFile, content, "utf8");
  return { status: "ok", path: rel(dir, destFile) };
}

function writeAgentsMd(skill, dir, force) {
  const destFile = path.join(dir, "AGENTS.md");
  const marker = `<!-- agent-skills:${skill.slug} -->`;
  const { title, rest } = splitTitle(skill);
  const section = `${marker}\n\n## ${title}\n\n> ${skill.description}\n\n` + rest + "\n";
  let existing = fs.existsSync(destFile) ? fs.readFileSync(destFile, "utf8") : "";
  if (existing.includes(marker)) {
    if (!force) return { status: "skip", path: "AGENTS.md#" + skill.slug };
    // Replace the existing section from its marker up to the next marker or EOF.
    const re = new RegExp(`${escapeRe(marker)}[\\s\\S]*?(?=\\n<!-- agent-skills:|$)`);
    existing = existing.replace(re, section.trimEnd() + "\n");
  } else {
    if (!existing.trim()) existing = "# Agent skills\n\nInstalled with agent-skills.\n";
    existing = existing.trimEnd() + "\n\n" + section;
  }
  fs.writeFileSync(destFile, existing, "utf8");
  return { status: "ok", path: "AGENTS.md#" + skill.slug };
}

/* ------------------------------ fs helpers --------------------------------- */

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}
const rel = (dir, p) => path.relative(dir, p).split(path.sep).join("/");
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* ------------------------------ output ------------------------------------- */

function printBanner() {
  console.log("");
  console.log(paint(c.orange + c.bold, "  agent-skills") + paint(c.gray, "  v" + VERSION));
  console.log(paint(c.gray, "  battle-tested skills for any AI coding agent"));
  console.log("");
}

function printSkillList(skills) {
  const pad = Math.max(...skills.map((s) => s.slug.length)) + 2;
  skills.forEach((s, i) => {
    const num = paint(c.gray, String(i + 1).padStart(2) + ". ");
    const name = paint(c.cyan + c.bold, s.slug.padEnd(pad));
    console.log("  " + num + name + paint(c.dim, s.description));
  });
  console.log("");
}

function printResult(skill, res) {
  const icons = {
    ok: paint(c.green, "  added   "),
    skip: paint(c.yellow, "  exists  "),
  };
  console.log(icons[res.status] + paint(c.bold, skill.slug) + paint(c.gray, "  " + res.path));
}

/* ------------------------------ interactive -------------------------------- */

function ask(rl, q) {
  return new Promise((resolve) => rl.question(q, resolve));
}

async function interactive(skills, dir) {
  printBanner();
  console.log(paint(c.bold, "  Available skills:\n"));
  printSkillList(skills);

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const detected = detectTarget(dir);
  console.log(paint(c.bold, "  Install where?"));
  const targets = ["claude", "cursor", "windsurf", "agents"];
  targets.forEach((t, i) => {
    const marker = t === detected ? paint(c.green, " (detected)") : "";
    console.log("    " + paint(c.gray, (i + 1) + ". ") + TARGET_LABEL[t] + marker);
  });
  const tAns = (await ask(rl, paint(c.cyan, "\n  target [" + detected + "]: "))).trim();
  const target = targets[parseInt(tAns, 10) - 1] || (targets.includes(tAns) ? tAns : detected);

  const pick = (await ask(rl, paint(c.cyan, "\n  which skills? (e.g. 1 3 5, or 'all'): "))).trim();
  rl.close();

  let chosen;
  if (!pick || pick.toLowerCase() === "all") {
    chosen = skills;
  } else {
    const idx = pick.split(/[\s,]+/).map((n) => parseInt(n, 10) - 1);
    chosen = idx.map((i) => skills[i]).filter(Boolean);
  }

  if (chosen.length === 0) {
    console.log(paint(c.yellow, "\n  Nothing selected. Bye.\n"));
    return;
  }

  console.log("");
  console.log(paint(c.bold, "  Installing to " + TARGET_LABEL[target] + ":\n"));
  for (const s of chosen) printResult(s, installSkill(s, target, dir, false));
  console.log(paint(c.green + c.bold, "\n  Done. " + chosen.length + " skill(s) ready. Restart your agent to load them.\n"));
}

/* ------------------------------ arg parsing -------------------------------- */

function parseArgs(argv) {
  const opts = { _: [], target: null, dir: process.cwd(), force: false, all: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--target" || a === "-t") opts.target = argv[++i];
    else if (a === "--dir" || a === "-d") opts.dir = path.resolve(argv[++i]);
    else if (a === "--force" || a === "-f") opts.force = true;
    else if (a === "--all") opts.all = true;
    else if (a === "--help" || a === "-h") opts.help = true;
    else if (a === "--version" || a === "-v") opts.version = true;
    else opts._.push(a);
  }
  return opts;
}

function printHelp() {
  printBanner();
  console.log(`  ${paint(c.bold, "Usage")}
    agent-skills                      interactive picker
    agent-skills list                 list available skills
    agent-skills add <name...>        install specific skills
    agent-skills add --all            install every skill

  ${paint(c.bold, "Flags")}
    --target, -t  <claude|cursor|windsurf|agents>   default: auto-detect
    --dir, -d     <path>                            default: current directory
    --force, -f                                     overwrite existing files
    --help, -h    /  --version, -v

  ${paint(c.bold, "Examples")}
    ${paint(c.gray, "npx agent-skills")}
    ${paint(c.gray, "npx agent-skills add commit-surgeon debug-scientifically")}
    ${paint(c.gray, "npx agent-skills add --all --target cursor")}
`);
}

/* ------------------------------ main --------------------------------------- */

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.version) return console.log(VERSION);
  if (opts.help) return printHelp();

  const skills = loadSkills();
  if (skills.length === 0) {
    console.error(paint(c.red, "No skills found. Is the package intact?"));
    process.exit(1);
  }

  const cmd = opts._[0];

  if (!cmd) return interactive(skills, opts.dir);

  if (cmd === "list") {
    printBanner();
    printSkillList(skills);
    console.log(paint(c.gray, "  Install with: ") + paint(c.cyan, "npx agent-skills add <name>\n"));
    return;
  }

  if (cmd === "add") {
    const target = opts.target || detectTarget(opts.dir);
    if (!TARGET_LABEL[target]) {
      console.error(paint(c.red, "Unknown target '" + target + "'. Use claude, cursor, windsurf, or agents."));
      process.exit(1);
    }
    let chosen;
    if (opts.all) {
      chosen = skills;
    } else {
      const wanted = opts._.slice(1);
      if (wanted.length === 0) {
        console.error(paint(c.red, "Name a skill, or use --all. See: agent-skills list"));
        process.exit(1);
      }
      chosen = wanted.map((w) => skills.find((s) => s.slug === w)).filter(Boolean);
      const missing = wanted.filter((w) => !skills.find((s) => s.slug === w));
      if (missing.length) console.log(paint(c.yellow, "  Not found: " + missing.join(", ")));
    }
    if (chosen.length === 0) {
      console.error(paint(c.red, "Nothing to install."));
      process.exit(1);
    }
    printBanner();
    console.log(paint(c.bold, "  Installing to " + TARGET_LABEL[target] + ":\n"));
    for (const s of chosen) printResult(s, installSkill(s, target, opts.dir, opts.force));
    console.log(paint(c.green + c.bold, "\n  Done. Restart your agent to load them.\n"));
    return;
  }

  console.error(paint(c.red, "Unknown command '" + cmd + "'. Try: agent-skills --help"));
  process.exit(1);
}

main().catch((err) => {
  console.error(paint(c.red, "Error: " + err.message));
  process.exit(1);
});
