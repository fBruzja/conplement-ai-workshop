# Incident Tracker — Agent Guide

A deliberately small TypeScript/Node service used to demonstrate context engineering for AI coding
agents. The code is real and runnable; the interesting part is the context around it.

## Stack and tooling

- **Node >= 22.18** running TypeScript **directly** via native type stripping — there is no build step
- **npm** is the package manager. Never create `yarn.lock` or `pnpm-lock.yaml`
- **express 5** for HTTP, **zod 4** for validation, **`node:test`** for tests
- ESM only (`"type": "module"`)

## Commands

```bash
npm test                                        # all tests (~120ms)
node --test tests/incident-service.test.ts      # a single test file
node --test --test-name-pattern "assign"        # a single test by name
npm run typecheck                               # tsc --noEmit — the real linter here
npm start                                       # serve on :3000
```

Always run `npm run typecheck` alongside `npm test`. Tests execute stripped types, so type errors do
**not** fail the test run.

## Erasable syntax only

Because Node strips types rather than compiling them, TypeScript syntax that emits runtime code is
banned and enforced by `erasableSyntaxOnly` in `tsconfig.json`:

- No `enum` — use `as const` arrays plus a derived union type (see `src/domain/incident.ts`)
- No constructor parameter properties (`constructor(private readonly x: T)`) — declare the field
  explicitly and assign in the body
- No `namespace`, no experimental decorators

This is the single most common mistake an agent makes in this repo.

## Layering

Dependencies point in one direction only: `api` → `service` → `repository` → `domain`.

| Layer        | Directory         | Responsibility                                                        |
| ------------ | ----------------- | --------------------------------------------------------------------- |
| `api`        | `src/api/`        | HTTP routing, zod validation, error → status mapping. No business logic |
| `service`    | `src/service/`    | Business rules, status transitions. Owns commands and DTOs             |
| `repository` | `src/repository/` | Persistence. Returns domain objects                                    |
| `domain`     | `src/domain/`     | Types, constants, transition rules. Depends on nothing                 |

The service layer accepts `*Command` objects and returns `*Dto` objects. The api layer never reaches
past the service into the repository.

## Import convention

Relative imports carry the **`.ts` extension** (`import { x } from './foo.ts'`). This is required by
native type stripping and is not a mistake.

## Where things are documented

| Question                                  | File                                    |
| ----------------------------------------- | --------------------------------------- |
| How do I write code in this stack?        | `.claude/skills/typescript-api-conventions/` |
| How do I write a spec?                    | `.claude/skills/writing-specs/`         |
| Where does a new rule belong?             | `docs/context-file-taxonomy.md`         |
| What are we building next?                | `spec/`                                 |
