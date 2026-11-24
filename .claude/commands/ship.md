---
description: Phase 3 — hand a built ticket to a human for review and production deploy
argument-hint: <LINEAR-ID e.g. ABC-123>
---

Ticket: **$ARGUMENTS**

1. Confirm `npm run check` is green and the branch is pushed.
2. Mark the PR ready for review: `gh pr ready`.
3. Find the Vercel preview URL (PR checks / Vercel bot comment, or the Vercel MCP tools). Optionally run the e2e suite against it: `PLAYWRIGHT_BASE_URL=<preview-url> npm run test:e2e`.
4. Post a Linear comment on $ARGUMENTS: PR link, preview link, what changed, and the AC → test table.
5. **Stop at Gate 2.** A human reviews the code and preview and merges. Merging to `main` deploys to production on Vercel, and Linear moves the ticket to Done. Never merge or deploy yourself.
