import { createHmac, timingSafeEqual } from "node:crypto";

/** Shape of the parts of a Linear "Issue" webhook payload we use. */
export type LinearIssueWebhook = {
  action?: "create" | "update" | "remove" | string;
  type?: string;
  webhookTimestamp?: number;
  data?: {
    identifier?: string;
    labelIds?: string[];
    labels?: { id: string; name: string }[];
  };
  updatedFrom?: { labelIds?: string[] };
};

const TICKET_ID = /^[A-Z][A-Z0-9]*-\d+$/;

/** Linear signs the raw body with HMAC-SHA256 (hex) using the webhook's signing secret. */
export function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const given = Buffer.from(signature, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

/** Rejects replayed deliveries: Linear's webhookTimestamp must be within maxAgeMs of now. */
export function isFresh(webhookTimestamp: number | undefined, now = Date.now(), maxAgeMs = 60_000): boolean {
  return typeof webhookTimestamp === "number" && Math.abs(now - webhookTimestamp) <= maxAgeMs;
}

/**
 * Returns the ticket ID to start when the trigger label was just added to an issue
 * (on create, or on an update where the label wasn't there before). Otherwise null.
 */
export function ticketToStart(payload: LinearIssueWebhook, triggerLabel: string): string | null {
  if (payload.type !== "Issue") return null;
  const id = payload.data?.identifier;
  if (!id || !TICKET_ID.test(id)) return null;

  const label = payload.data?.labels?.find((l) => l.name.toLowerCase() === triggerLabel.toLowerCase());
  if (!label) return null;

  if (payload.action === "create") return id;
  if (payload.action === "update") {
    const before = payload.updatedFrom?.labelIds;
    if (Array.isArray(before) && !before.includes(label.id)) return id;
  }
  return null;
}
