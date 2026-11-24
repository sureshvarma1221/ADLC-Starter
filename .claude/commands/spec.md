---
description: Phase 1 — turn a Linear ticket into a spec and a clickable UI prototype, then stop for approval
argument-hint: <LINEAR-ID e.g. ABC-123>
---

Ticket: **$ARGUMENTS**

1. **Read the ticket.** Use the Linear MCP tools to fetch $ARGUMENTS (title, description, comments, attachments, labels, `branchName`). If Linear MCP isn't connected, run `node scripts/linear.mjs get $ARGUMENTS`. If the ticket is too vague to write testable acceptance criteria, stop and list your questions.

2. **Branch.** `git switch -c <branchName from Linear>` (or switch to it if it exists).

3. **Write `specs/$ARGUMENTS.md`** from `specs/_TEMPLATE.md`: problem, scope / out of scope, numbered acceptance criteria (AC-1, AC-2… each one testable), UI states (empty, loading, error, success), data and API needs, risks, and a test plan that maps every AC to a unit or e2e test.

4. **Design.** Delegate to the `ui-designer` subagent: it writes a self-contained clickable prototype at `public/prototypes/<lowercase-id>.html` covering every UI state in the spec. It is served on the Vercel preview at `/prototypes/<lowercase-id>.html`.

5. **Open a draft PR** titled `$ARGUMENTS: <ticket title>` using `.github/pull_request_template.md`, with `Fixes $ARGUMENTS`, a link to the spec, and the prototype path. Commit only `specs/` and `public/prototypes/`.

6. **Stop at Gate 1.** Post a short Linear comment (via MCP, or `node scripts/linear.mjs comment $ARGUMENTS "<text>"`) with the PR link and say a human must approve the spec and prototype before any code is written. Do not continue to the build phase in this run.
