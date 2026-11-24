import { isFresh, ticketToStart, verifySignature, type LinearIssueWebhook } from "@/lib/linear-webhook";

// Linear → this endpoint → GitHub "Claude: start ticket" workflow.
// Adding the trigger label (default "claude") to a Linear issue starts phase 1 for that ticket.
//
// Vercel environment variables:
//   LINEAR_WEBHOOK_SECRET   signing secret shown when you create the webhook in Linear
//   GITHUB_DISPATCH_TOKEN   fine-grained GitHub token with Actions: Read and write on this repo
//   GITHUB_REPOSITORY       optional "owner/repo"; defaults to the repo Vercel deploys from
//   TRIGGER_LABEL           optional; defaults to "claude"

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.LINEAR_WEBHOOK_SECRET ?? "";
  const token = process.env.GITHUB_DISPATCH_TOKEN ?? "";
  const repo =
    process.env.GITHUB_REPOSITORY ??
    (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : "");
  if (!secret || !token || !repo) {
    return Response.json({ error: "webhook not configured" }, { status: 500 });
  }

  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("linear-signature"), secret)) {
    return Response.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: LinearIssueWebhook;
  try {
    payload = JSON.parse(raw);
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!isFresh(payload.webhookTimestamp)) {
    return Response.json({ error: "stale delivery" }, { status: 400 });
  }

  const ticket = ticketToStart(payload, process.env.TRIGGER_LABEL ?? "claude");
  if (!ticket) return Response.json({ started: false });

  const res = await fetch(
    `https://api.github.com/repos/${repo}/actions/workflows/claude-ticket.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ ref: "main", inputs: { ticket } }),
    },
  );
  if (!res.ok) {
    console.error("GitHub dispatch failed", res.status, await res.text());
    return Response.json({ error: "could not start workflow" }, { status: 502 });
  }
  return Response.json({ started: true, ticket });
}
