import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { isFresh, ticketToStart, verifySignature, type LinearIssueWebhook } from "./linear-webhook";

const claude = { id: "lbl-claude", name: "claude" };
const bug = { id: "lbl-bug", name: "Bug" };

function issue(overrides: Partial<LinearIssueWebhook>): LinearIssueWebhook {
  return { type: "Issue", action: "update", data: { identifier: "SUR-1", labels: [claude] }, ...overrides };
}

describe("verifySignature", () => {
  const body = '{"hello":"world"}';
  const sig = createHmac("sha256", "s3cret").update(body).digest("hex");

  it("accepts a correct signature", () => expect(verifySignature(body, sig, "s3cret")).toBe(true));
  it("rejects a wrong secret", () => expect(verifySignature(body, sig, "other")).toBe(false));
  it("rejects a tampered body", () => expect(verifySignature(body + " ", sig, "s3cret")).toBe(false));
  it("rejects a missing or malformed signature", () => {
    expect(verifySignature(body, null, "s3cret")).toBe(false);
    expect(verifySignature(body, "zz", "s3cret")).toBe(false);
  });
});

describe("isFresh", () => {
  it("accepts recent deliveries and rejects old or missing timestamps", () => {
    expect(isFresh(1_000_000, 1_030_000)).toBe(true);
    expect(isFresh(1_000_000, 1_100_000)).toBe(false);
    expect(isFresh(undefined)).toBe(false);
  });
});

describe("ticketToStart", () => {
  it("starts when the label is newly added", () => {
    expect(ticketToStart(issue({ updatedFrom: { labelIds: ["lbl-bug"] } }), "claude")).toBe("SUR-1");
  });

  it("starts when an issue is created with the label", () => {
    expect(ticketToStart(issue({ action: "create" }), "claude")).toBe("SUR-1");
  });

  it("matches the label name case-insensitively", () => {
    expect(ticketToStart(issue({ action: "create" }), "Claude")).toBe("SUR-1");
  });

  it("ignores other edits to an issue that already had the label", () => {
    expect(ticketToStart(issue({ updatedFrom: { labelIds: ["lbl-claude"] } }), "claude")).toBeNull();
    expect(ticketToStart(issue({ updatedFrom: {} }), "claude")).toBeNull();
  });

  it("ignores issues without the label, non-issue events and removals", () => {
    expect(
      ticketToStart(issue({ data: { identifier: "SUR-1", labels: [bug] }, action: "create" }), "claude"),
    ).toBeNull();
    expect(ticketToStart(issue({ type: "Comment", action: "create" }), "claude")).toBeNull();
    expect(ticketToStart(issue({ action: "remove" }), "claude")).toBeNull();
  });

  it("rejects malformed ticket identifiers", () => {
    expect(
      ticketToStart(
        issue({ action: "create", data: { identifier: "x; rm -rf", labels: [claude] } }),
        "claude",
      ),
    ).toBeNull();
  });
});
