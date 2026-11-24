---
description: Pick up one Linear ticket assigned to the "Claude" user and run the next lifecycle phase for it
---

You are the Linear watcher. A scheduled task runs you every few minutes on the developer's Mac.
Each run handles **at most one ticket**, then stops.

## Settings (edit these to match your Linear workspace)

| Setting                              | Value               |
| ------------------------------------ | ------------------- |
| Claude's Linear user (assignee name) | `Claude`            |
| New work status                      | `Todo`              |
| Gate 1 passed status                 | `Approved`          |
| Revise the spec status               | `Changes requested` |
| Claude is working (acts as a lock)   | `In Progress`       |

## 0. Preflight

1. You need the Linear MCP tools. If they aren't available or aren't signed in, stop and report `Linear not connected — run /mcp and sign in to linear`.
2. `git switch main && git pull --ff-only`. If the working tree has uncommitted changes, stop and report it. Never discard someone's work.
3. If `node_modules` is missing, run `npm ci`.

## 1. Find one ticket

Search Linear for issues **assigned to `Claude`** whose status is `Approved`, `Changes requested` or `Todo`.

- None found → end the run with `No tickets for Claude.` and do nothing else.
- Otherwise pick one: `Approved` first, then `Changes requested`, then `Todo`; oldest first within each.

## 2. Lock it

Before doing anything else, set the ticket's status to `In Progress` and comment `🤖 Claude picked this up: <phase name>`.
This stops the next run from picking the same ticket.

## 3. Run the phase

### Status was `Todo` → Phase 1: spec + design

Follow `.claude/commands/spec.md` for the ticket ID. If the ticket's branch already exists on `origin`, switch to it and continue from there.
For the PR, use `gh pr create --draft` (or the GitHub connector's create-pull-request tool if `gh` isn't signed in).
Then comment on the ticket:

> 🤖 Spec and clickable prototype are ready: <PR link>. Prototype: `/prototypes/<lowercase-id>.html` on the PR's Vercel preview.
> **Your turn (Gate 1):** move this ticket to **Approved** to start building, or add a comment with what to change and move it to **Changes requested**.

### Status was `Changes requested` → revise spec + design

Switch to the ticket's branch and pull. Read the ticket's comments added since Claude's last comment, plus any PR review comments.
Change only `specs/` and `public/prototypes/` to address them, then commit and push.
Comment a short list of what changed, and repeat the Gate 1 instructions above.

### Status was `Approved` → Phases 2–3: build, test, ship

A human moving the ticket to `Approved` **is** the Gate 1 approval.
Switch to the ticket's branch and pull, then follow `.claude/commands/build.md` and `.claude/commands/ship.md`.
Finish with a Linear comment: PR link, preview link, what changed, the AC → test table, and

> **Your turn (Gate 2):** review the PR and preview, then merge. Merging deploys to production.

If checks still fail after a real attempt to fix them, push what you have, comment `🤖 Blocked: <reason>` and stop.

## Rules

- One ticket per run. Never touch tickets that aren't assigned to `Claude`.
- Never merge, never push to `main`, never force-push, never deploy to production.
- Leave the status as `In Progress` when you finish a phase. Linear's GitHub integration moves it to In Review or Done from PR events, and a human moves it to `Approved` or `Changes requested`.
- End every run with one line: `<ticket ID>: <what you did>`, or `No tickets for Claude.`
