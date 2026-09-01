# conplement AI Showcase: Context Engineering for Coding Agents

A workshop repository. It contains a deliberately tiny incident-tracker API, and — more importantly —
a complete, working example of the context that makes an AI coding agent productive on it.

The service is the excuse. The context is the point.

## The idea in one line

> **Skills are what the agent knows. Specs are what the agent is doing.** Everything else is
> plumbing.

## Repository tour

| Path                              | What it is                                                        |
| --------------------------------- | ----------------------------------------------------------------- |
| `src/`, `tests/`                  | The incident tracker: layered TypeScript/Node service              |
| `AGENTS.md`                       | **Canonical** repository instructions — durable, loaded every session |
| `CLAUDE.md`                       | Three lines: imports `AGENTS.md` so Claude Code sees the same thing |
| `.github/copilot-instructions.md` | Behavioural preferences for Copilot; points at `AGENTS.md`         |
| `.claude/skills/`                 | Reusable know-how, loaded only when relevant                       |
| `.claude/agents/`                 | A subagent definition — who works, in what order                   |
| `.claude/commands/`               | A reusable prompt (`/spec`)                                        |
| `spec/`                           | Task intent — one file per ticket, ephemeral                       |
| `docs/context-file-taxonomy.md`   | **Where does this rule go?** The routing table                     |
| `scripts/sync-context.sh`         | Mirrors `.claude/` into `.github/` — the distribution stopgap       |
| `workshop/`                       | Slides and facilitator notes                                       |

## Running it

Requires Node >= 22.18. There is no build step — Node runs the TypeScript directly.

```bash
npm install
npm test              # 7 tests, ~120ms
npm run typecheck     # the real linter; tests do NOT catch type errors
npm start             # :3000
```

```bash
curl -X POST localhost:3000/incidents \
  -H 'content-type: application/json' \
  -d '{"title":"Pump offline","severity":"HIGH"}'
```

## The unimplemented spec

`spec/1042-incident-comments.md` describes a feature that is **deliberately not built**. It is the
live-demo target: point an agent at it and watch what a good spec buys you — particularly the
out-of-scope list.

## Using this as a starting point

1. Copy `AGENTS.md` and cut it down to your project. Keep it under 200 lines
2. Copy `docs/context-file-taxonomy.md` verbatim — it is stack-agnostic
3. Delete the skills and write your own. The `description` frontmatter is the hard part
4. Copy `.claude/skills/writing-specs/` as-is; adapt the template
5. Add `CLAUDE.md` with a single `@AGENTS.md` import so you keep one source of truth
