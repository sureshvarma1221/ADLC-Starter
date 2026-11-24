---
description: Phase 2 — implement an approved spec with unit and e2e tests
argument-hint: <LINEAR-ID e.g. ABC-123>
---

Ticket: **$ARGUMENTS**

1. **Check Gate 1.** Read `specs/$ARGUMENTS.md`. Confirm a human approved it (PR comment or the user in this session). If not, stop and say so.

2. **Plan.** List the files you will add or change and which AC each change serves. Keep the change to what the spec asks for.

3. **Implement** the UI to match `public/prototypes/<lowercase-id>.html`, following the conventions in CLAUDE.md. Reuse existing components before adding new ones.

4. **Test.** Delegate to the `test-engineer` subagent with the spec's AC list. It writes Vitest tests beside components and Playwright tests in `e2e/`, one or more per AC.

5. **Verify.** Run `npm run check` and `npm run test:e2e`. Fix failures at the cause; never skip or weaken a test to make it pass.

6. **Self-review.** Delegate to the `code-reviewer` subagent and fix every issue it rates as must-fix.

7. **Commit and push** with message `$ARGUMENTS: <summary>`. Update the PR description's AC → test table. Then continue with `/ship $ARGUMENTS` when the user or the PR comment asks for it.
