# CLAUDE.md

This repo runs an **agent-driven SDLC**: Linear ticket → spec + design → code + tests → PR + preview → human approval → production. Claude does the work; a human approves at every gate. Never skip a gate.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4, source in `src/`
- Unit/component tests: Vitest + Testing Library (`*.test.ts(x)` next to the code)
- End-to-end tests: Playwright (`e2e/*.spec.ts`)
- Hosting: Vercel (preview deploy per PR, production on merge to `main`)
- Tickets: Linear. Ticket IDs look like `ABC-123`.

## Commands

| Task                             | Command                                                                 |
| -------------------------------- | ----------------------------------------------------------------------- |
| Dev server                       | `npm run dev`                                                           |
| Lint / types                     | `npm run lint` · `npm run typecheck`                                    |
| Unit tests                       | `npm test`                                                              |
| E2E tests                        | `npm run test:e2e` (set `PLAYWRIGHT_BASE_URL` to test a Vercel preview) |
| Everything CI runs               | `npm run check`                                                         |
| Read a Linear ticket without MCP | `node scripts/linear.mjs get ABC-123`                                   |

## The lifecycle (follow it exactly)

| Phase            | Who                       | Output                                                          | Gate                                                        |
| ---------------- | ------------------------- | --------------------------------------------------------------- | ----------------------------------------------------------- |
| 1. Spec + design | Claude (`/spec ABC-123`)  | `specs/ABC-123.md` + `public/prototypes/abc-123.html`, draft PR | **Gate 1:** human approves the spec and prototype on the PR |
| 2. Build + test  | Claude (`/build ABC-123`) | Code, unit tests, e2e tests, green `npm run check`              | —                                                           |
| 3. Ship          | Claude (`/ship ABC-123`)  | PR marked ready, Vercel preview, Linear comment                 | **Gate 2:** human reviews code + preview and merges         |
| 4. Deploy        | Vercel                    | Production deploy from `main`; Linear moves to Done             | Merge = deploy approval                                     |

Rules:

- **Do not write application code before Gate 1 is approved.** Approval is a human comment on the PR such as `@claude approved — build it`, or the user saying so in a local session.
- Every acceptance criterion in the spec must map to at least one test. List the mapping in the PR description.
- Branch name = the Linear `branchName` for the ticket (it contains the ticket ID, so Linear links the PR automatically). PR body must contain `Fixes ABC-123`.
- Never merge, never deploy to production, never force-push. Those are human actions.
- If requirements are unclear, ask in the PR / Linear comment instead of guessing.

## When invoked from GitHub (`@claude` on a PR)

Work out the phase from the branch's `specs/` file and the PR conversation:

- Spec exists, no approval yet, and the comment is feedback → revise the spec/prototype only.
- Comment approves the spec → follow `.claude/commands/build.md`, then push.
- Code exists and the comment is review feedback → fix it, keep `npm run check` green, push.

## Code conventions

- Server Components by default; add `"use client"` only for interactivity.
- Components in `src/components/<Name>.tsx`, one component per file, with a `<Name>.test.tsx` beside it.
- Use Tailwind utility classes and the CSS variables in `src/app/globals.css`; no new UI libraries without asking.
- Accessible by default: semantic HTML, labelled controls, visible focus, WCAG AA contrast.
- Never log, commit or put in tests any real patient data, secrets or `.env` values. Use obviously fake fixtures.
