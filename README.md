# ADLC Starter: agent-driven software delivery

Linear ticket → spec + design → code + tests → PR + preview → production. Claude Code does the work. A person approves at two gates.

```
 Linear ticket ──► [1] SPEC + DESIGN ──► GATE 1 ──► [2] BUILD + TEST ──► [3] PR + PREVIEW ──► GATE 2 ──► [4] PRODUCTION
                  Claude: spec.md +      you approve   Claude: code,       Claude: PR ready,     you review   Vercel deploys main,
                  clickable prototype    on the PR     unit + e2e tests    Vercel preview        and merge    Linear → Done
```

| Phase            | Local (Claude Code)                                           | Automated (GitHub)                                    |
| ---------------- | ------------------------------------------------------------- | ----------------------------------------------------- |
| 1. Spec + design | `/spec ABC-123`                                               | Actions → **Claude: start ticket** → ticket ID        |
| Gate 1           | Tell Claude "approved"                                        | Comment `@claude approved — build it` on the draft PR |
| 2. Build + test  | `/build ABC-123`                                              | Runs from that comment                                |
| 3. Ship          | `/ship ABC-123`                                               | `@claude ship it`                                     |
| Gate 2           | Review the PR and Vercel preview, then merge                  | Same                                                  |
| 4. Deploy        | Vercel deploys `main` to production; Linear closes the ticket | Same                                                  |

## What's in the repo

| Path                    | Purpose                                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------------- |
| `CLAUDE.md`             | Rules every Claude run follows: phases, gates, conventions                                               |
| `.claude/commands/`     | `/spec`, `/build`, `/ship` phase commands                                                                |
| `.claude/agents/`       | `ui-designer`, `test-engineer`, `code-reviewer` subagents                                                |
| `.claude/settings.json` | Permissions (merge, force-push and prod deploy are blocked) and a Prettier hook                          |
| `.mcp.json`             | Linear and Vercel MCP servers for anyone who opens the repo in Claude Code                               |
| `specs/`                | One spec per ticket (`_TEMPLATE.md` is the format)                                                       |
| `public/prototypes/`    | Clickable HTML prototypes, served on every Vercel preview                                                |
| `scripts/linear.mjs`    | Reads tickets and posts comments in CI                                                                   |
| `.github/workflows/`    | `ci.yml` (lint, types, unit, build, e2e), `claude-ticket.yml` (phase 1), `claude.yml` (`@claude` on PRs) |

## One-time setup

### 1. Local tools

```bash
npm install
npx playwright install chromium
```

Install the GitHub CLI so `/ship` can mark PRs ready:

```bash
brew install gh && gh auth login
```

### 2. Connect Linear and Vercel to Claude Code

Open this folder in Claude Code and run `/mcp`. Authorise **linear** and **vercel** from `.mcp.json`, each with a browser sign-in.

### 3. Linear

1. Install the **GitHub** integration: Linear → Settings → Integrations → GitHub. Linear then links PRs by ticket ID in the branch name, moves the ticket to _In Progress_ when a PR opens, and to _Done_ on merge.
2. Create a personal API key: Settings → Security & access → API keys. It's used by `scripts/linear.mjs` in CI.
3. Optional: add a label such as `agent-ready` so the team knows which tickets are clear enough to hand to Claude.

### 4. GitHub

1. Install the Claude GitHub app on this repo. In Claude Code, run `/install-github-app`, or go to <https://github.com/apps/claude>.
2. Repo → Settings → Secrets and variables → Actions:

   | Secret                | Value                                                                                                              |
   | --------------------- | ------------------------------------------------------------------------------------------------------------------ |
   | `ANTHROPIC_API_KEY`   | Anthropic Console key (or use `CLAUDE_CODE_OAUTH_TOKEN` from `claude setup-token` and change the workflows' input) |
   | `LINEAR_API_KEY`      | From step 3.2                                                                                                      |
   | `GH_PAT` _(optional)_ | Fine-grained token with contents + pull-requests write, so phase-1 draft PRs trigger CI                            |

3. Branch protection on `main`: require a pull request, 1 approval, and the **CI** checks to pass. This makes Gate 2 enforceable.

### 5. Vercel

Import the repo at <https://vercel.com/new>. Every PR gets a preview deploy, and merging to `main` deploys production. To gate production further, turn on Vercel's protected production promotion or a GitHub `production` environment with required reviewers.

## Run a ticket end to end

1. Write a Linear ticket with a clear user story and acceptance criteria.
2. Run **Claude: start ticket** with its ID (or `/spec ABC-123` locally). You get a draft PR with `specs/ABC-123.md` and a prototype at `/prototypes/abc-123.html` on the preview.
3. Comment on the PR with changes, or `@claude approved — build it`.
4. Claude implements, writes tests for every AC, keeps CI green, and pushes. Review the code and the preview.
5. Merge. Vercel ships it and Linear closes the ticket.

## Safety rails

- Claude cannot merge, force-push or deploy to production: `.claude/settings.json` blocks it and `CLAUDE.md` forbids it.
- Only repo collaborators with write access can trigger `@claude`.
- No real patient data or secrets in tickets, specs, fixtures or logs. Claude reads whatever is in the Linear ticket.
