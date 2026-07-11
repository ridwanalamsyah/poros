// POST /api/react
//
// Stores a GLOBAL like/dislike count per article, so every visitor sees the
// same number (unlike the old version, which only tallied clicks inside each
// visitor's own browser via localStorage and always started back at 0).
//
// The Sanity write token lives ONLY in this server-side function (env var
// SANITY_WRITE_TOKEN, no VITE_ prefix -> never bundled into client JS).
// The client only ever talks to this endpoint, never to Sanity directly for
// writes.
//
// Required Vercel project env vars (Production + Preview):
//   SANITY_PROJECT_ID    (same value as VITE_SANITY_PROJECT_ID)
//   SANITY_DATASET       (same value as VITE_SANITY_DATASET, default "production")
//   SANITY_WRITE_TOKEN   (Sanity -> API -> Tokens -> create token with "Editor" access)
//
// Known limitation: there is no per-visitor auth, so the only thing stopping
// someone from scripting repeat requests is that the client only sends a
// request when its localStorage "picked" state actually changes. This is
// fine for a small magazine's reader reactions, not bullet-proof against a
// determined abuser. If that becomes a problem later, add IP-based rate
// limiting (e.g. Vercel Edge Config / Upstash) in front of this handler.

import { createClient } from "@sanity/client";

type ReactRequestBody = {
  articleId?: unknown;
  next?: unknown;
  previous?: unknown;
};

// Reaction labels are editor-configurable (Sanity Settings -> reactionLabels),
// so we can't hardcode "Like"/"Dislike" here. Instead we allow-list the
// *shape* of a label to stop anyone from injecting a GROQ/patch path via the
// request body (e.g. "x.evilField" or "__proto__").
const LABEL_PATTERN = /^[\p{L}\p{N} '’!?-]{1,24}$/u;

function isValidLabel(value: unknown): value is string {
  return typeof value === "string" && LABEL_PATTERN.test(value);
}

function readEnv(name: string): string | undefined {
  return process.env[name];
}

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const projectId = readEnv("SANITY_PROJECT_ID") ?? readEnv("VITE_SANITY_PROJECT_ID");
  const dataset = readEnv("SANITY_DATASET") ?? readEnv("VITE_SANITY_DATASET") ?? "production";
  const token = readEnv("SANITY_WRITE_TOKEN");

  if (!projectId || !token) {
    res.status(500).json({ error: "Server is not configured for reactions yet (missing SANITY_WRITE_TOKEN)." });
    return;
  }

  let body: ReactRequestBody;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
  } catch {
    res.status(400).json({ error: "Invalid JSON body" });
    return;
  }

  const { articleId, next, previous } = body;

  if (typeof articleId !== "string" || articleId.trim().length === 0) {
    res.status(400).json({ error: "articleId is required" });
    return;
  }
  if (next !== null && !isValidLabel(next)) {
    res.status(400).json({ error: "invalid `next` label" });
    return;
  }
  if (previous !== null && !isValidLabel(previous)) {
    res.status(400).json({ error: "invalid `previous` label" });
    return;
  }
  if (next === previous) {
    res.status(400).json({ error: "`next` and `previous` must differ" });
    return;
  }

  const sanity = createClient({
    projectId,
    dataset,
    token,
    apiVersion: "2024-10-01",
    useCdn: false,
  });

  try {
    let patch = sanity.patch(articleId);
    let touched = false;

    if (previous) {
      const path = `reactionCounts.${previous}`;
      patch = patch.setIfMissing({ [path]: 0 }).dec({ [path]: 1 });
      touched = true;
    }
    if (next) {
      const path = `reactionCounts.${next}`;
      patch = patch.setIfMissing({ [path]: 0 }).inc({ [path]: 1 });
      touched = true;
    }

    if (!touched) {
      res.status(400).json({ error: "Nothing to update" });
      return;
    }

    const result = await patch.commit({ returnDocuments: true, autoGenerateArrayKeys: false });
    const counts: Record<string, number> = { ...(result?.reactionCounts ?? {}) };

    // Clamp any stray negative values (can only happen if two conflicting
    // requests race each other) so the UI never shows "-1".
    for (const key of Object.keys(counts)) {
      if (typeof counts[key] === "number" && counts[key] < 0) counts[key] = 0;
    }

    res.status(200).json({ counts });
  } catch (err: any) {
    const message = typeof err?.message === "string" ? err.message : "Unknown error";
    // Sanity throws a "not found" style error if the article doc doesn't
    // exist yet in this dataset (e.g. site is still running on mock/demo
    // content that was never actually written to Sanity).
    if (message.toLowerCase().includes("not found") || message.toLowerCase().includes("404")) {
      res.status(404).json({ error: "Article not found in Sanity. Reactions only work on real, published Sanity documents." });
      return;
    }
    console.error("[api/react] failed:", message);
    res.status(500).json({ error: "Failed to save reaction" });
  }
}
