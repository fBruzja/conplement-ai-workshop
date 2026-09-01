# Where Does This Rule Go?

Every team that adopts AI coding agents hits the same wall: you learn something, you write it down,
and six weeks later nobody can find it — including the agent. This document is the routing table.

## The two questions

All agent context answers one of two questions:

| Question                         | Artifact                    | Lifetime                     |
| -------------------------------- | --------------------------- | ---------------------------- |
| What should the agent **know**?   | instructions, rules, skills | durable — survives the task  |
| What should the agent **do**?     | specs, plans, tasks         | ephemeral — dies with the task |

Mixing them is the most common failure. A spec that re-explains your coding standards is bloated and
goes stale; an instructions file that describes this sprint's feature poisons every future session.

## Decision flowchart

```
A new rule, convention or lesson
    │
    ├─ Specific to one module/directory, and only in this repo?
    │     └─ nested instructions file in that directory (or a path-scoped rule)
    │
    ├─ Applies across this whole repo, and nowhere else?
    │     └─ repository-level instructions file
    │
    ├─ Would it help in a second repo, or any project using this technology?
    │     └─ a skill
    │
    ├─ About how a particular agent works — its steps, its order, when it asks?
    │     └─ an agent / subagent definition
    │
    ├─ Needed by humans to use or set up the project?
    │     └─ README.md
    │
    └─ One-off intent for the work happening right now?
          └─ a spec file
```

### The second-repo test

Before writing a rule into a repository instructions file, ask: *"would this also help in another
repo?"* Teams consistently under-estimate this. Rules that feel repo-specific usually are not:

| Rule                                              | Feels like        | Actually belongs in |
| ------------------------------------------------- | ----------------- | ------------------- |
| "Validate all external input at the boundary"      | repo instructions | a skill             |
| "CI pipeline templates live in `ci/templates/`"    | repo instructions | a skill             |
| "This project uses npm, never yarn"                | repo instructions | repo instructions ✓ |
| "A resolved incident can never be reassigned"      | repo instructions | module instructions |

## The artifacts in detail

### Repository instructions — `AGENTS.md` / `CLAUDE.md` / `.github/copilot-instructions.md`

Loaded into **every** session, so every line costs tokens in every conversation. Target under 200
lines. Keep it to facts the agent needs constantly.

**Belongs here:** build/test commands, package manager, directory layout, layering rules, stack
versions, "always do X" rules unique to this repo.

**Does not belong here:** general language best practices (skill), multi-step procedures (skill),
this quarter's roadmap (spec), setup instructions for humans (README).

> **Tip:** keep one canonical file and import it from the others. This repo keeps `AGENTS.md` as the
> source of truth and `CLAUDE.md` is a three-line file containing `@AGENTS.md`.

### Skills — `SKILL.md`

Reusable know-how, loaded **only when relevant**. This is what makes them scale: you can have fifty
skills and pay context for none of them until one is needed.

**Belongs here:** language idioms and API preferences, framework patterns, review checklists, tool
usage procedures, anything that applies to more than one repository.

**Does not belong here:** this repo's directory structure, domain business rules, project-specific
naming schemes.

The distinction that trips people up:

- *"This project validates with zod"* → repository instructions (a project decision)
- *"When using zod, parse at the boundary and pass typed values inward"* → skill (a usage pattern)

### Agent / subagent definitions

Describe **who is working and in what order** — not how to write code.

**Belongs here:** the workflow steps, role and scope, which skills to invoke for which work, when to
stop and ask, output format, hard constraints like "one task at a time, commit after each".

**Does not belong here:** coding standards (skill), repo conventions (instructions), domain rules
(module instructions).

### Specs

The task itself: goal, constraints, acceptance criteria, and — critically — what is **out of scope**.
See `.claude/skills/writing-specs/` and the worked example in `spec/`.

### README.md

For humans. Agents read it, but it is not written for them.

## Precedence

When several files could apply, the more specific wins:

1. Module / path-scoped instructions
2. Repository instructions
3. Skills
4. Global or organisation-wide instructions

## Create new vs. extend existing

**Create a new instructions file** when a directory has accumulated three or more rules of its own,
or when a review surfaces domain rules nothing else covers.

**Create a new skill** when the pattern applies to two or more repositories, is about a technology
rather than a codebase, and you have roughly five or more rules to say about it. Fewer than that —
add them to an existing skill.

## Tool mapping

The concepts are portable; most of the filenames are not. Verified against official docs.

| Concept                  | Claude Code                              | GitHub Copilot CLI                    |
| ------------------------ | ---------------------------------------- | ------------------------------------- |
| Repository instructions  | `CLAUDE.md`                              | `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md` |
| Module-scoped rules      | nested `CLAUDE.md`, `.claude/rules/`     | nested `AGENTS.md`                    |
| **Skill**                | `.claude/skills/<name>/SKILL.md`         | **reads `.claude/skills/` too** — plus `.github/skills/`, `.agents/skills/` |
| Subagent                 | `.claude/agents/<name>.md`               | `.github/agents/<name>.agent.md`      |
| Reusable prompt          | `.claude/commands/<name>.md`             | *no CLI equivalent* — `.github/prompts/<name>.prompt.md` is **IDE-only** |
| Team distribution        | plugin + plugin marketplace              | plugin + plugin marketplace (`/plugin`) |
| Inspect what actually loaded | `/context`                           | `/instructions`, `/env`               |
| External tool access     | `.mcp.json`                              | `mcp.json`                            |

Two rows deserve attention.

**Skills are genuinely portable.** Copilot CLI officially reads `.claude/skills/`, so one skill
in one directory works in both tools — no copying, no sync script. Skills are the best-value
artifact you can write.

**`/context` means different things in the two tools.** In Claude Code it lists the loaded
memory files. In Copilot CLI it is a context-window *token usage* meter and says nothing about
which instruction files loaded — use `/instructions` or `/env` there. This catches people out
constantly, including when verifying that your context is working at all.
